import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilePlus2, Files, Landmark, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSelectedFinancialYear } from "@/lib/financial-year";
import { redirect } from "next/navigation";

export const revalidate = 0; // Disable caching to fetch live data

export default async function DashboardPage() {
  const supabase = await createClient();
  const financialYear = await getSelectedFinancialYear();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/login");
  }

  // Fetch total count of bills filtered by financial year and school
  const { count: totalBillsCount, error: totalErr } = await supabase
    .from("dc_bills")
    .select("*", { count: "exact", head: true })
    .eq("school_id", user.id)
    .ilike("dc_bill_number", `%${financialYear}`);

  // Fetch count of bills generated this month and filtered by financial year
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: generatedThisMonthCount, error: monthErr } = await supabase
    .from("dc_bills")
    .select("*", { count: "exact", head: true })
    .eq("school_id", user.id)
    .eq("status", "generated")
    .gte("created_at", startOfMonth.toISOString())
    .ilike("dc_bill_number", `%${financialYear}`);

  // Fetch total amount processed filtered by financial year
  const { data: amtData, error: amtErr } = await supabase
    .from("dc_bills")
    .select("amount")
    .eq("school_id", user.id)
    .eq("status", "generated")
    .ilike("dc_bill_number", `%${financialYear}`);

  const totalAmountProcessed = amtData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

  // Fetch 5 most recent bills filtered by financial year
  const { data: recentBills, error: billsErr } = await supabase
    .from("dc_bills")
    .select("id, dc_bill_number, cheque_date, payee_name, amount, status")
    .eq("school_id", user.id)
    .ilike("dc_bill_number", `%${financialYear}`)
    .order("created_at", { ascending: false })
    .limit(5);
  // Fetch school details to display Principal Name
  const { data: school } = await supabase
    .from("schools")
    .select("principal_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            Welcome, <span className="text-blue-700">{school?.principal_name || "Principal"}</span>
          </h2>
          <p className="text-xs text-slate-500">Quick overview of school DC bills statistics for A.Y. {financialYear}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/bills/new" className="flex-1 sm:flex-initial">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 h-10 w-full sm:h-9">
              <FilePlus2 className="h-4 w-4" />
              Create DC Bill
            </Button>
          </Link>
          <Link href="/bills" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 h-10 w-full sm:h-9">
              <Files className="h-4 w-4" />
              View All Bills
            </Button>
          </Link>
        </div>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Total DC Bills</CardTitle>
            <ReceiptText className="h-4 w-4 text-blue-700" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-black text-slate-800">{totalBillsCount || 0}</div>
            <p className="text-[10px] text-slate-400 mt-1">Total recorded bills in {financialYear}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Generated This Month</CardTitle>
            <Landmark className="h-4 w-4 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-black text-slate-800">{generatedThisMonthCount || 0}</div>
            <p className="text-[10px] text-slate-400 mt-1">
              Finalized since {startOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Processed Amount</CardTitle>
            <span className="text-slate-400 font-semibold text-xs">₹</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-black text-slate-800">
              ₹{totalAmountProcessed.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Cumulative sum of generated bills ({financialYear})</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills section */}
      <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm md:text-base font-bold text-slate-800">Recent DC Bills</CardTitle>
              <p className="text-[10px] md:text-[11px] text-slate-500">Showing the latest 5 entries for {financialYear}</p>
            </div>
            <Link href="/bills" className="text-xs text-blue-700 hover:underline font-bold">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {recentBills && recentBills.length > 0 ? (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block border border-slate-200 rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="hover:bg-slate-50">
                        <TableHead className="font-semibold text-xs text-slate-700 w-[140px]">DC Bill Number</TableHead>
                        <TableHead className="font-semibold text-xs text-slate-700 w-[120px]">Cheque Date</TableHead>
                        <TableHead className="font-semibold text-xs text-slate-700">Payee Name</TableHead>
                        <TableHead className="font-semibold text-xs text-slate-700 text-right w-[140px]">Amount</TableHead>
                        <TableHead className="font-semibold text-xs text-slate-700 text-center w-[120px]">Status</TableHead>
                        <TableHead className="w-[100px] text-center"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBills.map((bill) => (
                        <TableRow key={bill.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium text-xs text-slate-800">{bill.dc_bill_number}</TableCell>
                          <TableCell className="text-xs text-slate-600">
                            {new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-xs text-slate-700 font-medium truncate max-w-[200px]">
                            {bill.payee_name}
                          </TableCell>
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
                          <TableCell className="text-center">
                            <Link href={`/bills/${bill.id}`} className="text-xs text-blue-700 hover:underline font-bold">
                              View details
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden divide-y divide-slate-100 border-t border-slate-100">
                  {recentBills.map((bill) => (
                    <div key={bill.id} className="p-4 space-y-2 hover:bg-slate-50/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{bill.dc_bill_number}</p>
                          <p className="text-[10px] text-slate-500">
                            Date: {new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </p>
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
                      
                      <div className="flex justify-between items-end">
                        <div className="max-w-[200px] overflow-hidden">
                          <p className="text-xs text-slate-600 truncate">{bill.payee_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-800">
                            ₹{Number(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </p>
                          <Link href={`/bills/${bill.id}`} className="text-[11px] text-blue-700 hover:underline font-bold mt-1 inline-block">
                            View details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-md m-4 sm:m-0">
                <ReceiptText className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-2 text-sm font-semibold text-slate-800">No DC bills found</h3>
                <p className="mt-1 text-xs text-slate-500">Create a new DC bill to get started in {financialYear}.</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
