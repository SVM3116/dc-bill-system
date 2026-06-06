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

// Split text into Kannada and Latin runs for multi-lingual printing
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
    return font.widthOfTextAtSize(text, size);
  }
}

function getTextWidth(text: string, size: number, kannadaFont: any, latinFont: any): number {
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
  page.setFont(options.font);
  const fontKey = page.fontKey;
  const embedder = options.font.embedder;
  const fkFont = embedder.font;
  const unitsPerEm = fkFont.unitsPerEm;
  const scale = options.size / unitsPerEm;

  const run = fkFont.layout(text);
  const glyphs = run.glyphs;
  const positions = run.positions;

  // Register the shaped glyphs manually in the subset if subsetting is enabled
  if (embedder.subset) {
    for (const glyph of glyphs) {
      if (!embedder.glyphIdMap.has(glyph.id)) {
        const subsetGlyphId = embedder.subset.includeGlyph(glyph);
        embedder.glyphs[subsetGlyphId - 1] = glyph;
        embedder.glyphIdMap.set(glyph.id, subsetGlyphId);
      }
    }
    embedder.glyphCache?.invalidate?.();
  }

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
    
    // Get subsetted glyph ID or fallback to raw glyph.id
    const glyphId = embedder.subset ? embedder.glyphIdMap.get(glyph.id) : glyph.id;
    const hex = glyphId.toString(16).toUpperCase().padStart(4, "0");
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
    const financialYear = searchParams.get("financial_year") || "2026-27";
    const accountType = searchParams.get("account_type") || "all";
    const fromDate = searchParams.get("from_date") || "";
    const toDate = searchParams.get("to_date") || "";

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Query bills details
    let query = supabase
      .from("dc_bills")
      .select("*, schools(*)")
      .eq("school_id", user.id)
      .eq("status", "generated")
      .not("cheque_number", "is", null);

    query = query.ilike("dc_bill_number", `%${financialYear}`);

    if (accountType === "maintenance") {
      query = query.eq("account_type", "maintenance");
    } else if (accountType === "salary") {
      query = query.eq("account_type", "salary");
    }

    if (fromDate) {
      query = query.gte("cheque_date", fromDate);
    }
    if (toDate) {
      query = query.lte("cheque_date", toDate);
    }

    query = query.order("cheque_date", { ascending: true });

    const { data: bills, error: dbError } = await query;
    if (dbError) {
      throw new Error(dbError.message);
    }

    // Retrieve school info
    let schoolName = "School Office Cheque Register";
    if (bills && bills.length > 0 && bills[0].schools) {
      schoolName = bills[0].schools.school_name_en;
    } else {
      const { data: sData } = await supabase.from("schools").select("school_name_en").eq("id", user.id).single();
      if (sData) schoolName = sData.school_name_en;
    }

    // Resolve paths to font
    const fontPath = path.join(process.cwd(), "public", "fonts", "NudiUni01e.ttf");
    const fontBytes = fs.existsSync(fontPath) ? fs.readFileSync(fontPath) : null;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    let customFont: any;
    if (fontBytes) {
      customFont = await pdfDoc.embedFont(fontBytes, { subset: true });
    }
    const latinFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const latinBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Landscape coordinates
    const pageWidth = 841.89;
    const pageHeight = 595.27;

    // Columns: DC Bill No, Cheque No, Date, Payee, Net Amount, Particulars
    const tableColX = [40.9, 160.9, 245.9, 330.9, 490.9, 580.9, 800.9];
    const colWidths = [120, 85, 85, 160, 90, 220];

    // Format data rows
    const formattedRows = (bills || []).map((bill: any) => {
      const items = (bill.items as any[]) || [];
      const particularsList = items.map((item, idx) => `${idx + 1}. ${item.purpose || ""}`);
      
      return {
        dc_bill_number: bill.dc_bill_number || "",
        cheque_number: bill.cheque_number || "",
        cheque_date: bill.cheque_date ? formatDate(bill.cheque_date) : "",
        payee_name: bill.payee_name || "",
        amount: Number(bill.net_payable_amount ?? bill.amount),
        particularsLines: particularsList,
      };
    });

    // Pagination Row Heights calculations
    const wrappedRows = formattedRows.map((row) => {
      const wrapBillNo = wrapTextByWidth(row.dc_bill_number, colWidths[0] - 10, 9, customFont || latinFont, latinFont);
      const wrapChequeNo = wrapTextByWidth(row.cheque_number, colWidths[1] - 10, 9, customFont || latinFont, latinFont);
      const wrapPayee = wrapTextByWidth(row.payee_name, colWidths[3] - 10, 9, customFont || latinFont, latinFont);
      
      // Particulars wrap each item line
      const wrapParticulars: string[] = [];
      row.particularsLines.forEach((itemLine) => {
        const wrapped = wrapTextByWidth(itemLine, colWidths[5] - 10, 8.5, customFont || latinFont, latinFont);
        wrapParticulars.push(...wrapped);
      });

      const maxLines = Math.max(
        wrapBillNo.length,
        wrapChequeNo.length,
        1, // Date
        wrapPayee.length,
        1, // Net Amount
        wrapParticulars.length
      );

      const rowHeight = maxLines * 11 + 8; // Row height

      return {
        ...row,
        wrapBillNo,
        wrapChequeNo,
        wrapPayee,
        wrapParticulars,
        height: rowHeight,
      };
    });

    // Distribute rows across pages
    const pages: (typeof wrappedRows)[] = [];
    let currentPageRows: typeof wrappedRows = [];
    let currentHeightSum = 0;
    const firstPageMaxHeight = 350; // space on first page due to header
    const nextPageMaxHeight = 440; // space on subsequent pages

    wrappedRows.forEach((row) => {
      const maxHeight = pages.length === 0 ? firstPageMaxHeight : nextPageMaxHeight;
      if (currentHeightSum + row.height > maxHeight) {
        if (currentPageRows.length > 0) {
          pages.push(currentPageRows);
        }
        currentPageRows = [row];
        currentHeightSum = row.height;
      } else {
        currentPageRows.push(row);
        currentHeightSum += row.height;
      }
    });
    if (currentPageRows.length > 0) {
      pages.push(currentPageRows);
    }
    if (pages.length === 0) {
      pages.push([]); // Force one empty page
    }

    const totalPages = pages.length;

    // Draw templates
    for (let pIdx = 0; pIdx < totalPages; pIdx++) {
      const pageRows = pages[pIdx];
      const pageNum = pIdx + 1;
      const isFirst = pageNum === 1;

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Outer page border
      page.drawRectangle({
        x: 30,
        y: 30,
        width: pageWidth - 60,
        height: pageHeight - 60,
        borderColor: rgb(0.3, 0.3, 0.3),
        borderWidth: 1.0,
      });

      // Page numbering footer
      const pageText = `Page ${pageNum} of ${totalPages}`;
      const pageTextWidth = latinFont.widthOfTextAtSize(pageText, 8.5);
      page.drawText(pageText, {
        x: 800.9 - pageTextWidth,
        y: 38,
        size: 8.5,
        font: latinFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      let yPos = 540;

      // Header on first page only
      if (isFirst) {
        drawCenteredMixedText(page, schoolName, {
          centerX: pageWidth / 2,
          y: yPos,
          size: 13,
          kannadaFont: customFont || latinBoldFont,
          latinFont: latinBoldFont,
          color: rgb(0, 0, 0),
          isBold: true,
        });

        yPos -= 18;

        const subtitle = `CHEQUE ISSUE REGISTER - FINANCIAL YEAR ${financialYear}`;
        drawCenteredMixedText(page, subtitle, {
          centerX: pageWidth / 2,
          y: yPos,
          size: 10.5,
          kannadaFont: customFont || latinBoldFont,
          latinFont: latinBoldFont,
          color: rgb(0.2, 0.2, 0.2),
          isBold: true,
        });

        yPos -= 15;

        // Print filter metadata details
        const detailsText = `Account Type: ${accountType.toUpperCase()} ${
          fromDate || toDate ? `| Date Range: ${fromDate || "Any"} to ${toDate || "Any"}` : ""
        }`;
        drawCenteredMixedText(page, detailsText, {
          centerX: pageWidth / 2,
          y: yPos,
          size: 9,
          kannadaFont: customFont || latinFont,
          latinFont: latinFont,
          color: rgb(0.4, 0.4, 0.4),
        });

        yPos -= 25;
      } else {
        // running header
        drawMixedText(page, `Cheque Issue Register (${financialYear})`, {
          x: 40.9,
          y: yPos,
          size: 9.5,
          kannadaFont: customFont || latinBoldFont,
          latinFont: latinBoldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        yPos -= 15;
      }

      // Draw Table Header
      const headerTopY = yPos;
      const headerBottomY = headerTopY - 20;

      page.drawRectangle({
        x: 40.9,
        y: headerBottomY,
        width: 760,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });

      page.drawLine({ start: { x: 40.9, y: headerTopY }, end: { x: 800.9, y: headerTopY }, thickness: 0.75, color: rgb(0, 0, 0) });
      page.drawLine({ start: { x: 40.9, y: headerBottomY }, end: { x: 800.9, y: headerBottomY }, thickness: 0.75, color: rgb(0, 0, 0) });

      const headers = ["DC Bill No", "Cheque No", "Date", "Payee", "Net Amount", "Particulars"];
      headers.forEach((hText, i) => {
        const xPos = tableColX[i];
        const w = colWidths[i];
        // Center text in header
        const textW = getTextWidth(hText, 9, customFont || latinBoldFont, latinBoldFont);
        const drawX = xPos + (w - textW) / 2;
        drawMixedText(page, hText, {
          x: drawX,
          y: headerBottomY + 6,
          size: 9,
          kannadaFont: customFont || latinBoldFont,
          latinFont: latinBoldFont,
          color: rgb(0.1, 0.1, 0.1),
        });
      });

      let currentY = headerBottomY;

      // Draw rows
      pageRows.forEach((row) => {
        const rowHeight = row.height;
        const rowBottomY = currentY - rowHeight;

        // Draw bounding row bottom divider
        page.drawLine({
          start: { x: 40.9, y: rowBottomY },
          end: { x: 800.9, y: rowBottomY },
          thickness: 0.5,
          color: rgb(0.2, 0.2, 0.2),
        });

        // Col 1: DC Bill No
        row.wrapBillNo.forEach((line, idx) => {
          drawMixedText(page, line, {
            x: tableColX[0] + 5,
            y: currentY - 12 - (idx * 11),
            size: 9,
            kannadaFont: customFont || latinFont,
            latinFont: latinFont,
            color: rgb(0.1, 0.1, 0.1),
          });
        });

        // Col 2: Cheque No
        row.wrapChequeNo.forEach((line, idx) => {
          drawMixedText(page, line, {
            x: tableColX[1] + 5,
            y: currentY - 12 - (idx * 11),
            size: 9,
            kannadaFont: customFont || latinFont,
            latinFont: latinFont,
            color: rgb(0.1, 0.1, 0.1),
          });
        });

        // Col 3: Date
        drawMixedText(page, row.cheque_date, {
          x: tableColX[2] + 5,
          y: currentY - 12,
          size: 9,
          kannadaFont: customFont || latinFont,
          latinFont: latinFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        // Col 4: Payee
        row.wrapPayee.forEach((line, idx) => {
          drawMixedText(page, line, {
            x: tableColX[3] + 5,
            y: currentY - 12 - (idx * 11),
            size: 9,
            kannadaFont: customFont || latinFont,
            latinFont: latinFont,
            color: rgb(0.1, 0.1, 0.1),
          });
        });

        // Col 5: Net Amount
        const valStr = Number(row.amount).toFixed(2);
        const valWidth = latinBoldFont.widthOfTextAtSize(valStr, 9);
        page.drawText(valStr, {
          x: tableColX[5] - valWidth - 5,
          y: currentY - 12,
          size: 9,
          font: latinBoldFont,
          color: rgb(0, 0, 0),
        });

        // Col 6: Particulars
        row.wrapParticulars.forEach((line, idx) => {
          drawMixedText(page, line, {
            x: tableColX[5] + 5,
            y: currentY - 12 - (idx * 11),
            size: 8.5,
            kannadaFont: customFont || latinFont,
            latinFont: latinFont,
            color: rgb(0.15, 0.15, 0.15),
          });
        });

        currentY = rowBottomY;
      });

      // Draw vertical column separators
      tableColX.forEach((colX) => {
        page.drawLine({
          start: { x: colX, y: headerTopY },
          end: { x: colX, y: currentY },
          thickness: 0.5,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
    }

    const pdfBytes = await pdfDoc.save();

    const response = new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Cheque_Register_${financialYear}_${accountType}.pdf"`,
      },
    });

    return response;
  } catch (err: any) {
    console.error("Landscape Cheque Register PDF failed:", err);
    return new NextResponse(`Landscape PDF compilation failed: ${err.message || err}`, { status: 500 });
  }
}
