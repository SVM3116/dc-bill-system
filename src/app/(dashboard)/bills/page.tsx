import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus2, SearchCode, Eye, Edit, Trash2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillsFilter } from "@/components/bills-filter";
import { DeleteBillButton } from "@/components/delete-bill-button";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { redirect } from "next/navigation";
import { BulkDownloadDialog } from "@/components/bulk-download-dialog";

export const revalidate = 0; // Fresh fetches

const ITEMS_PER_PAGE = 10;

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
    account_type?: string;
  }>;
}

export default async function BillsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams.q || "";
  const status = resolvedSearchParams.status || "all";
  const startDate = resolvedSearchParams.startDate || "";
  const endDate = resolvedSearchParams.endDate || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const accountType = resolvedSearchParams.account_type || "maintenance";

  const supabase = await createClient();
  const financialYear = await getSelectedFinancialYear();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  const accountTypeLabelKn = accountType === "salary" ? "ಸಂಬಳ ಖಾತೆ" : "ನಿರ್ವಹಣಾ ಖಾತೆ";
  const accountTypeLabelEn = accountType === "salary" ? "Salary Account" : "Maintenance Account";

  // Start building query
  let query = supabase
    .from("dc_bills")
    .select("id, dc_bill_number, cheque_number, cheque_date, payee_name, amount, status, created_at", {
      count: "exact",
    })
    .eq("school_id", user.id)
    .eq("account_type", accountType);

  // Scope results strictly to the selected Financial Year
  query = query.ilike("dc_bill_number", `%${financialYear}`);

  // Apply filters
  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (startDate) {
    query = query.gte("cheque_date", startDate);
  }

  if (endDate) {
    query = query.lte("cheque_date", endDate);
  }

  // Apply search query
  if (q) {
    const cleanQ = q.trim();
    const isNumeric = !isNaN(Number(cleanQ)) && cleanQ !== "";
    if (isNumeric) {
      const num = parseInt(cleanQ, 10);
      const padded = String(num).padStart(2, "0");
      // Build precise patterns for matching sequence numbers without matching the year (e.g. 2026)
      const numPatterns = [
        `dc_bill_number.ilike.${num}/%`,
        `dc_bill_number.ilike.0${num}/%`,
        `dc_bill_number.ilike.${num} /%`,
        `dc_bill_number.ilike.0${num} /%`,
        `dc_bill_number.ilike.${padded}/%`,
        `dc_bill_number.ilike.${padded} /%`
      ];
      
      // Fallback is only allowed if the query contains a slash (so it is a full search with year)
      if (cleanQ.includes("/")) {
        numPatterns.push(`dc_bill_number.ilike.%${cleanQ}%`);
      }
      
      const dcBillNumberConditions = numPatterns.join(",");

      query = query.or(`${dcBillNumberConditions},cheque_number.ilike.%${cleanQ}%,payee_name.ilike.%${cleanQ}%,amount.eq.${num}`);
    } else {
      query = query.or(`dc_bill_number.ilike.%${cleanQ}%,cheque_number.ilike.%${cleanQ}%,payee_name.ilike.%${cleanQ}%`);
    }
  }

  // Apply order and pagination
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  query = query
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: bills, count, error } = await query;

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            {accountTypeLabelEn} Bills <span className="text-blue-700 font-bold">({financialYear})</span>
          </h2>
          <p className="text-xs text-slate-500">Manage and search school {accountTypeLabelEn} ({accountTypeLabelKn}) DC bills for Academic Year {financialYear}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <BulkDownloadDialog />
          <Link href={`/bills/new?account_type=${accountType}`} className="w-full sm:w-auto">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 w-full sm:h-9 sm:w-auto">
              <FilePlus2 className="h-4 w-4" />
              Create DC Bill
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Component (Client Side Interactivity) */}
      <BillsFilter
        initialSearch={q}
        initialStatus={status}
        initialStartDate={startDate}
        initialEndDate={endDate}
        currentPage={page}
        totalPages={totalPages}
        totalItems={count || 0}
      />

      {/* Results Section */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {bills && bills.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow className="hover:bg-slate-50">
                      <TableHead className="font-semibold text-xs text-slate-700 w-[140px]">DC Bill Number</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 w-[120px]">Cheque Number</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 w-[100px]">Cheque Date</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700">Payee Name</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-right w-[130px]">Amount</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-center w-[100px]">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-slate-700 text-center w-[120px]">Created At</TableHead>
                      <TableHead className="w-[200px] text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id} className="hover:bg-slate-50 text-slate-700">
                        <TableCell className="font-medium text-xs text-slate-800">{bill.dc_bill_number}</TableCell>
                        <TableCell className="text-xs text-slate-600">{bill.cheque_number}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-xs font-medium truncate max-w-[180px]">{bill.payee_name}</TableCell>
                        <TableCell className="text-xs text-slate-800 font-bold text-right">
                          ₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              bill.status === "generated"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            }`}
                          >
                            {bill.status === "generated" ? "Generated" : "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 text-center">
                          {new Date(bill.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-center p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/bills/${bill.id}`} title="View Details">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/bills/${bill.id}/edit`} title="Edit Bill">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-700">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/bills/new?duplicateFrom=${bill.id}`} title="Duplicate Bill">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-purple-700">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </Link>
                            <a
                              href={`/api/pdf?id=${bill.id}&download=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Download PDF"
                            >
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-700">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                            <DeleteBillButton
                              billId={bill.id}
                              billNumber={bill.dc_bill_number}
                              buttonVariant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Delete Bill"
                            >
                              <Trash2 className="h-4 w-4" />
                            </DeleteBillButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {bills.map((bill) => (
                  <div key={bill.id} className="p-4 space-y-3 hover:bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-800">{bill.dc_bill_number}</span>
                        <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                          <p>
                            Cheque: <strong className="text-slate-700">{bill.cheque_number}</strong> (
                            {new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                            )
                          </p>
                          <p>
                            Created:{" "}
                            {new Date(bill.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          bill.status === "generated"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-amber-50 text-amber-700 border-amber-300"
                        }`}
                      >
                        {bill.status === "generated" ? "Generated" : "Draft"}
                      </span>
                    </div>

                    <div className="flex justify-between items-end gap-3 pt-1">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-600 truncate">{bill.payee_name}</p>
                        <p className="text-sm font-black text-slate-800 mt-1">
                          ₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Action buttons with larger touch sizes */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link href={`/bills/${bill.id}`} title="View Details">
                          <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 hover:bg-slate-50 active:bg-slate-100">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/bills/${bill.id}/edit`} title="Edit Bill">
                          <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 hover:bg-slate-50 active:bg-slate-100">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/bills/new?duplicateFrom=${bill.id}`} title="Duplicate Bill">
                          <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 hover:bg-slate-50 active:bg-slate-100">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </Link>
                        <a
                          href={`/api/pdf?id=${bill.id}&download=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download PDF"
                        >
                          <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 hover:bg-slate-50 active:bg-slate-100">
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                        <DeleteBillButton
                          billId={bill.id}
                          billNumber={bill.dc_bill_number}
                          buttonVariant="outline"
                          className="h-9 w-9 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:bg-red-100"
                          title="Delete Bill"
                        >
                          <Trash2 className="h-4 w-4" />
                        </DeleteBillButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 px-4">
              <SearchCode className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">No matching DC bills found</h3>
              <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search terms for A.Y. {financialYear}.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
