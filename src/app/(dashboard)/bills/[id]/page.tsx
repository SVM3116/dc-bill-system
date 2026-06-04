import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Download, Printer, AlertTriangle, Calendar, FileText, Landmark, User, Copy, ExternalLink } from "lucide-react";

interface BillDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0; // Fresh fetch

export default async function BillDetailsPage({ params }: BillDetailsPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const { data: bill, error } = await supabase
    .from("dc_bills")
    .select("*, schools(school_name_en), dc_bill_deductions(*)")
    .eq("id", id)
    .eq("school_id", user.id)
    .single();

  if (error || !bill) {
    notFound();
  }

  const hasPdf = bill.status === "generated";

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/bills">
            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-black tracking-tight text-slate-800">
                DC Bill Details
              </h2>
              <span
                className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasPdf
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-amber-50 text-amber-700 border-amber-300"
                }`}
              >
                {hasPdf ? "Generated" : "Draft"}
              </span>
            </div>
            <p className="text-xs text-slate-500">D.C. Bill Number: {bill.dc_bill_number}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link href={`/bills/new?duplicateFrom=${bill.id}`} className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10">
              <Copy className="h-4 w-4" />
              Duplicate
            </Button>
          </Link>
          <Link href={`/bills/${bill.id}/edit`} className="flex-1 md:flex-none">
            <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10">
              <Edit className="h-4 w-4" />
              Edit Bill
            </Button>
          </Link>

          {hasPdf && (
            <>
              <a
                href={`/api/pdf?id=${bill.id}&download=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none"
              >
                <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
              <a
                href={`/api/pdf?id=${bill.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none"
              >
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-11 md:h-10">
                  <Printer className="h-4 w-4" />
                  Print / Open
                </Button>
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Data on Left, PDF on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Summary Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Info Card */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                Ledger Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">D.C. Bill Number</p>
                <p className="font-bold text-slate-800 text-sm font-mono">{bill.dc_bill_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Payee Name</p>
                <p className="font-bold text-slate-800 text-sm">{bill.payee_name}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-slate-400 font-semibold">Payee Address</p>
                <p className="font-medium text-slate-700 leading-relaxed">{bill.payee_address || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Total Amount</p>
                <p className="font-black text-slate-900 text-base">₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cheque Info Card */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="h-4 w-4 text-blue-700" />
                Cheque Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-6 text-xs">
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Cheque Number</p>
                <p className="font-bold text-slate-800 text-sm font-mono">{bill.cheque_number || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-semibold">Cheque Date</p>
                <p className="font-bold text-slate-800 text-sm">
                  {bill.cheque_date
                    ? new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-slate-400 font-semibold">Amount in Words</p>
                <p className="font-semibold text-slate-700 italic leading-relaxed">{bill.amount_in_words}</p>
              </div>
            </CardContent>
          </Card>

          {/* Deductions & Financial Summary Card */}
          {bill.dc_bill_deductions && (bill.dc_bill_deductions as any[]).length > 0 ? (
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-700" />
                  Financial Summary &amp; Deductions Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold">Gross Total Amount (ಒಟ್ಟು ಮೊತ್ತ)</p>
                    <p className="font-bold text-slate-800 text-sm">₹{Number(bill.gross_amount || bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-semibold">Total Deductions (ಒಟ್ಟು ಕಡಿತಗಳು)</p>
                    <p className="font-bold text-red-600 text-sm">- ₹{Number(bill.total_deductions || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <p className="text-slate-500 font-bold tracking-wider uppercase text-[10px]">Deductions List:</p>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {(bill.dc_bill_deductions as any[]).map((ded: any, index: number) => {
                      const modeStr = ded.deduction_mode === "percentage" ? ` (${ded.deduction_value}%)` : "";
                      return (
                        <div key={index} className="flex justify-between items-center text-slate-700 font-medium">
                          <span>{ded.deduction_type}{modeStr}:</span>
                          <span className="font-bold text-red-600">- ₹{Number(ded.deduction_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-sm font-black bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-blue-700">Net Payable Amount (ನಿವ್ವಳ ಪಾವತಿ):</span>
                  <span className="text-emerald-700 text-base">₹{Number(bill.net_payable_amount || bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-700" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 text-xs flex justify-between items-center font-bold bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">Net Payable Amount (ನಿವ್ವಳ ಪಾವತಿ):</span>
                <span className="text-sm font-black text-slate-900">
                  ₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </CardContent>
            </Card>
          )}

          {/* Items breakdown list */}
          <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-3.5 px-4 sm:px-6">
              <CardTitle className="text-sm font-bold text-slate-800">
                Itemized Expense Items (`ವಿವರಗಳು`)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50 border-b border-slate-200">
                      <TableHead className="w-[60px] text-center font-bold text-xs text-slate-700">Sl. No.</TableHead>
                      <TableHead className="w-[160px] font-bold text-xs text-slate-700">Bill No. / Date</TableHead>
                      <TableHead className="font-bold text-xs text-slate-700">Particulars (Payment Details)</TableHead>
                      <TableHead className="w-[140px] text-right font-bold text-xs text-slate-700 pr-6">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bill.items && (bill.items as any[]).length > 0 ? (
                      (bill.items as any[]).map((item, index) => (
                        <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-150 text-slate-700">
                          <TableCell className="text-center font-semibold text-xs text-slate-505">{index + 1}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-600 font-mono">
                            {item.bill_number} / {item.bill_date ? new Date(item.bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "2-digit" }) : ""}
                          </TableCell>
                          <TableCell className="text-xs font-medium leading-relaxed">{item.purpose}</TableCell>
                          <TableCell className="text-xs font-bold text-slate-800 text-right pr-6">
                            ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-xs text-slate-500 py-4">No items recorded</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-slate-50 hover:bg-slate-50 border-t border-slate-300 font-bold">
                      <TableCell colSpan={3} className="text-right text-xs uppercase pr-4 font-bold text-slate-600">Gross Amount:</TableCell>
                      <TableCell className="text-right text-sm font-black text-slate-900 pr-6">
                        ₹{Number(bill.gross_amount || bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {bill.items && (bill.items as any[]).length > 0 ? (
                  (bill.items as any[]).map((item, index) => (
                    <div key={index} className="p-4 space-y-2 hover:bg-slate-50/50">
                      <div className="flex justify-between items-center font-bold text-xs text-slate-800">
                        <span>Item #{index + 1}</span>
                        <span className="font-extrabold text-slate-900">
                          ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-1">
                        <p>
                          Bill No: <span className="font-semibold text-slate-700 font-mono">{item.bill_number}</span>
                        </p>
                        <p>
                          Bill Date: <span className="font-semibold text-slate-700">{item.bill_date ? new Date(item.bill_date).toLocaleDateString("en-IN") : ""}</span>
                        </p>
                        <div className="pt-1 text-slate-600 text-xs font-medium leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                          {item.purpose}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">No items recorded</div>
                )}
                
                {/* Mobile Total Row */}
                <div className="bg-slate-100 p-4 flex justify-between items-center text-xs font-bold border-t border-slate-200">
                  <span className="text-slate-600 uppercase">Gross Amount:</span>
                  <span className="text-sm font-black text-slate-900">
                    ₹{Number(bill.gross_amount || bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit trail */}
          <Card className="border-slate-200 shadow-sm bg-slate-50/50 overflow-hidden">
            <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                Created: {new Date(bill.created_at).toLocaleString("en-IN")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User className="h-3.5 w-3.5 shrink-0" />
                School: {bill.schools?.school_name_en || "School"}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: PDF Preview Container */}
        <div className="lg:col-span-5">
          {hasPdf ? (
            <Card className="border-slate-200 shadow-sm bg-white sticky top-6 overflow-hidden">
              <CardHeader className="border-b border-slate-100 py-3.5 px-4">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Generated PDF sheet Preview
                </CardTitle>
              </CardHeader>
              
              {/* Desktop iframe (750px tall - 20% taller than original 620px) */}
              <CardContent className="p-2 hidden md:block">
                <iframe
                  src={`/api/pdf?id=${bill.id}#toolbar=0`}
                  className="w-full h-[750px] border border-slate-200 rounded shadow-inner"
                />
              </CardContent>

              {/* Mobile Friendly Helper Section */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center text-center gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">Official Contingent Sheet PDF</p>
                  <p className="text-[10px] text-slate-500 max-w-[280px]">
                    PDF files cannot be fully previewed inside frames on some mobile browsers. You can open it in full screen to read or print it.
                  </p>
                </div>
                <a
                  href={`/api/pdf?id=${bill.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs h-12 flex items-center justify-center gap-1.5 shadow-sm active:bg-slate-950">
                    <ExternalLink className="h-4 w-4" />
                    Open Full Screen PDF
                  </Button>
                </a>
              </div>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50/30 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm border border-dashed rounded-lg sticky top-6">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-800">Bill in Draft Status</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                  This bill has not been finalized. The PDF sheet is only available for finalized bills.
                </p>
              </div>
              <Link href={`/bills/${bill.id}/edit`} className="w-full">
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-12">
                  Edit & Finalize Bill
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
