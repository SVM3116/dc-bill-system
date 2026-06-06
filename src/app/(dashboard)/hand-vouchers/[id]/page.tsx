import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Download, Printer, Calendar, FileText, Landmark, User, Copy, ExternalLink, Columns } from "lucide-react";
import { SaveTemplateButton } from "@/components/save-template-button";

interface HandVoucherDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0; // Fresh fetch

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

// Helper: Calculate Academic Year (starts Apr 1)
function getAcademicYear(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month)) return "";
  if (month >= 4) {
    return `${year}-${String(year + 1).slice(-2)}`;
  } else {
    return `${year - 1}-${String(year).slice(-2)}`;
  }
}

export default async function HandVoucherDetailsPage({ params }: HandVoucherDetailsPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const { data: voucher, error } = await supabase
    .from("hand_vouchers")
    .select("*, schools(*), hand_voucher_items(*)")
    .eq("id", id)
    .eq("school_id", user.id)
    .single();

  if (error || !voucher) {
    notFound();
  }

  const schoolNameKn = voucher.schools?.school_name_kn || "ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ";
  const acadYear = getAcademicYear(voucher.voucher_date);
  const items = voucher.hand_voucher_items || [];

  // Recompute auto-generated Kannada text
  const chequeNum = voucher.cheque_number ? voucher.cheque_number.trim() : "________";
  const chequeDateStr = voucher.cheque_date ? formatDate(voucher.cheque_date) : "__.__.____";
  const main = voucher.main_content ? voucher.main_content.trim() : "";
  const cert = voucher.certification_content ? voucher.certification_content.trim() : "";
  const isTeacher = voucher.table_layout === "teacher";

  let introParagraph = "";
  if (isTeacher) {
    // 2A. Guest Teacher Layout (For both cash and cheque)
    introParagraph = `${schoolNameKn}, ಇಲ್ಲಿ ${main} ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ಚೆಕ್ ಸಂಖ್ಯೆ :- ${chequeNum} / ${chequeDateStr} ರ ಮೂಲಕ ಗೌರವ ಧನ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
  } else {
    // Non-Teacher Layouts
    if (voucher.payment_mode === "cheque") {
      // 1A. Introduction paragraph for cheque
      introParagraph = `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ಚೆಕ್ ಸಂಖ್ಯೆ :- ${chequeNum} / ${chequeDateStr} ರ ಮೂಲಕ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
    } else {
      // 1B. Introduction paragraph for cash
      introParagraph = `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear} ನೇ ಸಾಲಿನಲ್ಲಿ ${main} ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು ನಿಲಯಪಾಲಕರಿಂದ ನಗದಾಗಿ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.`;
    }
  }

  const certParagraph = isTeacher
    ? `${schoolNameKn}, ಇಲ್ಲಿ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${cert} ಎಂದು ದೃಢೀಕರಿಸಿದೆ.`
    : `${schoolNameKn}, ಇಲ್ಲಿಗೆ  ${acadYear}ನೇ ಸಾಲಿನಲ್ಲಿ ${cert} ಎಂದು ದೃಢೀಕರಿಸಿದೆ.`;

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/hand-vouchers">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800">
                Hand Voucher Details
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-mono">Voucher Number: {voucher.voucher_number}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <SaveTemplateButton id={voucher.id} type="voucher" className="flex-1 md:flex-none" />
          <Link href={`/hand-vouchers/new?duplicateFrom=${voucher.id}`} className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10 cursor-pointer">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
          </Link>
          <Link href={`/hand-vouchers/${voucher.id}/edit`} className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10 cursor-pointer">
              <Edit className="h-4 w-4" />
              Edit Voucher
            </Button>
          </Link>
          <a
            href={`/api/hand-voucher-pdf?id=${voucher.id}&download=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none"
          >
            <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10 cursor-pointer">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </a>
          <a
            href={`/api/hand-voucher-pdf?id=${voucher.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none"
          >
            <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10 cursor-pointer">
              <Printer className="h-4 w-4" />
              Print / Open
            </Button>
          </a>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Summary Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metadata */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                Voucher Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Voucher Number</p>
                <p className="font-bold text-slate-800 text-sm font-mono">{voucher.voucher_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Voucher Date</p>
                <p className="font-bold text-slate-800 text-sm">
                  {new Date(voucher.voucher_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Payment Mode</p>
                <p className="font-bold text-slate-850 text-xs">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full border ${
                    voucher.payment_mode === "cheque"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}>
                    {voucher.payment_mode === "cheque" ? "Cheque" : "Cash"}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Table Layout Type</p>
                <p className="font-bold text-slate-800 text-xs flex items-center gap-1">
                  <Columns className="h-3.5 w-3.5 text-slate-500" />
                  {voucher.table_layout === "teacher" && "Guest Teacher Layout"}
                  {voucher.table_layout === "milling" && "Milling & Cleaning Layout"}
                  {voucher.table_layout === "labor" && "Labor / Coolie Layout"}
                  {voucher.table_layout === "gas" && "Gas / Transport Layout"}
                </p>
              </div>

              {voucher.payment_mode === "cheque" && (
                <>
                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <p className="text-slate-400 font-semibold">Cheque Number</p>
                    <p className="font-bold text-slate-800 text-sm font-mono">{voucher.cheque_number || "-"}</p>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 pt-3">
                    <p className="text-slate-400 font-semibold">Cheque Date</p>
                    <p className="font-bold text-slate-800 text-sm">{voucher.cheque_date ? formatDate(voucher.cheque_date) : "-"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Auto-compiled Text Paragraphs */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-blue-700" />
                Compiled Kannada Content
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Introductory Paragraph (ಸಂದಾಯ ವಿವರಣೆ)
                </p>
                <p className="text-xs bg-slate-50 border border-slate-100 rounded-md p-3.5 font-nudi leading-relaxed text-slate-800 text-[13px]">
                  {introParagraph}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                  Certification Paragraph (ದೃಢೀಕರಣ)
                </p>
                <p className="text-xs bg-slate-50 border border-slate-100 rounded-md p-3.5 font-nudi leading-relaxed text-slate-800 text-[13px] whitespace-pre-line">
                  {certParagraph}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: PDF Preview */}
        <div className="lg:col-span-5">
          <Card className="border-slate-200 shadow-sm bg-white sticky top-6 overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4">
              <CardTitle className="text-sm font-bold text-slate-800">
                Generated PDF sheet Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 hidden md:block">
              <iframe
                src={`/api/hand-voucher-pdf?id=${voucher.id}#toolbar=0`}
                className="w-full h-[750px] border border-slate-200 rounded shadow-inner"
              />
            </CardContent>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center text-center gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700">Official Hand Voucher PDF</p>
                <p className="text-[10px] text-slate-500 max-w-[280px]">
                  PDF files cannot be fully previewed inside frames on some mobile browsers. You can open it in full screen to read or print it.
                </p>
              </div>
              <a
                href={`/api/hand-voucher-pdf?id=${voucher.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs h-12 flex items-center justify-center gap-1.5 shadow-sm active:bg-slate-950 cursor-pointer">
                  <ExternalLink className="h-4 w-4" />
                  Open Full Screen PDF
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Items Table */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden mt-6">
        <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6 flex justify-between items-center flex-row">
          <CardTitle className="text-sm font-bold text-slate-800">
            Voucher Ledger Entries
          </CardTitle>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500">Gross Total: </span>
            <span className="text-sm font-black text-slate-800">₹{Number(voucher.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="min-w-[60px] w-[60px] text-center text-xs font-semibold text-slate-700">Sl. No</TableHead>
                  <TableHead className="min-w-[250px] text-xs font-semibold text-slate-700">Description</TableHead>

                  {voucher.table_layout === "teacher" && (
                    <>
                      <TableHead className="min-w-[150px] text-xs font-semibold text-slate-700">Subject</TableHead>
                      <TableHead className="min-w-[180px] text-xs font-semibold text-slate-700">Month</TableHead>
                      <TableHead className="min-w-[100px] text-xs font-semibold text-slate-700">Days</TableHead>
                    </>
                  )}

                  {voucher.table_layout === "milling" && (
                    <>
                      <TableHead className="min-w-[180px] text-xs font-semibold text-slate-700">Month</TableHead>
                      <TableHead className="min-w-[130px] text-xs font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="min-w-[100px] text-xs font-semibold text-slate-700 text-center">Qty (Kg)</TableHead>
                      <TableHead className="min-w-[100px] text-xs font-semibold text-slate-700">Rate</TableHead>
                    </>
                  )}

                  {voucher.table_layout === "labor" && (
                    <>
                      <TableHead className="min-w-[180px] text-xs font-semibold text-slate-700">Month</TableHead>
                      <TableHead className="min-w-[120px] text-xs font-semibold text-slate-700 text-center">Qty/People</TableHead>
                      <TableHead className="min-w-[100px] text-xs font-semibold text-slate-700">Rate</TableHead>
                    </>
                  )}

                  {voucher.table_layout === "gas" && (
                    <>
                      <TableHead className="min-w-[130px] text-xs font-semibold text-slate-700">Date</TableHead>
                    </>
                  )}

                  <TableHead className="min-w-[120px] text-right text-xs font-semibold text-slate-700">Amount</TableHead>

                  {(voucher.table_layout === "teacher" || voucher.table_layout === "labor" || voucher.table_layout === "gas") && (
                    <TableHead className="min-w-[150px] text-xs font-semibold text-slate-700">Remarks</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: any, idx: number) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 text-slate-700">
                    <TableCell className="text-center font-mono text-xs">{idx + 1}</TableCell>
                    <TableCell className="text-xs font-medium font-nudi">{item.description}</TableCell>

                    {/* Layout fields */}
                    {voucher.table_layout === "teacher" && (
                      <>
                        <TableCell className="text-xs font-nudi">{item.subject || "-"}</TableCell>
                        <TableCell className="text-xs font-nudi">{item.month || "-"}</TableCell>
                        <TableCell className="text-xs font-nudi">{item.days || "-"}</TableCell>
                      </>
                    )}

                    {voucher.table_layout === "milling" && (
                      <>
                        <TableCell className="text-xs font-nudi">{item.month || "-"}</TableCell>
                        <TableCell className="text-xs">{item.date ? formatDate(item.date) : "-"}</TableCell>
                        <TableCell className="text-xs text-center font-semibold">{item.quantity_kg !== null ? item.quantity_kg : "-"}</TableCell>
                        <TableCell className="text-xs font-mono">{item.rate || "-"}</TableCell>
                      </>
                    )}

                    {voucher.table_layout === "labor" && (
                      <>
                        <TableCell className="text-xs font-nudi">{item.month || "-"}</TableCell>
                        <TableCell className="text-xs text-center font-nudi font-semibold">{item.quantity || "-"}</TableCell>
                        <TableCell className="text-xs font-nudi">{item.rate || "-"}</TableCell>
                      </>
                    )}

                    {voucher.table_layout === "gas" && (
                      <>
                        <TableCell className="text-xs">{item.date ? formatDate(item.date) : "-"}</TableCell>
                      </>
                    )}

                    <TableCell className="text-right text-xs font-bold">
                      ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {(voucher.table_layout === "teacher" || voucher.table_layout === "labor" || voucher.table_layout === "gas") && (
                      <TableCell className="text-xs font-nudi text-slate-500">{item.remarks || "-"}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden p-4 space-y-4 border-b border-slate-100">
            {items.map((item: any, idx: number) => (
              <div key={item.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Item #{idx + 1}</span>
                </div>
                
                <div className="space-y-2 text-xs text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-400 block">Description</span>
                    <span className="font-medium text-slate-800 font-nudi">{item.description}</span>
                  </div>

                  {voucher.table_layout === "teacher" && (
                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2">
                      <div>
                        <span className="font-semibold text-slate-400 block">Subject</span>
                        <span className="font-medium text-slate-850 font-nudi">{item.subject || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Month</span>
                        <span className="font-medium text-slate-850 font-nudi">{item.month || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Days</span>
                        <span className="font-medium text-slate-850 font-nudi">{item.days || "-"}</span>
                      </div>
                    </div>
                  )}

                  {voucher.table_layout === "milling" && (
                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2">
                      <div>
                        <span className="font-semibold text-slate-400 block">Month</span>
                        <span className="font-medium text-slate-850 font-nudi">{item.month || "-"}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-400 block">Date</span>
                        <span className="font-medium text-slate-850">{item.date ? formatDate(item.date) : "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-semibold text-slate-400 block">Qty (Kg)</span>
                          <span className="font-medium text-slate-850 font-semibold">{item.quantity_kg !== null ? item.quantity_kg : "-"}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 block">Rate</span>
                          <span className="font-medium text-slate-850 font-mono">{item.rate || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {voucher.table_layout === "labor" && (
                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2">
                      <div>
                        <span className="font-semibold text-slate-400 block">Month</span>
                        <span className="font-medium text-slate-850 font-nudi">{item.month || "-"}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-semibold text-slate-400 block">Qty/People</span>
                          <span className="font-medium text-slate-850 font-semibold">{item.quantity || "-"}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 block">Rate</span>
                          <span className="font-medium text-slate-850 font-nudi">{item.rate || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {voucher.table_layout === "gas" && (
                    <div className="border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-400 block">Date</span>
                      <span className="font-medium text-slate-850">{item.date ? formatDate(item.date) : "-"}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                    <div>
                      <span className="font-bold text-slate-400 block">Amount</span>
                      <span className="font-bold text-slate-800">₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    {(voucher.table_layout === "teacher" || voucher.table_layout === "labor" || voucher.table_layout === "gas") && (
                      <div>
                        <span className="font-semibold text-slate-400 block">Remarks</span>
                        <span className="font-medium text-slate-500 font-nudi">{item.remarks || "-"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit trail */}
      <Card className="border-slate-200 shadow-sm bg-slate-50/50 overflow-hidden mt-6">
        <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Created: {new Date(voucher.created_at).toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <User className="h-3.5 w-3.5 shrink-0" />
            School: {voucher.schools?.school_name_en || "School"}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
