"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FilePlus2, 
  Files, 
  Landmark, 
  ReceiptText, 
  CalendarRange, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from "lucide-react";
import { useDashboardTour } from "@/hooks/useTour";


interface BillItem {
  id: string;
  dc_bill_number: string;
  cheque_number: string;
  cheque_date: string;
  payee_name: string;
  amount: number;
  net_payable_amount: number | null;
  status: string;
  account_type: "maintenance" | "salary";
  created_at: string;
}

interface DashboardClientProps {
  bills: BillItem[];
  principalName: string;
  financialYear: string;
}

const MONTHS_ORDER = [
  { num: 4, name: "April" },
  { num: 5, name: "May" },
  { num: 6, name: "June" },
  { num: 7, name: "July" },
  { num: 8, name: "August" },
  { num: 9, name: "September" },
  { num: 10, name: "October" },
  { num: 11, name: "November" },
  { num: 12, name: "December" },
  { num: 1, name: "January" },
  { num: 2, name: "February" },
  { num: 3, name: "March" }
];

export function DashboardClient({
  bills,
  principalName,
  financialYear,
}: DashboardClientProps) {
  const router = useRouter();

  // Run guided onboarding tour on first-time load
  useDashboardTour();

  // Set default month to current calendar month (1-indexed: 1 = Jan, 12 = Dec)
  const currentMonthNum = useMemo(() => {
    return String(new Date().getMonth() + 1);
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthNum);
  const [selectedFy, setSelectedFy] = useState<string>(financialYear);

  // Helper to resolve transaction month from cheque date
  const getBillMonth = (dateStr: string): number => {
    const d = new Date(dateStr);
    return d.getMonth() + 1;
  };

  // Filter bills based on selected Month (or all)
  const monthBills = useMemo(() => {
    if (selectedMonth === "all") return bills;
    const mNum = parseInt(selectedMonth, 10);
    return bills.filter((b) => getBillMonth(b.cheque_date) === mNum);
  }, [bills, selectedMonth]);

  // --- MONTHLY METRICS CARD CALCULATIONS ---
  const dcBillsCount = monthBills.length;

  const totalNetAmount = useMemo(() => {
    // Sum only generated DC bills net amounts, matching production accounting standards
    return monthBills
      .filter((b) => b.status === "generated")
      .reduce((sum, b) => sum + Number(b.net_payable_amount ?? b.amount), 0);
  }, [monthBills]);

  const totalChequesIssued = useMemo(() => {
    return monthBills.filter((b) => b.cheque_number && b.cheque_number.trim() !== "").length;
  }, [monthBills]);

  // Account Type Splits (Selected Month)
  const maintBillsCount = useMemo(() => {
    return monthBills.filter((b) => b.account_type === "maintenance").length;
  }, [monthBills]);

  const maintNetAmount = useMemo(() => {
    return monthBills
      .filter((b) => b.account_type === "maintenance" && b.status === "generated")
      .reduce((sum, b) => sum + Number(b.net_payable_amount ?? b.amount), 0);
  }, [monthBills]);

  const salaryBillsCount = useMemo(() => {
    return monthBills.filter((b) => b.account_type === "salary").length;
  }, [monthBills]);

  const salaryNetAmount = useMemo(() => {
    return monthBills
      .filter((b) => b.account_type === "salary" && b.status === "generated")
      .reduce((sum, b) => sum + Number(b.net_payable_amount ?? b.amount), 0);
  }, [monthBills]);


  // --- FINANCIAL YEAR SUMMARY (Entire FY) ---
  const fySummary = useMemo(() => {
    const maintCount = bills.filter((b) => b.account_type === "maintenance").length;
    const salCount = bills.filter((b) => b.account_type === "salary").length;

    const netSum = bills
      .filter((b) => b.status === "generated")
      .reduce((sum, b) => sum + Number(b.net_payable_amount ?? b.amount), 0);

    const chequesCount = bills.filter((b) => b.cheque_number && b.cheque_number.trim() !== "").length;

    return {
      maintCount,
      salCount,
      netSum,
      chequesCount,
    };
  }, [bills]);


  // --- MONTH-WISE BREAKDOWN DATA (April to March) ---
  const monthlyBreakdownData = useMemo(() => {
    return MONTHS_ORDER.map((m) => {
      const filtered = bills.filter((b) => getBillMonth(b.cheque_date) === m.num);
      const maintCount = filtered.filter((b) => b.account_type === "maintenance").length;
      const salaryCount = filtered.filter((b) => b.account_type === "salary").length;
      
      const netSum = filtered
        .filter((b) => b.status === "generated")
        .reduce((sum, b) => sum + Number(b.net_payable_amount ?? b.amount), 0);

      return {
        monthNum: m.num,
        monthName: m.name,
        maintCount,
        salaryCount,
        netAmount: netSum,
      };
    });
  }, [bills]);

  const handleFyChange = (newFy: string) => {
    setSelectedFy(newFy);
    document.cookie = `financial_year=${newFy}; path=/; max-age=31536000`;
    router.refresh();
  };

  const getMonthName = (numStr: string) => {
    if (numStr === "all") return "All Months";
    const item = MONTHS_ORDER.find((m) => String(m.num) === numStr);
    return item ? item.name : "";
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PREMIUM HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/20 text-xs font-semibold text-indigo-200">
              <Sparkles className="h-3 w-3" />
              <span>Office Portal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome, <span className="text-indigo-400">{principalName || "Principal"}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Consolidated financial metrics tracking. Filter DC Bills across accounts for A.Y. <span className="font-bold text-white">{selectedFy}</span>.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
            <Link href="/bills/new?account_type=maintenance" className="flex-1 md:flex-initial">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 w-full transition-all duration-200 hover:shadow-md hover:shadow-indigo-600/10">
                <FilePlus2 className="h-4 w-4" />
                Create DC Bill
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC FILTERS BAR */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-600" />
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarRange className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Date & FY Filtering</p>
              <p className="text-[10px] text-slate-400">Scoping metrics dynamically</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Financial Year Selector */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Academic Year
              </label>
              <select
                value={selectedFy}
                onChange={(e) => handleFyChange(e.target.value)}
                className="w-full sm:w-[130px] text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer min-h-[38px]"
              >
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
                <option value="2026-27">2026-27</option>
                <option value="2027-28">2027-28</option>
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Statement Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-[150px] text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer min-h-[38px]"
              >
                <option value="all">All Months</option>
                {MONTHS_ORDER.map((m) => (
                  <option key={m.num} value={String(m.num)}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. METRICS CARDS GRID (Selected Month) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Statement Period: <span className="text-slate-800 font-extrabold">{getMonthName(selectedMonth)}</span>
          </h3>
          {selectedMonth !== "all" && (
            <button
              onClick={() => setSelectedMonth("all")}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Reset to all months
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total DC Bills Count */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total DC Bills
              </CardTitle>
              <ReceiptText className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{dcBillsCount}</div>
              <p className="text-[10px] text-slate-400 mt-1">Submitted in statement range</p>
            </CardContent>
          </Card>

          {/* Total Net Amount */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Total Net Amount
              </CardTitle>
              <Landmark className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                ₹{totalNetAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Aggregate net processed</p>
            </CardContent>
          </Card>

          {/* Maintenance Account Split */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Maintenance Account
              </CardTitle>
              <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors">MA</span>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-black text-slate-800">
                ₹{maintNetAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                Bills Count: <span className="text-slate-800 font-bold">{maintBillsCount}</span>
              </p>
            </CardContent>
          </Card>

          {/* Salary Account Split */}
          <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/5 rounded-bl-full pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                Salary Account
              </CardTitle>
              <span className="text-[10px] font-black text-slate-400 group-hover:text-purple-600 transition-colors">SA</span>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-black text-slate-800">
                ₹{salaryNetAmount.toLocaleString("en-IN")}
              </div>
              <p className="text-[10px] text-slate-500 font-semibold">
                Bills Count: <span className="text-slate-800 font-bold">{salaryBillsCount}</span>
              </p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 4. FINANCIAL YEAR ACCOUNT SUMMARY (Whole FY) */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 bottom-0 w-1 bg-indigo-600" />
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Financial Year Aggregates ({selectedFy})
              </CardTitle>
              <p className="text-[10px] text-slate-400">
                Aggregated performance metrics computed across all months of the academic year
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {/* Maintenance Count */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Maint Bills
              </p>
              <p className="text-xl font-black text-slate-800">{fySummary.maintCount}</p>
            </div>

            {/* Salary Count */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Salary Bills
              </p>
              <p className="text-xl font-black text-slate-800">{fySummary.salCount}</p>
            </div>

            {/* Total Net Amount */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Net Amount
              </p>
              <p className="text-base font-black text-indigo-700 truncate px-1">
                ₹{fySummary.netSum.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>

            {/* Total Cheques Issued */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cheques Issued
              </p>
              <p className="text-xl font-black text-slate-800">{fySummary.chequesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. MONTHLY BREAKDOWN & RECENT LISTING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Breakdown Grid Card */}
        <Card className="border-slate-200 shadow-sm bg-white lg:col-span-2 overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20">
            <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Monthly Statement Breakdown
            </CardTitle>
            <p className="text-[10px] text-slate-400">
              Month-by-month billing analysis from April to March
            </p>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto max-h-[380px]">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="font-bold text-xs text-slate-700">Month Name</TableHead>
                  <TableHead className="font-bold text-xs text-slate-700 text-center">Maint Bills</TableHead>
                  <TableHead className="font-bold text-xs text-slate-700 text-center">Salary Bills</TableHead>
                  <TableHead className="font-bold text-xs text-slate-700 text-right">Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyBreakdownData.map((m, idx) => {
                  const isCurrentActive = selectedMonth !== "all" && String(m.monthNum) === selectedMonth;
                  return (
                    <TableRow 
                      key={idx}
                      onClick={() => setSelectedMonth(String(m.monthNum))}
                      className={`hover:bg-indigo-50/40 text-slate-700 border-b border-slate-100 transition-colors cursor-pointer ${
                        isCurrentActive ? "bg-indigo-50/60 font-semibold" : ""
                      }`}
                    >
                      <TableCell className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        {isCurrentActive && <ChevronRight className="h-3 w-3 text-indigo-600 animate-pulse" />}
                        <span>{m.monthName}</span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 text-center">{m.maintCount}</TableCell>
                      <TableCell className="text-xs text-slate-600 text-center">{m.salaryCount}</TableCell>
                      <TableCell className="text-xs font-black text-slate-800 text-right">
                        ₹{m.netAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Bills Mini Panel */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/20 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 uppercase tracking-wider">
                Recent DC Bills
              </CardTitle>
              <p className="text-[10px] text-slate-400">Latest 5 generated bills</p>
            </div>
            <Link
              href="/bills?account_type=maintenance"
              className="text-xs text-indigo-650 hover:text-indigo-850 hover:underline font-bold flex items-center gap-1.5"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y divide-slate-100">
            {bills.slice(0, 5).length > 0 ? (
              bills.slice(0, 5).map((bill) => (
                <div key={bill.id} className="p-3.5 hover:bg-slate-50/50 space-y-1.5 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {bill.dc_bill_number}
                    </span>
                    <span
                      className={`inline-flex items-center text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                        bill.account_type === "salary"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {bill.account_type === "salary" ? "Salary" : "Maint"}
                    </span>
                  </div>

                  <div className="flex justify-between items-end text-[10px] text-slate-500 gap-4">
                    <span className="truncate max-w-[140px] font-semibold text-slate-600">
                      {bill.payee_name}
                    </span>
                    <span className="font-black text-slate-800">
                      ₹{Number(bill.net_payable_amount ?? bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 px-4 text-xs text-slate-450 space-y-1">
                <ShieldAlert className="h-6 w-6 text-slate-350 mx-auto" />
                <p>No DC Bills recorded for A.Y. {selectedFy}.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
