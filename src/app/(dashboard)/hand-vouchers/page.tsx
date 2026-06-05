import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus2, Eye, Edit, Trash2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HandVouchersFilter } from "@/components/hand-vouchers-filter";
import { DeleteHandVoucherButton } from "@/components/delete-hand-voucher-button";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { redirect } from "next/navigation";

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

export const revalidate = 0; // Fresh fetches

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    mode?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
}

export default async function HandVouchersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";
  const mode = resolvedSearchParams.mode || "all";
  const startDate = resolvedSearchParams.startDate || "";
  const endDate = resolvedSearchParams.endDate || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10);

  const supabase = await createClient();
  const financialYear = await getSelectedFinancialYear();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // Start building query
  let query = supabase
    .from("hand_vouchers")
    .select("id, voucher_number, voucher_date, payment_mode, cheque_number, cheque_date, total_amount, main_content, created_at", {
      count: "exact",
    })
    .eq("school_id", user.id);

  // Scope results strictly to the selected Financial Year (starts with e.g. "2026-27/HV")
  query = query.like("voucher_number", `${financialYear}/HV/%`);

  // Apply filters
  if (mode !== "all") {
    query = query.eq("payment_mode", mode);
  }

  if (startDate) {
    query = query.gte("voucher_date", startDate);
  }

  if (endDate) {
    query = query.lte("voucher_date", endDate);
  }

  // Apply search query
  if (q) {
    const cleanQ = q.trim();
    const isNumeric = !isNaN(Number(cleanQ)) && cleanQ !== "";
    if (isNumeric) {
      const num = parseInt(cleanQ, 10);
      const padded = String(num).padStart(2, "0");
      // Build search patterns for voucher numbers
      const numPatterns = [
        `voucher_number.ilike.%-${num}`,
        `voucher_number.ilike.%-${padded}`
      ];
      if (cleanQ.includes("/")) {
        numPatterns.push(`voucher_number.ilike.%${cleanQ}%`);
      }
      const numConditions = numPatterns.join(",");
      query = query.or(`${numConditions},cheque_number.ilike.%${cleanQ}%,main_content.ilike.%${cleanQ}%,total_amount.eq.${num}`);
    } else {
      query = query.or(`voucher_number.ilike.%${cleanQ}%,cheque_number.ilike.%${cleanQ}%,main_content.ilike.%${cleanQ}%`);
    }
  }

  // Apply order and pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  query = query
    .order("voucher_date", { ascending: false })
    .order("voucher_number", { ascending: false })
    .range(from, to);

  const { data: vouchers, count, error } = await query;

  if (error) {
    console.error("Error fetching vouchers:", error);
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            Hand Vouchers <span className="text-blue-700 font-bold">({financialYear})</span>
          </h2>
          <p className="text-xs text-slate-500">Manage, print, and search Hand Vouchers for Academic Year {financialYear}</p>
        </div>
        <Link href="/hand-vouchers/new" className="w-full sm:w-auto">
          <Button className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 w-full sm:h-9 sm:w-auto cursor-pointer">
            <FilePlus2 className="h-4 w-4" />
            Create Hand Voucher
          </Button>
        </Link>
      </div>

      {/* Filter Component */}
      <HandVouchersFilter
        initialSearch={q}
        initialMode={mode}
        initialStartDate={startDate}
        initialEndDate={endDate}
        currentPage={page}
        totalPages={totalPages}
        totalItems={count || 0}
      />

      {/* Results Section */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {vouchers && vouchers.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-semibold text-xs text-slate-700 w-[160px]">Voucher Number</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 w-[110px]">Voucher Date</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 w-[100px]">Mode</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 w-[120px]">Cheque Details</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Content Description</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-right w-[120px]">Total Amount</TableHead>
                      <TableHead className="w-[180px] text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers.map((voucher) => (
                      <TableRow key={voucher.id} className="hover:bg-slate-50 text-slate-700">
                        <TableCell className="font-medium text-xs text-slate-800 font-mono">{voucher.voucher_number}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(voucher.voucher_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              voucher.payment_mode === "cheque"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {voucher.payment_mode === "cheque" ? "Cheque" : "Cash"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {voucher.payment_mode === "cheque" ? (
                            <div className="font-mono text-[11px]">
                              <div>{voucher.cheque_number}</div>
                              <div className="text-[9px] text-slate-400">{formatDate(voucher.cheque_date)}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium truncate max-w-[200px] font-nudi">
                          {voucher.main_content}
                        </TableCell>
                        <TableCell className="text-xs text-slate-800 font-bold text-right">
                          ₹{Number(voucher.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/hand-vouchers/${voucher.id}`} title="View Details">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-700 cursor-pointer">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <a
                              href={`/api/hand-voucher-pdf?id=${voucher.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Download PDF"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-700 cursor-pointer">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            <Link href={`/hand-vouchers/${voucher.id}/edit`} title="Edit Voucher">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-amber-700 cursor-pointer">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/hand-vouchers/new?duplicateFrom=${voucher.id}`} title="Duplicate Voucher">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-700 cursor-pointer">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </Link>
                            <DeleteHandVoucherButton
                              voucherId={voucher.id}
                              voucherNumber={voucher.voucher_number}
                            >
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </DeleteHandVoucherButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View: Cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {vouchers.map((voucher) => (
                  <div key={voucher.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-800 font-mono">{voucher.voucher_number}</div>
                        <div className="text-[10px] text-slate-400">
                          Date: {new Date(voucher.voucher_date).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-800">
                          ₹{Number(voucher.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <span
                          className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                            voucher.payment_mode === "cheque"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {voucher.payment_mode === "cheque" ? "Cheque" : "Cash"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded font-nudi truncate">
                      {voucher.main_content}
                    </div>

                    {voucher.payment_mode === "cheque" && (
                      <div className="text-[10px] text-slate-500 flex gap-4">
                        <span>Cheque No: <strong className="font-mono text-slate-700">{voucher.cheque_number}</strong></span>
                        <span>Cheque Date: <strong className="text-slate-700">{formatDate(voucher.cheque_date)}</strong></span>
                      </div>
                    )}

                    <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-100/50">
                      <Link href={`/hand-vouchers/${voucher.id}`}>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold border-slate-200 text-slate-700">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </Link>
                      <a href={`/api/hand-voucher-pdf?id=${voucher.id}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold border-slate-200 text-slate-700">
                          <Download className="h-3.5 w-3.5 mr-1" /> Print
                        </Button>
                      </a>
                      <Link href={`/hand-vouchers/${voucher.id}/edit`}>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold border-slate-200 text-slate-700">
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      </Link>
                      <DeleteHandVoucherButton
                        voucherId={voucher.id}
                        voucherNumber={voucher.voucher_number}
                        buttonVariant="outline"
                        className="h-8 text-[10px] font-bold border-red-100 text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        Delete
                      </DeleteHandVoucherButton>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-slate-500 font-semibold">No Hand Vouchers found for the selected academic year.</p>
              <p className="text-xs text-slate-400 mt-1">Create a new Hand Voucher to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
