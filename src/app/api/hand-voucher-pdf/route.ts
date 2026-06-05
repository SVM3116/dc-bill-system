import "regenerator-runtime/runtime";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, PDFOperator, PDFHexString, PDFNumber } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0; // Fresh PDF every time

// Format date helper (e.g. 2026-06-02 -> 02-06-2026)
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "";
  }
}

function formatWatermarkTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hoursStr = String(hours).padStart(2, "0");

  return `${day}-${month}-${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

// Timezone-independent date parser
function parseDateParts(dateStr: string) {
  const parts = dateStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return { year, month, day };
}

// Calculate Academic Year
function getAcademicYear(dateStr: string): string {
  const { year, month } = parseDateParts(dateStr);
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

// Split text into Kannada and Latin runs
interface TextRun {
  text: string;
  isKannada: boolean;
}

function splitTextIntoRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentRun = "";
  let currentIsKannada = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    const isKannada = (code >= 0x0C80 && code <= 0x0CFF) || code >= 0x0100;
    const isNeutral =
      char === " " ||
      char === "/" ||
      char === "-" ||
      char === ":" ||
      char === "," ||
      char === "." ||
      char === "(" ||
      char === ")" ||
      (char >= "0" && char <= "9");

    if (currentRun === "") {
      currentRun = char;
      currentIsKannada = isKannada;
    } else {
      if (isNeutral) {
        currentRun += char;
      } else if (isKannada === currentIsKannada) {
        currentRun += char;
      } else {
        runs.push({ text: currentRun, isKannada: currentIsKannada });
        currentRun = char;
        currentIsKannada = isKannada;
      }
    }
  }

  if (currentRun !== "") {
    runs.push({ text: currentRun, isKannada: currentIsKannada });
  }

  return runs;
}

function getShapedKannadaWidth(text: string, font: any, size: number): number {
  try {
    const fkFont = font.embedder.font;
    const unitsPerEm = fkFont.unitsPerEm;
    const scale = size / unitsPerEm;
    const run = fkFont.layout(text);
    let width = 0;
    for (const pos of run.positions) {
      width += pos.xAdvance;
    }
    return width * scale;
  } catch (err) {
    console.error("Error computing shaped width:", err);
    return font.widthOfTextAtSize(text, size);
  }
}

function getTextWidth(
  text: string,
  size: number,
  kannadaFont: any,
  latinFont: any
): number {
  const runs = splitTextIntoRuns(text);
  let totalWidth = 0;
  for (const run of runs) {
    if (run.isKannada) {
      totalWidth += getShapedKannadaWidth(run.text, kannadaFont, size);
    } else {
      totalWidth += latinFont.widthOfTextAtSize(run.text, size);
    }
  }
  return totalWidth;
}

function wrapTextByWidth(
  text: string,
  maxWidth: number,
  size: number,
  kannadaFont: any,
  latinFont: any
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  const dependent_vowels_list = ["್", "ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ", "ಂ", "ಃ"];

  for (const word of words) {
    const testLine = currentLine === "" ? word : currentLine + " " + word;
    const testWidth = getTextWidth(testLine, size, kannadaFont, latinFont);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine !== "") {
        lines.push(currentLine);
      }
      
      let tempWord = word;
      let tempWidth = getTextWidth(tempWord, size, kannadaFont, latinFont);
      
      while (tempWidth > maxWidth) {
        let splitIdx = 1;
        while (
          splitIdx < tempWord.length &&
          getTextWidth(tempWord.slice(0, splitIdx + 1), size, kannadaFont, latinFont) <= maxWidth
        ) {
          splitIdx++;
        }
        while (splitIdx > 0 && dependent_vowels_list.includes(tempWord[splitIdx])) {
          splitIdx--;
        }
        if (splitIdx > 1 && tempWord[splitIdx - 1] === "್") {
          splitIdx -= 2;
        }
        if (splitIdx <= 0) {
          splitIdx = 1;
        }
        lines.push(tempWord.slice(0, splitIdx));
        tempWord = tempWord.slice(splitIdx);
        tempWidth = getTextWidth(tempWord, size, kannadaFont, latinFont);
      }
      currentLine = tempWord;
    }
  }
  if (currentLine !== "") {
    lines.push(currentLine);
  }
  return lines;
}

function drawShapedText(
  page: any,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    font: any;
    color: any;
    isBold?: boolean;
  }
) {
  // Off-screen register
  page.drawText(text, {
    x: -1000,
    y: -1000,
    font: options.font,
    size: options.size,
  });

  page.setFont(options.font);
  const fontKey = page.fontKey;
  const embedder = options.font.embedder;
  const fkFont = embedder.font;
  const unitsPerEm = fkFont.unitsPerEm;
  const scale = options.size / unitsPerEm;

  const run = fkFont.layout(text);
  const glyphs = run.glyphs;
  const positions = run.positions;

  const operators: any[] = [];
  operators.push(PDFOperator.of("q" as any));
  operators.push(PDFOperator.of("BT" as any));
  operators.push(PDFOperator.of("Tf" as any, [fontKey, PDFNumber.of(options.size)] as any));
  
  const color = options.color || rgb(0.1, 0.1, 0.1);
  operators.push(
    PDFOperator.of("rg" as any, [
      PDFNumber.of(color.red),
      PDFNumber.of(color.green),
      PDFNumber.of(color.blue),
    ] as any)
  );

  if (options.isBold) {
    operators.push(PDFOperator.of("Tr" as any, [PDFNumber.of(2)] as any));
    const strokeWidth = options.size * 0.035;
    operators.push(PDFOperator.of("w" as any, [PDFNumber.of(strokeWidth)] as any));
    operators.push(
      PDFOperator.of("RG" as any, [
        PDFNumber.of(color.red),
        PDFNumber.of(color.green),
        PDFNumber.of(color.blue),
      ] as any)
    );
  }

  let currentX = 0;
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
    const pos = positions[i];

    const hex = glyph.id.toString(16).toUpperCase().padStart(4, "0");
    const drawX = options.x + (currentX + pos.xOffset) * scale;
    const drawY = options.y + pos.yOffset * scale;

    operators.push(
      PDFOperator.of("Tm" as any, [
        PDFNumber.of(1),
        PDFNumber.of(0),
        PDFNumber.of(0),
        PDFNumber.of(1),
        PDFNumber.of(drawX),
        PDFNumber.of(drawY),
      ] as any)
    );
    operators.push(PDFOperator.of("Tj" as any, [PDFHexString.of(hex)] as any));

    currentX += pos.xAdvance;
  }

  operators.push(PDFOperator.of("ET" as any));
  operators.push(PDFOperator.of("Q" as any));

  page.pushOperators(...operators);
}

function drawMixedText(
  page: any,
  text: string,
  options: {
    x: number;
    y: number;
    size: number;
    kannadaFont: any;
    latinFont: any;
    color: any;
    isBold?: boolean;
  }
) {
  const runs = splitTextIntoRuns(text);
  let currentX = options.x;
  for (const run of runs) {
    if (run.isKannada) {
      drawShapedText(page, run.text, {
        x: currentX,
        y: options.y,
        size: options.size,
        font: options.kannadaFont,
        color: options.color,
        isBold: options.isBold,
      });
      currentX += getShapedKannadaWidth(run.text, options.kannadaFont, options.size);
    } else {
      page.drawText(run.text, {
        x: currentX,
        y: options.y,
        size: options.size,
        font: options.latinFont,
        color: options.color,
      });
      currentX += options.latinFont.widthOfTextAtSize(run.text, options.size);
    }
  }
}

function drawCenteredMixedText(
  page: any,
  text: string,
  options: {
    centerX: number;
    y: number;
    size: number;
    kannadaFont: any;
    latinFont: any;
    color: any;
    isBold?: boolean;
  }
) {
  const totalWidth = getTextWidth(text, options.size, options.kannadaFont, options.latinFont);
  const startX = options.centerX - totalWidth / 2;
  drawMixedText(page, text, {
    ...options,
    x: startX,
  });
}

function drawRightAlignedMixedText(
  page: any,
  text: string,
  options: {
    rightX: number;
    y: number;
    size: number;
    kannadaFont: any;
    latinFont: any;
    color: any;
    isBold?: boolean;
  }
) {
  const totalWidth = getTextWidth(text, options.size, options.kannadaFont, options.latinFont);
  const startX = options.rightX - totalWidth;
  drawMixedText(page, text, {
    ...options,
    x: startX,
  });
}

// PDF GET Request Handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const download = searchParams.get("download") === "true";

    if (!id) {
      return new NextResponse("Missing Voucher ID", { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch voucher details
    const { data: voucher, error } = await supabase
      .from("hand_vouchers")
      .select("*, hand_voucher_items(*), schools(*)")
      .eq("id", id)
      .single();

    if (error || !voucher) {
      console.error("Voucher not found:", error);
      return new NextResponse("Voucher not found", { status: 404 });
    }

    // Enforce school isolation check
    if (voucher.school_id !== user.id) {
      return new NextResponse("Access Denied", { status: 403 });
    }

    // Resolve paths to font
    const fontPath = path.join(process.cwd(), "public", "fonts", "NudiUni01e.ttf");
    if (!fs.existsSync(fontPath)) {
      console.error("Font not found:", fontPath);
      return new NextResponse("Font file missing on server", { status: 500 });
    }
    const fontBytes = fs.readFileSync(fontPath);

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const customFont = await pdfDoc.embedFont(fontBytes);
    const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const latinBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Page Settings
    const page = pdfDoc.addPage([595.27, 841.89]); // A4 Size
    const fontColor = rgb(0.1, 0.1, 0.1);
    const borderColor = rgb(0.4, 0.4, 0.4);

    let yPos = 800;

    // 1. Voucher Number (Top Right)
    const voucherNumText = voucher.voucher_number || "";
    drawRightAlignedMixedText(page, voucherNumText, {
      rightX: 545,
      y: yPos,
      size: 10,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
    });

    yPos -= 30;

    // 2. Title (Centered)
    const titleText = "ಹಣ ಸಂದಾಯ ರಸೀದಿ";
    drawCenteredMixedText(page, titleText, {
      centerX: 297.63,
      y: yPos,
      size: 15,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    yPos -= 35;

    // 3. Intro Paragraph (Auto-generated)
    const schoolNameKn = voucher.schools?.school_name_kn || "ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ";
    const acadYear = getAcademicYear(voucher.voucher_date);
    const main = voucher.main_content ? voucher.main_content.trim() : "";

    const isTeacher = voucher.table_layout === "teacher";
    let introText = "";
    if (isTeacher) {
      // 2A. Guest Teacher Layout (For both cash and cheque)
      const chequeNum = voucher.cheque_number || "________";
      const chequeDateStr = voucher.cheque_date ? formatDate(voucher.cheque_date) : "__.__.____";
      introText = `${schoolNameKn}, ಇಲ್ಲಿ ${main} ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ಚೆಕ್ ಸಂಖ್ಯೆ :- ${chequeNum} / ${chequeDateStr} ರ ಮೂಲಕ ಗೌರವ ಧನ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
    } else {
      // Non-Teacher Layouts
      if (voucher.payment_mode === "cheque") {
        // 1A. Introduction paragraph for cheque
        const chequeNum = voucher.cheque_number || "________";
        const chequeDateStr = voucher.cheque_date ? formatDate(voucher.cheque_date) : "__.__.____";
        introText = `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ಚೆಕ್ ಸಂಖ್ಯೆ :- ${chequeNum} / ${chequeDateStr} ರ ಮೂಲಕ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
      } else {
        // 1B. Introduction paragraph for cash
        introText = `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear} ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ನಿಲಯಪಾಲಕರಿಂದ ನಗದಾಗಿ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
      }
    }

    const wrappedIntro = wrapTextByWidth(introText, 495, 11, customFont, latinFont);
    for (const line of wrappedIntro) {
      drawMixedText(page, line, {
        x: 50,
        y: yPos,
        size: 11,
        kannadaFont: customFont,
        latinFont: latinFont,
        color: fontColor,
      });
      yPos -= 18;
    }

    yPos -= 20;

    // 4. Table Layout Columns
    let colWidths: number[] = [];
    let colHeaders: string[] = [];

    if (voucher.table_layout === "teacher") {
      // Columns: ಕ್ರ.ಸಂ | ವಿವರ | ವಿಷಯ | ಮಾಹೆ | ದಿನಗಳು | ಮೊತ್ತ | ಷರಾ
      colWidths = [30, 130, 70, 75, 55, 75, 60];
      colHeaders = ["ಕ್ರ.ಸಂ", "ವಿವರ", "ವಿಷಯ", "ಮಾಹೆ", "ದಿನಗಳು", "ಮೊತ್ತ", "ಷರಾ"];
    } else if (voucher.table_layout === "milling") {
      // Columns: ಕ್ರ.ಸಂ | ಕೆಲಸದ ವಿವರ | ಮಾಹೆ | ದಿನಾಂಕ | ಪರಿಣಾಮ (ಕೆಜಿ) | ದರ ರೂ. | ಮೊತ್ತ ರೂ.
      colWidths = [30, 135, 80, 75, 65, 50, 60];
      colHeaders = ["ಕ್ರ.ಸಂ", "ಕೆಲಸದ ವಿವರ", "ಮಾಹೆ", "ದಿನಾಂಕ", "ಪರಿಣಾಮ (ಕೆಜಿ)", "ದರ ರೂ.", "ಮೊತ್ತ ರೂ."];
    } else if (voucher.table_layout === "labor") {
      // Columns: ಕ್ರ.ಸಂ | ವಿವರ | ಮಾಹೆ | ಪರಿಮಾಣ | ದರ | ಮೊತ್ತ | ಷರಾ
      colWidths = [30, 140, 80, 60, 50, 75, 60];
      colHeaders = ["ಕ್ರ.ಸಂ", "ವಿವರ", "ಮಾಹೆ", "ಪರಿಮಾಣ", "ದರ", "ಮೊತ್ತ", "ಷರಾ"];
    } else {
      // Columns: ಕ್ರ.ಸಂ | ವಿವರ | ದಿನಾಂಕ | ಮೊತ್ತ | ಷರಾ
      colWidths = [30, 230, 85, 75, 75];
      colHeaders = ["ಕ್ರ.ಸಂ", "ವಿವರ", "ದಿನಾಂಕ", "ಮೊತ್ತ", "ಷರಾ"];
    }

    const startTableY = yPos;
    const tableX = 50;

    // Draw Column Headers
    let currentX = tableX;
    page.drawRectangle({
      x: tableX,
      y: yPos - 22,
      width: 495,
      height: 22,
      color: rgb(0.96, 0.96, 0.96),
      borderColor: borderColor,
      borderWidth: 0.5,
    });

    for (let i = 0; i < colHeaders.length; i++) {
      const headerText = colHeaders[i];
      const w = colWidths[i];
      // Center align headers
      const textW = getTextWidth(headerText, 9.5, customFont, latinFont);
      const textX = currentX + (w - textW) / 2;
      drawMixedText(page, headerText, {
        x: textX,
        y: yPos - 15,
        size: 9.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: fontColor,
        isBold: true,
      });

      // vertical lines
      if (i > 0) {
        page.drawLine({
          start: { x: currentX, y: yPos },
          end: { x: currentX, y: yPos - 22 },
          color: borderColor,
          thickness: 0.5,
        });
      }
      currentX += w;
    }

    yPos -= 22;

    // Draw Data Rows
    const items = voucher.hand_voucher_items || [];
    for (let rowIndex = 0; rowIndex < items.length; rowIndex++) {
      const item = items[rowIndex];

      // Row values arrays mapping
      let rowValues: string[] = [];
      if (voucher.table_layout === "teacher") {
        rowValues = [
          item.description || "",
          item.subject || "",
          item.month || "",
          item.days || "",
          Number(item.amount).toFixed(2),
          item.remarks || "",
        ];
      } else if (voucher.table_layout === "milling") {
        rowValues = [
          item.description || "",
          item.month || "",
          item.date ? formatDate(item.date) : "",
          item.quantity_kg !== null ? String(item.quantity_kg) : "",
          item.rate || "",
          Number(item.amount).toFixed(2),
        ];
      } else if (voucher.table_layout === "labor") {
        rowValues = [
          item.description || "",
          item.month || "",
          item.quantity || "",
          item.rate || "",
          Number(item.amount).toFixed(2),
          item.remarks || "",
        ];
      } else {
        rowValues = [
          item.description || "",
          item.date ? formatDate(item.date) : "",
          Number(item.amount).toFixed(2),
          item.remarks || "",
        ];
      }

      // Wrap text for each column to determine the dynamic row height
      const cellLines: string[][] = [];
      
      // Sl No
      const slText = String(rowIndex + 1).padStart(2, "0");
      cellLines.push([slText]);
      
      for (let c = 0; c < rowValues.length; c++) {
        const val = rowValues[c];
        const colW = colWidths[c + 1];
        
        // Wrap using wrapTextByWidth helper (subtract padding)
        const wrapped = wrapTextByWidth(val, colW - 12, 9.5, customFont, latinFont);
        cellLines.push(wrapped.length > 0 ? wrapped : [""]);
      }
      
      // Determine max lines in this row
      const maxLines = Math.max(...cellLines.map(lines => lines.length));
      const rowHeight = maxLines * 12 + 10;

      // Draw bounding box for row
      page.drawRectangle({
        x: tableX,
        y: yPos - rowHeight,
        width: 495,
        height: rowHeight,
        borderColor: borderColor,
        borderWidth: 0.5,
      });

      let cellX = tableX;

      for (let colIndex = 0; colIndex < colWidths.length; colIndex++) {
        const colW = colWidths[colIndex];
        const lines = cellLines[colIndex];

        // Draw vertical separating lines
        if (colIndex > 0) {
          page.drawLine({
            start: { x: cellX, y: yPos },
            end: { x: cellX, y: yPos - rowHeight },
            color: borderColor,
            thickness: 0.5,
          });
        }

        // Determine column properties
        const isSlNo = colIndex === 0;
        const isAmountCol = !isSlNo && (
          (voucher.table_layout === "teacher" && colIndex === 5) ||
          (voucher.table_layout === "milling" && colIndex === 6) ||
          (voucher.table_layout === "labor" && colIndex === 5) ||
          (voucher.table_layout === "gas" && colIndex === 3)
        );

        // Draw lines
        for (let l = 0; l < lines.length; l++) {
          const lineText = lines[l];
          const lineY = yPos - 13 - (l * 12);

          if (isSlNo) {
            const slW = getTextWidth(lineText, 9.5, customFont, latinFont);
            page.drawText(lineText, {
              x: cellX + (colW - slW) / 2,
              y: lineY,
              font: latinFont,
              size: 9.5,
              color: fontColor,
            });
          } else if (isAmountCol) {
            drawRightAlignedMixedText(page, lineText, {
              rightX: cellX + colW - 6,
              y: lineY,
              size: 9.5,
              kannadaFont: customFont,
              latinFont: latinFont,
              color: fontColor,
            });
          } else {
            drawMixedText(page, lineText, {
              x: cellX + 6,
              y: lineY,
              size: 9.5,
              kannadaFont: customFont,
              latinFont: latinFont,
              color: fontColor,
            });
          }
        }

        cellX += colW;
      }

      yPos -= rowHeight;
    }

    // 5. Draw Total Row
    const totalRowHeight = 22;
    page.drawRectangle({
      x: tableX,
      y: yPos - totalRowHeight,
      width: 495,
      height: totalRowHeight,
      borderColor: borderColor,
      borderWidth: 0.5,
    });

    // Format total suffix
    const amountVal = Number(voucher.total_amount);
    let totalTextLeft = "ಒಟ್ಟು :-";
    let totalTextRight = "";

    if (voucher.table_layout === "teacher") {
      totalTextRight = `ರೂ.${amountVal.toLocaleString("en-IN")}/-`;
    } else if (voucher.table_layout === "milling") {
      totalTextLeft = "ಒಟ್ಟು :";
      totalTextRight = amountVal.toFixed(2);
    } else if (voucher.table_layout === "labor") {
      totalTextRight = `ರೂ.${amountVal.toFixed(2)}/-`;
    } else {
      totalTextRight = `ರೂ.${amountVal.toLocaleString("en-IN")}/-`;
    }

    // Determine total left label position and amount columns
    let amountColIndex = colWidths.length - 1; // Last column is amount
    if (voucher.table_layout === "teacher" || voucher.table_layout === "labor" || voucher.table_layout === "gas") {
      amountColIndex = colWidths.length - 2; // Second to last is amount due to remarks column
    }

    let leftColsWidth = 0;
    for (let c = 0; c < amountColIndex; c++) {
      leftColsWidth += colWidths[c];
    }
    const amountColWidth = colWidths[amountColIndex];

    // Draw vertical divider between label and amount
    page.drawLine({
      start: { x: tableX + leftColsWidth, y: yPos },
      end: { x: tableX + leftColsWidth, y: yPos - totalRowHeight },
      color: borderColor,
      thickness: 0.5,
    });

    // Draw total label (right aligned inside left area)
    drawRightAlignedMixedText(page, totalTextLeft, {
      rightX: tableX + leftColsWidth - 6,
      y: yPos - 15,
      size: 9.5,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    // Draw total amount (right aligned inside amount col)
    drawRightAlignedMixedText(page, totalTextRight, {
      rightX: tableX + leftColsWidth + amountColWidth - 6,
      y: yPos - 15,
      size: 9.5,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    // Draw vertical line after amount column if remarks exist
    if (amountColIndex < colWidths.length - 1) {
      page.drawLine({
        start: { x: tableX + leftColsWidth + amountColWidth, y: yPos },
        end: { x: tableX + leftColsWidth + amountColWidth, y: yPos - totalRowHeight },
        color: borderColor,
        thickness: 0.5,
      });
    }

    yPos -= totalRowHeight;
    yPos -= 35;

    // 6. Receiver Signature
    const sigReceiverText = "ಹಣ ಪಡೆದವರ ಸಹಿ";
    drawRightAlignedMixedText(page, sigReceiverText, {
      rightX: 545,
      y: yPos,
      size: 11,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    yPos -= 30;

    // 7. Horizontal Divider
    page.drawLine({
      start: { x: 50, y: yPos },
      end: { x: 545, y: yPos },
      color: rgb(0.6, 0.6, 0.6),
      thickness: 0.5,
    });

    yPos -= 25;

    // 8. Certification Section
    const certTitleText = "ದೃಢೀಕರಣ";
    drawCenteredMixedText(page, certTitleText, {
      centerX: 297.63,
      y: yPos,
      size: 13,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    yPos -= 20;

    const certVar = voucher.certification_content ? voucher.certification_content.trim() : "";
    const certText = isTeacher
      ? `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${certVar} ಎಂದು ದೃಢೀಕರಿಸಿದೆ.`
      : `${schoolNameKn}, ಇಲ್ಲಿಗೆ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${certVar} ಎಂದು ದೃಢೀಕರಿಸಿದೆ.`;

    const wrappedCert = wrapTextByWidth(certText, 495, 11, customFont, latinFont);
    for (const line of wrappedCert) {
      drawMixedText(page, line, {
        x: 50,
        y: yPos,
        size: 11,
        kannadaFont: customFont,
        latinFont: latinFont,
        color: fontColor,
      });
      yPos -= 18;
    }

    yPos -= 45;

    // 9. Principal Signature
    const sigPrincipalText = "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ";
    drawRightAlignedMixedText(page, sigPrincipalText, {
      rightX: 545,
      y: yPos,
      size: 11,
      kannadaFont: customFont,
      latinFont: latinBoldFont,
      color: fontColor,
      isBold: true,
    });

    // Draw PDF Footer Watermark in bottom right corner (y: 50, 59, 68)
    const watermarkDateStr = formatWatermarkTimestamp(new Date());
    const watermarkL1 = `HAND VOUCHER : ${voucher.voucher_number || ""}`;
    const watermarkL2 = "Generated On:";
    const watermarkL3 = watermarkDateStr;
    
    const watermarkSize = 7.5;
    const watermarkColor = rgb(0.6, 0.6, 0.6);
    const watermarkOpacity = 0.6;

    const wl1Width = latinFont.widthOfTextAtSize(watermarkL1, watermarkSize);
    const wl2Width = latinFont.widthOfTextAtSize(watermarkL2, watermarkSize);
    const wl3Width = latinFont.widthOfTextAtSize(watermarkL3, watermarkSize);

    page.drawText(watermarkL1, {
      x: 545 - wl1Width,
      y: 68,
      size: watermarkSize,
      font: latinFont,
      color: watermarkColor,
      opacity: watermarkOpacity,
    });
    page.drawText(watermarkL2, {
      x: 545 - wl2Width,
      y: 59,
      size: watermarkSize,
      font: latinFont,
      color: watermarkColor,
      opacity: watermarkOpacity,
    });
    page.drawText(watermarkL3, {
      x: 545 - wl3Width,
      y: 50,
      size: watermarkSize,
      font: latinFont,
      color: watermarkColor,
      opacity: watermarkOpacity,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Headers
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    
    if (download) {
      const safeFilename = `HV-${voucher.voucher_number.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
      headers.set("Content-Disposition", `attachment; filename="${safeFilename}"`);
    } else {
      headers.set("Content-Disposition", "inline");
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: headers,
    });

  } catch (err: any) {
    console.error("PDF generation failed:", err);
    return new NextResponse(`PDF generation failed: ${err.message || err}`, { status: 500 });
  }
}
