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

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  const dependent_vowels_list = ["್", "ಾ", "ಿ", "ೀ", "ು", "ೂ", "ೃ", "ೆ", "ೇ", "ೈ", "ೊ", "ೋ", "ೌ", "ಂ", "ಃ"];

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxLength) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine !== "") {
        lines.push(currentLine);
      }
      
      let tempWord = word;
      while (tempWord.length > maxLength) {
        let splitIdx = maxLength;
        while (splitIdx > 0 && dependent_vowels_list.includes(tempWord[splitIdx])) {
          splitIdx--;
        }
        if (splitIdx > 1 && tempWord[splitIdx - 1] === "್") {
          splitIdx -= 2;
        }
        if (splitIdx <= 0) {
          splitIdx = maxLength;
        }
        
        lines.push(tempWord.slice(0, splitIdx));
        tempWord = tempWord.slice(splitIdx);
      }
      currentLine = tempWord;
    }
  }
  if (currentLine !== "") {
    lines.push(currentLine);
  }
  return lines;
}


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
    const isKannada = code >= 0x0C80 && code <= 0x0CFF;
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
  // Draw the text off-screen first to register the glyphs in pdf-lib's font context!
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
  operators.push(PDFOperator.of("q" as any)); // Push graphics state
  operators.push(PDFOperator.of("BT" as any)); // Begin Text
  operators.push(PDFOperator.of("Tf" as any, [fontKey, PDFNumber.of(options.size)] as any)); // Set Font and Size
  
  const color = options.color || rgb(0.1, 0.1, 0.1);
  operators.push(
    PDFOperator.of("rg" as any, [
      PDFNumber.of(color.red),
      PDFNumber.of(color.green),
      PDFNumber.of(color.blue),
    ] as any)
  );

  if (options.isBold) {
    // Synthetic bolding: Fill then Stroke mode (2)
    operators.push(PDFOperator.of("Tr" as any, [PDFNumber.of(2)] as any));
    const strokeWidth = options.size * 0.03;
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

  operators.push(PDFOperator.of("ET" as any)); // End Text
  operators.push(PDFOperator.of("Q" as any)); // Pop graphics state

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
    x: startX,
    y: options.y,
    size: options.size,
    kannadaFont: options.kannadaFont,
    latinFont: options.latinFont,
    color: options.color,
    isBold: options.isBold,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const download = searchParams.get("download") === "true";

    if (!id) {
      return new NextResponse("Bill ID is required", { status: 400 });
    }

    const supabase = await createClient();

    // Fetch bill details from database
    const { data: bill, error } = await supabase
      .from("dc_bills")
      .select("*, dc_bill_deductions(*)")
      .eq("id", id)
      .single();

    if (error || !bill) {
      console.error("Error fetching bill details:", error);
      return new NextResponse("Bill not found", { status: 404 });
    }

    // Resolve paths to font
    const fontPath = path.join(process.cwd(), "public", "fonts", "NudiUni01e.ttf");

    if (!fs.existsSync(fontPath)) {
      console.error("Font file not found at:", fontPath);
      return new NextResponse("Font file not found on server", { status: 500 });
    }

    // Read font
    const fontBytes = fs.readFileSync(fontPath);

    // Initialize blank PDF document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Embed fonts
    const customFont = await pdfDoc.embedFont(fontBytes);
    const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const latinBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Dynamically parse financial year from bill number
    let financialYear = "2026-27";
    if (bill.dc_bill_number && bill.dc_bill_number.includes("/")) {
      financialYear = bill.dc_bill_number.split("/")[1].trim();
    }

    // Typography configurations
    const fontColor = rgb(0.1, 0.1, 0.1); // Charcoal

    // Table Column Layout Bounds (X coordinates)
    const tableColX = [51.1, 83.8, 192.7, 404.2, 539.9];
    const colWidths = [
      83.8 - 51.1,  // Sl. No = 32.7
      192.7 - 83.8, // Bill No/Date = 108.9
      404.2 - 192.7, // Particulars = 211.5
      539.9 - 404.2  // Amount = 135.7
    ];
    const maxParticularsWidth = colWidths[2] - 10; // Padding inside particulars cell is 10pt

    // === ROW HEIGHTS CALCULATION ===
    const items = (bill.items as any[]) || [];
    const rowHeights = items.map((item) => {
      const subBillDate = formatDate(item.bill_date);
      const billNo = item.bill_number || "";
      const subBillLabel = billNo + (subBillDate ? ` / ${subBillDate}` : "");
      
      const particularsText = item.purpose || "";
      const singleLineWidth = getTextWidth(particularsText, 10.5, customFont, latinFont);
      
      const isBillLong = subBillLabel.length > 14;
      const isParticularsLong = singleLineWidth > maxParticularsWidth;
      
      return (isBillLong || isParticularsLong) ? 36 : 22;
    });

    const deductions = (bill.dc_bill_deductions as any[]) || [];
    const deductionsHeightOffset = deductions.length > 0 ? 20 * (deductions.length + 2) : 0;

    // Vertical height budgets for layout partitions (Y starts at 841.89 top down)
    const baseSinglePageRowLimit = 284;
    const firstPageRowLimit = 396;
    const middlePageRowLimit = 706;
    const baseLastPageRowLimit = 594;

    const singlePageRowLimit = baseSinglePageRowLimit - deductionsHeightOffset;
    const lastPageRowLimit = baseLastPageRowLimit - deductionsHeightOffset;

    const pagesData: { items: any[]; heights: number[]; startIdx: number }[] = [];
    
    const totalAllRowsHeight = rowHeights.reduce((sum, h) => sum + h, 0);
    
    if (totalAllRowsHeight <= singlePageRowLimit) {
      // fits on 1 page
      pagesData.push({
        items: items,
        heights: rowHeights,
        startIdx: 0
      });
    } else {
      // Multi-Page
      let currentIdx = 0;
      
      // Page 1
      let page1Heights: number[] = [];
      let page1Items: any[] = [];
      let accumulatedHeight = 0;
      while (currentIdx < items.length && accumulatedHeight + rowHeights[currentIdx] <= firstPageRowLimit) {
        accumulatedHeight += rowHeights[currentIdx];
        page1Heights.push(rowHeights[currentIdx]);
        page1Items.push(items[currentIdx]);
        currentIdx++;
      }
      pagesData.push({
        items: page1Items,
        heights: page1Heights,
        startIdx: 0
      });
      
      // Page 2+
      while (currentIdx < items.length) {
        let pageItems: any[] = [];
        let pageHeights: number[] = [];
        let pageAccumulatedHeight = 0;
        let startIdx = currentIdx;
        
        const remainingHeights = rowHeights.slice(currentIdx);
        const totalRemainingHeight = remainingHeights.reduce((sum, h) => sum + h, 0);
        
        if (totalRemainingHeight <= lastPageRowLimit) {
          // Final Page
          while (currentIdx < items.length) {
            pageHeights.push(rowHeights[currentIdx]);
            pageItems.push(items[currentIdx]);
            currentIdx++;
          }
        } else {
          // Middle Page
          while (currentIdx < items.length && pageAccumulatedHeight + rowHeights[currentIdx] <= middlePageRowLimit) {
            pageAccumulatedHeight += rowHeights[currentIdx];
            pageHeights.push(rowHeights[currentIdx]);
            pageItems.push(items[currentIdx]);
            currentIdx++;
          }
          
          if (pageItems.length === 0) {
            // Force at least one item
            pageAccumulatedHeight += rowHeights[currentIdx];
            pageHeights.push(rowHeights[currentIdx]);
            pageItems.push(items[currentIdx]);
            currentIdx++;
          }
        }
        
        pagesData.push({
          items: pageItems,
          heights: pageHeights,
          startIdx
        });
      }
    }

    const totalPages = pagesData.length;

    // === DRAWING HELPERS ===
    const drawPageTemplate = (page: any, pageNum: number, totalPages: number, isFirstPage: boolean) => {
      const width = 595.27;
      const height = 841.89;
      
      // Page outer single border
      page.drawRectangle({
        x: 40,
        y: 40,
        width: width - 80,
        height: height - 80,
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 1.0,
      });

      // Page inner double border line (3pt offset)
      page.drawRectangle({
        x: 43,
        y: 43,
        width: width - 86,
        height: height - 86,
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 0.5,
      });

      // Page running header on page 2+
      if (!isFirstPage) {
        drawMixedText(page, `ಡಿ.ಸಿ. ಬಿಲ್ ಸಂಖ್ಯೆ :- ${bill.dc_bill_number || ""}`, {
          x: 51.1,
          y: 810,
          size: 10,
          kannadaFont: customFont,
          latinFont: latinBoldFont,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      // Page numbering footer at bottom right
      const pageText = `Page ${pageNum} of ${totalPages}`;
      const pageTextWidth = latinFont.widthOfTextAtSize(pageText, 9);
      page.drawText(pageText, {
        x: 539.9 - pageTextWidth,
        y: 48,
        size: 9,
        font: latinFont,
        color: rgb(0.4, 0.4, 0.4),
      });
    };

    const drawHeader = (page: any) => {
      const centerX = 297.63; // Centered globally
      
      drawCenteredMixedText(page, "ಕರ್ನಾಟಕ ಸರ್ಕಾರ", {
        centerX,
        y: 778,
        size: 16,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      drawCenteredMixedText(page, "ಕರ್ನಾಟಕ ವಸತಿ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳ ಸಂಘ, ಬೆಂಗಳೂರು", {
        centerX,
        y: 758,
        size: 13.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      drawCenteredMixedText(page, "ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ (ಹಿಂ.ವ - 48), ಮಾಲೂರು ಟೌನ್", {
        centerX,
        y: 738,
        size: 13.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      drawCenteredMixedText(page, "ಮಾಲೂರು ತಾಲ್ಲೂಕು, ಕೋಲಾರ ಜಿಲ್ಲೆ - 563130.", {
        centerX,
        y: 718,
        size: 12,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      // Draw horizontal line below the school address
      page.drawLine({
        start: { x: 51.1, y: 709 },
        end: { x: 539.9, y: 709 },
        thickness: 0.75,
        color: rgb(0, 0, 0),
      });

      drawCenteredMixedText(page, `ನಿರ್ವಹಣಾ ಖಾತೆ - ${financialYear}`, {
        centerX,
        y: 697,
        size: 11.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      drawCenteredMixedText(page, "ಖಾತೆ ಸಂಖ್ಯೆ :- 64076713075", {
        centerX,
        y: 681,
        size: 11.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });

      drawCenteredMixedText(page, "ಖಾತೆ ನಿರ್ವಹಣೆ:- ಪ್ರಾಂಶುಪಾಲರು ಮತ್ತು ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳು", {
        centerX,
        y: 665,
        size: 11.5,
        kannadaFont: customFont,
        latinFont: latinBoldFont,
        color: rgb(0, 0, 0),
        isBold: true,
      });
    };

    const drawMetadataGrid = (page: any, billData: any) => {
      const topY = 645;
      const height = 131;
      const bottomY = topY - height; // 514
      const midDividerX = 192.7;

      // Draw grid bounding box
      page.drawRectangle({
        x: 51.1,
        y: bottomY,
        width: 539.9 - 51.1,
        height: height,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1.0,
      });

      // Draw full row dividers
      const fullRowY = [topY - 26.2, topY - 52.4, topY - 104.8];
      fullRowY.forEach((yVal) => {
        page.drawLine({
          start: { x: 51.1, y: yVal },
          end: { x: 539.9, y: yVal },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });
      });

      // Draw merged row divider (only to the right of midDividerX)
      page.drawLine({
        start: { x: midDividerX, y: topY - 78.6 },
        end: { x: 539.9, y: topY - 78.6 },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });

      // Draw vertical label/value separator line
      page.drawLine({
        start: { x: midDividerX, y: topY },
        end: { x: midDividerX, y: bottomY },
        thickness: 0.5,
        color: rgb(0, 0, 0),
      });

      // Row Labels
      drawMixedText(page, "ಡಿ.ಸಿ. ಬಿಲ್ ಸಂಖ್ಯೆ :-", { x: 56, y: topY - 18, size: 10.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor, isBold: true });
      drawMixedText(page, "ಚೆಕ್ ಸಂಖ್ಯೆ / ದಿನಾಂಕ :-", { x: 56, y: topY - 44.2, size: 10.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor, isBold: true });
      drawMixedText(page, "ಪಾವತಿದಾರರು :-", { x: 56, y: topY - 82, size: 10.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor, isBold: true });
      drawMixedText(page, "ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ :-", { x: 56, y: topY - 122.8, size: 10.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor, isBold: true });

      // Row Values
      drawMixedText(page, billData.dc_bill_number || "", { x: 198, y: topY - 18, size: 11.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor });
      
      const formattedChequeDate = formatDate(billData.cheque_date);
      const chequeText = `${billData.cheque_number || ""} / ${formattedChequeDate}`;
      drawMixedText(page, chequeText, { x: 198, y: topY - 44.2, size: 10.5, kannadaFont: customFont, latinFont: latinFont, color: fontColor });

      drawMixedText(page, billData.payee_name || "", { x: 198, y: topY - 70.4, size: 10.5, kannadaFont: customFont, latinFont: latinFont, color: fontColor });
      if (billData.payee_address) {
        drawMixedText(page, billData.payee_address, { x: 198, y: topY - 96.6, size: 9.5, kannadaFont: customFont, latinFont: latinFont, color: fontColor });
      }

      const formattedTotalAmount = Number(billData.amount).toFixed(2);
      drawMixedText(page, formattedTotalAmount, { x: 198, y: topY - 122.8, size: 11.5, kannadaFont: customFont, latinFont: latinBoldFont, color: fontColor });
    };

    // === PAGES RENDER LOOP ===
    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      const pageData = pagesData[pIdx];
      const pageNum = pIdx + 1;
      const isFirstPage = pageNum === 1;
      const isLastPage = pageNum === totalPages;

      const page = pdfDoc.addPage([595.27, 841.89]);
      drawPageTemplate(page, pageNum, totalPages, isFirstPage);

      if (isFirstPage) {
        drawHeader(page);
        drawMetadataGrid(page, bill);

        // Section label "ವಿವರಗಳು :-"
        drawCenteredMixedText(page, "ವಿವರಗಳು :-", {
          centerX: 295.6,
          y: 492,
          size: 11.5,
          kannadaFont: customFont,
          latinFont: latinBoldFont,
          color: rgb(0, 0, 0),
          isBold: true,
        });
      }

      // Draw Table Header
      const headerTopY = isFirstPage ? 480 : 775;
      const headerBottomY = headerTopY - 24;

      // Fill header light gray background
      page.drawRectangle({
        x: 51.1,
        y: headerBottomY,
        width: 539.9 - 51.1,
        height: 24,
        color: rgb(0.95, 0.95, 0.95),
      });

      // Draw header boundaries
      page.drawLine({ start: { x: 51.1, y: headerTopY }, end: { x: 539.9, y: headerTopY }, thickness: 1.0, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: 51.1, y: headerBottomY }, end: { x: 539.9, y: headerBottomY }, thickness: 1.0, color: rgb(0, 0, 0) });

      // Column Header Labels
      drawCenteredMixedText(page, "ಕ್ರ.ಸಂ.", { centerX: 67.4, y: headerBottomY + 7, size: 10, kannadaFont: customFont, latinFont: latinBoldFont, color: rgb(0, 0, 0), isBold: true });
      drawCenteredMixedText(page, "ಬಿಲ್ ಸಂಖ್ಯೆ /  ದಿನಾಂಕ", { centerX: 138.2, y: headerBottomY + 7, size: 10, kannadaFont: customFont, latinFont: latinBoldFont, color: rgb(0, 0, 0), isBold: true });
      drawCenteredMixedText(page, "ಪಾವತಿ ವಿವರ", { centerX: 298.4, y: headerBottomY + 7, size: 10, kannadaFont: customFont, latinFont: latinBoldFont, color: rgb(0, 0, 0), isBold: true });
      drawCenteredMixedText(page, "ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ", { centerX: 472.0, y: headerBottomY + 7, size: 10, kannadaFont: customFont, latinFont: latinBoldFont, color: rgb(0, 0, 0), isBold: true });

      let currentY = headerBottomY;

      // Draw item rows
      pageData.items.forEach((item, rIdx) => {
        const rowHeight = pageData.heights[rIdx];
        const rowBottomY = currentY - rowHeight;
        const rowCenterY = currentY - (rowHeight / 2);

        // Col 1: Sl No
        const slNoText = String(pageData.startIdx + rIdx + 1);
        drawCenteredMixedText(page, slNoText, {
          centerX: 67.4,
          y: rowCenterY - 4,
          size: 10.5,
          kannadaFont: customFont,
          latinFont: latinFont,
          color: fontColor,
        });

        // Col 2: Bill Number & Date
        const subBillDate = formatDate(item.bill_date);
        const billNo = item.bill_number || "";
        const subBillLabel = billNo + (subBillDate ? ` / ${subBillDate}` : "");

        if (rowHeight === 36) {
          // Renders bill number above date
          drawMixedText(page, billNo, {
            x: 88,
            y: rowCenterY + 4,
            size: 10,
            kannadaFont: customFont,
            latinFont: latinFont,
            color: fontColor,
          });
          drawMixedText(page, subBillDate, {
            x: 88,
            y: rowCenterY - 8,
            size: 10,
            kannadaFont: customFont,
            latinFont: latinFont,
            color: fontColor,
          });
        } else {
          // Single line
          drawMixedText(page, subBillLabel, {
            x: 88,
            y: rowCenterY - 4,
            size: 10.5,
            kannadaFont: customFont,
            latinFont: latinFont,
            color: fontColor,
          });
        }

        // Col 3: Particulars (Expense details)
        const particularsText = item.purpose || "";
        const singleLineWidth = getTextWidth(particularsText, 10.5, customFont, latinFont);

        if (singleLineWidth <= maxParticularsWidth) {
          // Single line fitting
          drawMixedText(page, particularsText, {
            x: 198,
            y: rowCenterY - 4,
            size: 10.5,
            kannadaFont: customFont,
            latinFont: latinFont,
            color: fontColor,
          });
        } else {
          // Wrap text inside Col 3 boundaries
          const lines = wrapTextByWidth(particularsText, maxParticularsWidth, 9.5, customFont, latinFont);
          const linesToDraw = lines.slice(0, 2);
          linesToDraw.forEach((line, lineIdx) => {
            const lineY = rowCenterY + 4 - lineIdx * 11;
            drawMixedText(page, line, {
              x: 198,
              y: lineY - 3,
              size: 9.5,
              kannadaFont: customFont,
              latinFont: latinFont,
              color: fontColor,
            });
          });
        }

        // Col 4: Amount
        const valStr = Number(item.amount).toFixed(2);
        const valWidth = latinFont.widthOfTextAtSize(valStr, 10.5);
        page.drawText(valStr, {
          x: 534 - valWidth,
          y: rowCenterY - 4,
          size: 10.5,
          font: latinFont,
          color: fontColor,
        });

        // Row horizontal border divider
        page.drawLine({
          start: { x: 51.1, y: rowBottomY },
          end: { x: 539.9, y: rowBottomY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });

        currentY = rowBottomY;
      });

      // Draw vertical separator lines for columns
      tableColX.forEach((colX) => {
        page.drawLine({
          start: { x: colX, y: headerTopY },
          end: { x: colX, y: currentY },
          thickness: 0.5,
          color: rgb(0, 0, 0),
        });
      });

      // Draw Last Page Footer items (Totals, Words, Signatures)
      if (isLastPage) {
        const deductions = (bill.dc_bill_deductions as any[]) || [];
        let finalTableBottomY = currentY;

        if (deductions.length > 0) {
          // 1. Draw Gross Total Row
          const grossRowBottom = currentY - 20;
          page.drawLine({ start: { x: 51.1, y: grossRowBottom }, end: { x: 539.9, y: grossRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          
          tableColX.forEach((colX) => {
            page.drawLine({ start: { x: colX, y: currentY }, end: { x: colX, y: grossRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          });

          const grossLabel = "ಒಟ್ಟು ಮೊತ್ತ (Gross Total):";
          const grossLabelWidth = getTextWidth(grossLabel, 10.5, customFont, latinBoldFont);
          drawMixedText(page, grossLabel, {
            x: 400 - grossLabelWidth,
            y: grossRowBottom + 5,
            size: 10.5,
            kannadaFont: customFont,
            latinFont: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          const formattedGross = Number(bill.gross_amount || bill.amount).toFixed(2);
          const grossValWidth = latinBoldFont.widthOfTextAtSize(formattedGross, 10.5);
          page.drawText(formattedGross, {
            x: 534 - grossValWidth,
            y: grossRowBottom + 5,
            size: 10.5,
            font: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          currentY = grossRowBottom;

          // 2. Draw each deduction row
          deductions.forEach((ded) => {
            const dedRowBottom = currentY - 20;
            page.drawLine({ start: { x: 51.1, y: dedRowBottom }, end: { x: 539.9, y: dedRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
            
            tableColX.forEach((colX) => {
              page.drawLine({ start: { x: colX, y: currentY }, end: { x: colX, y: dedRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
            });

            const modeStr = ded.deduction_mode === "percentage" ? ` @${ded.deduction_value}%` : "";
            const dedLabel = `${ded.deduction_type}${modeStr}:`;
            
            // Draw in column 3 (particulars)
            drawMixedText(page, dedLabel, {
              x: 198,
              y: dedRowBottom + 5,
              size: 10,
              kannadaFont: customFont,
              latinFont: latinFont,
              color: rgb(0.1, 0.1, 0.1),
            });

            const formattedDedAmt = "-" + Number(ded.deduction_amount).toFixed(2);
            const dedValWidth = latinFont.widthOfTextAtSize(formattedDedAmt, 10);
            page.drawText(formattedDedAmt, {
              x: 534 - dedValWidth,
              y: dedRowBottom + 5,
              size: 10,
              font: latinFont,
              color: rgb(0.1, 0.1, 0.1),
            });

            currentY = dedRowBottom;
          });

          // 3. Draw Total Deductions Row
          const totDedRowBottom = currentY - 20;
          page.drawLine({ start: { x: 51.1, y: totDedRowBottom }, end: { x: 539.9, y: totDedRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          
          tableColX.forEach((colX) => {
            page.drawLine({ start: { x: colX, y: currentY }, end: { x: colX, y: totDedRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          });

          const totDedLabel = "ಒಟ್ಟು ಕಡಿತಗಳು (Deductions):";
          const totDedLabelWidth = getTextWidth(totDedLabel, 10.5, customFont, latinBoldFont);
          drawMixedText(page, totDedLabel, {
            x: 400 - totDedLabelWidth,
            y: totDedRowBottom + 5,
            size: 10.5,
            kannadaFont: customFont,
            latinFont: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          const formattedTotDed = "-" + Number(bill.total_deductions || 0).toFixed(2);
          const totDedValWidth = latinBoldFont.widthOfTextAtSize(formattedTotDed, 10.5);
          page.drawText(formattedTotDed, {
            x: 534 - totDedValWidth,
            y: totDedRowBottom + 5,
            size: 10.5,
            font: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          currentY = totDedRowBottom;

          // 4. Draw Net Payable Row (double-weight line at bottom)
          const netRowBottom = currentY - 22;
          page.drawLine({ start: { x: 51.1, y: netRowBottom }, end: { x: 539.9, y: netRowBottom }, thickness: 1.0, color: rgb(0, 0, 0) });
          
          tableColX.forEach((colX) => {
            page.drawLine({ start: { x: colX, y: currentY }, end: { x: colX, y: netRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          });

          const netLabel = "ನಿವ್ವಳ ಪಾವತಿ (Net Payable):";
          const netLabelWidth = getTextWidth(netLabel, 11, customFont, latinBoldFont);
          drawMixedText(page, netLabel, {
            x: 400 - netLabelWidth,
            y: netRowBottom + 6,
            size: 11,
            kannadaFont: customFont,
            latinFont: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          const formattedNet = Number(bill.net_payable_amount || bill.amount).toFixed(2);
          const netValWidth = latinBoldFont.widthOfTextAtSize(formattedNet, 11);
          page.drawText(formattedNet, {
            x: 534 - netValWidth,
            y: netRowBottom + 6,
            size: 11,
            font: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          finalTableBottomY = netRowBottom;
        } else {
          // Original Simple Total Row (No deductions)
          const totalRowBottom = currentY - 22;
          page.drawLine({ start: { x: 51.1, y: totalRowBottom }, end: { x: 539.9, y: totalRowBottom }, thickness: 1.0, color: rgb(0, 0, 0) });
          
          tableColX.forEach((colX) => {
            page.drawLine({ start: { x: colX, y: currentY }, end: { x: colX, y: totalRowBottom }, thickness: 0.5, color: rgb(0, 0, 0) });
          });

          const totalLabel = "ಒಟ್ಟು ಮೊತ್ತ:";
          const totalLabelWidth = getTextWidth(totalLabel, 11, customFont, latinBoldFont);
          drawMixedText(page, totalLabel, {
            x: 400 - totalLabelWidth,
            y: totalRowBottom + 6,
            size: 11,
            kannadaFont: customFont,
            latinFont: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          const formattedTotalAmount = Number(bill.amount).toFixed(2);
          const totalValWidth = latinBoldFont.widthOfTextAtSize(formattedTotalAmount, 11);
          page.drawText(formattedTotalAmount, {
            x: 534 - totalValWidth,
            y: totalRowBottom + 6,
            size: 11,
            font: latinBoldFont,
            color: rgb(0, 0, 0),
          });

          finalTableBottomY = totalRowBottom;
        }

        // Draw Amount in Words row
        const wordsY = finalTableBottomY - 25;
        drawMixedText(page, "Amount in Rupees :-", {
          x: 51.1,
          y: wordsY,
          size: 11,
          kannadaFont: customFont,
          latinFont: latinBoldFont,
          color: rgb(0, 0, 0),
        });

        const amountInWords = bill.amount_in_words || "";
        let amountInWordsFontSize = 12;
        const maxWordsWidth = 539.9 - 170;
        let wordsWidth = getTextWidth(amountInWords, amountInWordsFontSize, customFont, latinFont);
        
        while (wordsWidth > maxWordsWidth && amountInWordsFontSize > 8) {
          amountInWordsFontSize -= 0.5;
          wordsWidth = getTextWidth(amountInWords, amountInWordsFontSize, customFont, latinFont);
        }

        drawMixedText(page, amountInWords, {
          x: 170,
          y: wordsY,
          size: amountInWordsFontSize,
          kannadaFont: customFont,
          latinFont: latinFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Draw Signatures blocks (District Officer left, Principal right)
        const footerY = wordsY - 50;
        drawMixedText(page, "ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ", {
          x: 56,
          y: footerY,
          size: 11,
          kannadaFont: customFont,
          latinFont: latinBoldFont,
          color: rgb(0, 0, 0),
          isBold: true,
        });

        const rightSig = "ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ";
        const rightSigWidth = getTextWidth(rightSig, 11, customFont, latinBoldFont);
        drawMixedText(page, rightSig, {
          x: 534 - rightSigWidth,
          y: footerY,
          size: 11,
          kannadaFont: customFont,
          latinFont: latinBoldFont,
          color: rgb(0, 0, 0),
          isBold: true,
        });
      }
    }

    // Save final document bytes
    const pdfBytes = await pdfDoc.save();

    const filename = `DC_Bill_${bill.dc_bill_number || "draft"}.pdf`;
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    if (download) {
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    } else {
      headers.set("Content-Disposition", `inline; filename="${filename}"`);
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("PDF Generation Error:", err);
    return new NextResponse("Error generating PDF: " + (err as Error).message, {
      status: 500,
    });
  }
}
