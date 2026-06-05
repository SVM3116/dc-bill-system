"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Calendar, Filter, X } from "lucide-react";

interface BillItem {
  dc_bill_number: string;
  cheque_number: string;
  cheque_date: string;
  payee_name: string;
  amount: number;
  net_payable_amount: number | null;
  account_type: string;
  particulars: string;
}

interface ChequeRegisterClientProps {
  initialBills: BillItem[];
  financialYear: string;
  initialAccountType: string;
  initialFromDate: string;
  initialToDate: string;
}

export function ChequeRegisterClient({
  initialBills,
  financialYear,
  initialAccountType,
  initialFromDate,
  initialToDate,
}: ChequeRegisterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local filter states
  const [fy, setFy] = useState(financialYear);
  const [accountType, setAccountType] = useState(initialAccountType);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);

  // Sync state with url changes when parent props update
  React.useEffect(() => {
    setFy(financialYear);
    setAccountType(initialAccountType);
    setFromDate(initialFromDate);
    setToDate(initialToDate);
  }, [financialYear, initialAccountType, initialFromDate, initialToDate]);

  // Apply filters by updating search parameters immediately
  const applyFilters = (updated: {
    fy?: string;
    accountType?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const nextFy = updated.fy !== undefined ? updated.fy : fy;
    const nextAccountType = updated.accountType !== undefined ? updated.accountType : accountType;
    const nextFromDate = updated.fromDate !== undefined ? updated.fromDate : fromDate;
    const nextToDate = updated.toDate !== undefined ? updated.toDate : toDate;

    const params = new URLSearchParams();
    if (nextFy) params.set("financial_year", nextFy);
    if (nextAccountType) params.set("account_type", nextAccountType);
    if (nextFromDate) params.set("from_date", nextFromDate);
    if (nextToDate) params.set("to_date", nextToDate);
    router.push(`/cheque-register?${params.toString()}`);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFy(financialYear);
    setAccountType("all");
    setFromDate("");
    setToDate("");
    router.push("/cheque-register");
  };

  // Zero-dependency Excel HTML export supporting multiline particulars via <br>
  const handleExportExcel = () => {
    const headers = [
      "DC Bill No",
      "Cheque No",
      "Date",
      "Payee",
      "Net Amount",
      "Particulars",
    ];

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Cheque Register</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta charset="utf-8">
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; }
          th { background-color: #f1f5f9; border: 1px solid #cbd5e1; font-weight: bold; padding: 10px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 10px; vertical-align: top; white-space: pre-line; }
        </style>
      </head>
      <body>
        <h2>Cheque Issue Register (${fy})</h2>
        <p>Filters Applied - Account Type: ${accountType.toUpperCase()} | Date Range: ${fromDate || "Any"} to ${toDate || "Any"}</p>
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
    `;

    initialBills.forEach((bill) => {
      const formattedDate = bill.cheque_date
        ? new Date(bill.cheque_date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "";
      const netAmount = Number(bill.net_payable_amount ?? bill.amount).toFixed(2);
      const formattedParticulars = bill.particulars.replace(/\n/g, "<br>");

      html += `
        <tr>
          <td>${bill.dc_bill_number || ""}</td>
          <td style="mso-number-format:'\\@';">${bill.cheque_number || ""}</td>
          <td>${formattedDate}</td>
          <td>${bill.payee_name || ""}</td>
          <td>${netAmount}</td>
          <td>${formattedParticulars}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cheque_Register_${fy}_${accountType}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF download redirects to server landscape PDF API
  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (fy) params.set("financial_year", fy);
    if (accountType) params.set("account_type", accountType);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    
    window.open(`/api/cheque-register-pdf?${params.toString()}&download=true`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-800">
            Cheque Issue Register <span className="text-blue-700 font-bold">({fy})</span>
          </h2>
          <p className="text-xs text-slate-500">
            Automatically compiled cheque register from generated school DC Bills
          </p>
        </div>

        {/* Action Buttons */}
        {initialBills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 sm:h-9"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Download Excel
            </Button>
            <Button
              onClick={handleExportPDF}
              className="flex-1 sm:flex-initial bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 h-10 sm:h-9"
            >
              <FileText className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filter Card */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Financial Year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Financial Year
              </label>
              <select
                value={fy}
                onChange={(e) => {
                  setFy(e.target.value);
                  applyFilters({ fy: e.target.value });
                }}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              >
                <option value="2024-25">A.Y. 2024-25</option>
                <option value="2025-26">A.Y. 2025-26</option>
                <option value="2026-27">A.Y. 2026-27</option>
                <option value="2027-28">A.Y. 2027-28</option>
              </select>
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => {
                  setAccountType(e.target.value);
                  applyFilters({ accountType: e.target.value });
                }}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              >
                <option value="all">All Accounts</option>
                <option value="maintenance">Maintenance</option>
                <option value="salary">Salary</option>
              </select>
            </div>

            {/* From Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  applyFilters({ fromDate: e.target.value });
                }}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              />
            </div>

            {/* To Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  applyFilters({ toDate: e.target.value });
                }}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[38px]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handleResetFilters}
              className="w-full sm:w-auto text-slate-500 hover:text-slate-700 font-semibold text-xs h-9"
            >
              <X className="h-4 w-4 mr-1.5" />
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {initialBills.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="font-semibold text-xs text-slate-700 w-[140px]">
                      DC Bill No
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 w-[120px]">
                      Cheque No
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 w-[180px]">
                      Payee
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 text-right w-[120px]">
                      Net Amount
                    </TableHead>
                    <TableHead className="font-semibold text-xs text-slate-700 min-w-[250px]">
                      Particulars
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialBills.map((bill, index) => (
                    <TableRow
                      key={index}
                      className="hover:bg-slate-50 text-slate-700 border-b border-slate-100"
                    >
                      <TableCell className="font-bold text-xs text-slate-800">
                        {bill.dc_bill_number}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">
                        {bill.cheque_number}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {bill.cheque_date
                          ? new Date(bill.cheque_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : ""}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">
                        {bill.payee_name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-800 font-black text-right">
                        ₹
                        {Number(bill.net_payable_amount ?? bill.amount).toLocaleString(
                          "en-IN",
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed py-3">
                        {bill.particulars}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <Calendar className="mx-auto h-10 w-10 text-slate-400" />
              <h3 className="mt-2 text-sm font-semibold text-slate-800">
                No cheque register records found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Generated DC Bills for this period will appear here automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
