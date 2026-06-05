"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, 
  Sparkles, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  LockKeyhole, 
  ShieldCheck, 
  Code, 
  Check,
  Zap,
  ArrowUpRight,
  Filter,
  FileSpreadsheet,
  Download,
  CalendarDays,
  LayoutDashboard,
  RotateCcw,
  Loader2,
  FileArchive
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
    style={props.style}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Home() {
  // Simulator navigation tab
  const [activeTab, setActiveTab] = useState<"dc_bill" | "cheque_register">("dc_bill");

  // DC Bill inputs state
  const [payeeName, setPayeeName] = useState("One Rupee Software Solutions");
  const [payeeAddress, setPayeeAddress] = useState("Sulibele Road, Devanahalli Taluk, Bangalore Rural");
  const [dcBillNumber, setDcBillNumber] = useState("05/2026-27");
  const [chequeNumber, setChequeNumber] = useState("982919");
  const [chequeDate, setChequeDate] = useState("2026-06-05");
  const [billNumber, setBillNumber] = useState("BILL-082");
  const [billDate, setBillDate] = useState("2026-06-05");
  const [particulars, setParticulars] = useState("Software development & automation support");
  const [grossAmount, setGrossAmount] = useState(15000);
  const [deductionType, setDeductionType] = useState("TDS (2%)");
  const [deductionMode, setDeductionMode] = useState<"percentage" | "fixed">("percentage");
  const [deductionValue, setDeductionValue] = useState(2);

  // Cheque Register inputs state
  const [regAccountType, setRegAccountType] = useState<"all" | "maintenance" | "salary">("all");
  const [regFromDate, setRegFromDate] = useState("2026-04-01");
  const [regToDate, setRegToDate] = useState("2026-06-05");
  const [regSearch, setRegSearch] = useState("");

  // Simulated Zipping State
  const [zippingState, setZippingState] = useState<"idle" | "zipping" | "success">("idle");
  const [zipProgress, setZipProgress] = useState(0);
  const [zipText, setZipText] = useState("");

  // Calculations for the simulator
  const calculatedDeduction = deductionMode === "percentage" 
    ? (grossAmount * deductionValue) / 100 
    : deductionValue;
  
  const netPayable = Math.max(0, grossAmount - calculatedDeduction);

  // Parse financial year dynamically from DC Bill number
  let financialYear = "2026-27";
  if (dcBillNumber && dcBillNumber.includes("/")) {
    financialYear = dcBillNumber.split("/")[1].trim();
  }

  // Format date helper for the preview
  function formatDateForPreview(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  // Helper to convert number to words (simple English conversion for simulator)
  function numberToWords(num: number): string {
    if (num === 0) return "Zero Rupees Only";
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    function helper(n: number): string {
      if (n < 20) return units[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + units[n % 10] : "");
      if (n < 1000) return units[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + helper(n % 100) : "");
      if (n < 100000) return helper(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + helper(n % 1000) : "");
      return String(n);
    }
    
    return helper(Math.floor(num)) + " Rupees Only";
  }

  // Handle simulated ZIP download trigger
  const triggerSimulatedZip = () => {
    setZippingState("zipping");
    setZipProgress(10);
    setZipText("Querying generated documents from database...");
    
    const steps = [
      { progress: 30, text: "Compiling Maintenance DC Bills into buffer..." },
      { progress: 50, text: "Generating timezone-independent footer watermarks..." },
      { progress: 75, text: "Compressing PDFs using JSZip compression engine..." },
      { progress: 95, text: "Generating ZIP archive download stream..." },
      { progress: 100, text: "ZIP compilation completed successfully!" }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setZipProgress(step.progress);
        setZipText(step.text);
        if (step.progress === 100) {
          setTimeout(() => {
            setZippingState("success");
            // Auto reset back to idle after 3 seconds
            setTimeout(() => {
              setZippingState("idle");
              setZipProgress(0);
              setZipText("");
            }, 3000);
          }, 800);
        }
      }, (index + 1) * 600);
    });
  };

  // Simulated cheque register data based on filters
  const mockChequeRegisterData = [
    {
      dcBillNo: "01/2026-27",
      chequeNo: "982915",
      date: "2026-04-12",
      payee: "Sri Durga Electricals",
      netAmount: 8400.00,
      particulars: "1. LED Tube lights purchase\n2. Electrical socket repairs",
      accountType: "maintenance"
    },
    {
      dcBillNo: "02/2026-27",
      chequeNo: "982916",
      date: "2026-04-28",
      payee: "K. Ramappa (Guest Teacher)",
      netAmount: 14500.00,
      particulars: "1. Guest Teacher salary (A.Y. 24-25)\n2. Math lecturer allowance",
      accountType: "salary"
    },
    {
      dcBillNo: dcBillNumber,
      chequeNo: chequeNumber,
      date: chequeDate,
      payee: payeeName,
      netAmount: netPayable,
      particulars: `1. ${particulars}\n2. Taxes deducted: ${deductionType}`,
      accountType: "maintenance"
    },
    {
      dcBillNo: "06/2026-27",
      chequeNo: "982920",
      date: "2026-06-02",
      payee: "Manjunath Computers",
      netAmount: 4200.00,
      particulars: "1. Printer toner cartridges\n2. Desktop diagnostic charges",
      accountType: "maintenance"
    }
  ];

  // Filter the cheque register mock data dynamically
  const filteredRegisterData = mockChequeRegisterData.filter(row => {
    // 1. Account type filter
    if (regAccountType !== "all" && row.accountType !== regAccountType) {
      return false;
    }
    // 2. Date range filter
    if (regFromDate && row.date < regFromDate) return false;
    if (regToDate && row.date > regToDate) return false;
    // 3. Search query filter
    if (regSearch) {
      const q = regSearch.toLowerCase();
      const matchPayee = row.payee.toLowerCase().includes(q);
      const matchBill = row.dcBillNo.toLowerCase().includes(q);
      const matchCheque = row.chequeNo.toLowerCase().includes(q);
      return matchPayee || matchBill || matchCheque;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* 1. STICKY FROSTED HEADER */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-700 text-white p-2 rounded-xl shadow-md shadow-blue-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[9px] font-black tracking-widest text-indigo-700 uppercase leading-none">Government of Karnataka</p>
              <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight mt-0.5">KREIS DC Bill Platform</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/developer" 
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:inline-flex items-center gap-1.5 bg-slate-100 px-3.5 py-1.5 rounded-lg hover:bg-slate-200"
            >
              <Code className="h-3.5 w-3.5" />
              Developer Profile
            </Link>
            <Link
              href="/login"
              className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/25 hover:shadow-md transition-all flex items-center gap-1"
            >
              Staff Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO & INTERACTIVE PREVIEW SEGMENT */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:px-6 border-b border-slate-200/50 bg-gradient-to-b from-white via-white to-slate-50/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-50/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6 text-left lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              SaaS Multi-Tenant Edition
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Automate Your School <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-950">
                Detailed Contingency Bills
              </span>
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg">
              Say goodbye to manual templates. Instantly compile official KREIS DC Bills & Hand Vouchers, customize deduction ledgers, calculate taxes, download documents in bulk, and generate landscape cheque registers dynamically.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md shadow-indigo-600/15 text-white bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Office Staff Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
              >
                Create Admin Account
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/60">
              <div>
                <p className="text-xl md:text-2xl font-black text-indigo-600">100%</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Kannada Font Compliant</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-emerald-600">Auto</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Cheque Issue Register</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-amber-600">Live</p>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Filters & PDF Stamps</p>
              </div>
            </div>
          </div>

          {/* Right Interactive Simulator Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 p-5 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-600 to-blue-600"></div>
              
              {/* Simulator Header & Tabs */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-left">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-xs md:text-sm">Platform Core Modules Simulator</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Test interactive rendering outputs instantly</p>
                  </div>
                </div>

                {/* Sliding segment tabs */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-center sm:self-auto">
                  <button
                    onClick={() => setActiveTab("dc_bill")}
                    className={`px-3 py-1 text-[10px] font-black tracking-wide uppercase rounded-md transition-all cursor-pointer ${activeTab === "dc_bill" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    DC Bill PDF
                  </button>
                  <button
                    onClick={() => setActiveTab("cheque_register")}
                    className={`px-3 py-1 text-[10px] font-black tracking-wide uppercase rounded-md transition-all cursor-pointer ${activeTab === "cheque_register" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Cheque Register
                  </button>
                </div>
              </div>

              {/* Side by side layout on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Inputs Form Panel */}
                <div className="md:col-span-5 space-y-3 text-left">
                  
                  {activeTab === "dc_bill" ? (
                    // DC Bill Tab Inputs
                    <>
                      {/* Payee Info */}
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Payee Information</p>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Vendor Name</label>
                          <input 
                            type="text" 
                            value={payeeName}
                            onChange={(e) => setPayeeName(e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            placeholder="Payee vendor name"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Vendor Address</label>
                          <textarea 
                            value={payeeAddress}
                            onChange={(e) => setPayeeAddress(e.target.value)}
                            rows={2}
                            className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium resize-none"
                            placeholder="Payee full address"
                          />
                        </div>
                      </div>

                      {/* Reference details */}
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Reference &amp; Cheque</p>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">DC Bill Number</label>
                          <input 
                            type="text" 
                            value={dcBillNumber}
                            onChange={(e) => setDcBillNumber(e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            placeholder="e.g. 05/2026-27"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">Cheque Number</label>
                            <input 
                              type="text" 
                              value={chequeNumber}
                              onChange={(e) => setChequeNumber(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                              placeholder="Cheque #"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">Cheque Date</label>
                            <input 
                              type="date" 
                              value={chequeDate}
                              onChange={(e) => setChequeDate(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-2 pb-1">
                        <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Item &amp; Tax Details</p>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">Item Bill No</label>
                            <input 
                              type="text" 
                              value={billNumber}
                              onChange={(e) => setBillNumber(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                              placeholder="e.g. BILL-082"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">Item Bill Date</label>
                            <input 
                              type="date" 
                              value={billDate}
                              onChange={(e) => setBillDate(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Item Particulars</label>
                          <input 
                            type="text" 
                            value={particulars}
                            onChange={(e) => setParticulars(e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            placeholder="Purpose description"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Gross Amount (₹)</label>
                          <input 
                            type="number" 
                            value={grossAmount}
                            onChange={(e) => setGrossAmount(Number(e.target.value))}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            placeholder="Amount"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Tax Ledger</label>
                          <select 
                            value={deductionType}
                            onChange={(e) => {
                              setDeductionType(e.target.value);
                              if (e.target.value.includes("TDS")) {
                                setDeductionMode("percentage");
                                setDeductionValue(2);
                              } else if (e.target.value.includes("GST")) {
                                setDeductionMode("percentage");
                                setDeductionValue(4);
                              } else {
                                setDeductionMode("fixed");
                                setDeductionValue(500);
                              }
                            }}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium cursor-pointer"
                          >
                            <option value="TDS (2%)">TDS (2% Percentage)</option>
                            <option value="GST (4%)">GST (4% Percentage)</option>
                            <option value="Security Deposit (Fixed ₹500)">Security Deposit (Fixed ₹500)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Cheque Register Tab Inputs (Mirroring real list filters)
                    <>
                      <div className="space-y-4">
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3 space-y-1">
                          <div className="flex items-center gap-1 text-indigo-700 font-extrabold text-[10px] uppercase">
                            <Filter className="h-3 w-3" />
                            <span>Live Filter Panel</span>
                          </div>
                          <p className="text-[9px] text-slate-500 leading-normal font-medium">
                            Demonstrates immediate dynamic update of Cheque Register on selector value change, without apply buttons.
                          </p>
                        </div>

                        {/* Search Query */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Live Search Input</label>
                          <input 
                            type="text" 
                            value={regSearch}
                            onChange={(e) => setRegSearch(e.target.value)}
                            className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            placeholder="Type Payee name to search..."
                          />
                          <span className="text-[8px] text-slate-400 font-semibold italic mt-0.5 block">Includes 350ms input debounce</span>
                        </div>

                        {/* Account Type */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-slate-500 uppercase">Account Type</label>
                          <select 
                            value={regAccountType}
                            onChange={(e) => setRegAccountType(e.target.value as any)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium cursor-pointer"
                          >
                            <option value="all">All Accounts (Maintenance &amp; Salary)</option>
                            <option value="maintenance">Maintenance Account Only</option>
                            <option value="salary">Salary Account Only</option>
                          </select>
                        </div>

                        {/* Date Range filters */}
                        <div className="space-y-2.5">
                          <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Cheque Date Range</p>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">From Date</label>
                            <input 
                              type="date" 
                              value={regFromDate}
                              onChange={(e) => setRegFromDate(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-500 uppercase">To Date</label>
                            <input 
                              type="date" 
                              value={regToDate}
                              onChange={(e) => setRegToDate(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-600 bg-slate-50/50 font-medium"
                            />
                          </div>
                        </div>

                        {/* Reset indicator */}
                        <button
                          onClick={() => {
                            setRegAccountType("all");
                            setRegFromDate("2026-04-01");
                            setRegToDate("2026-06-05");
                            setRegSearch("");
                          }}
                          className="w-full text-center flex items-center justify-center gap-1 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-[10px] text-slate-500 hover:text-slate-800 font-bold transition-all cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset Simulator Filters
                        </button>
                      </div>
                    </>
                  )}

                  {/* Simulated ZIP Downloader Showcase Widget */}
                  <div className="pt-4 border-t border-slate-100 text-left">
                    <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase mb-2">ZIP Packager Actions</p>
                    {zippingState === "idle" ? (
                      <button
                        onClick={triggerSimulatedZip}
                        className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        <FileArchive className="h-3.5 w-3.5" />
                        Simulate Bulk ZIP Download
                      </button>
                    ) : zippingState === "zipping" ? (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 text-indigo-600 animate-spin" />
                            Zipping PDFs...
                          </span>
                          <span>{zipProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                            style={{ width: `${zipProgress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-450 italic leading-none font-semibold truncate">{zipText}</p>
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-black animate-fade-in">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        ZIP package download started!
                      </div>
                    )}
                  </div>

                </div>

                {/* PDF Preview Panel - Portrait A4 or Landscape A4 replica */}
                <div className="md:col-span-7 w-full flex flex-col justify-center">
                  
                  {activeTab === "dc_bill" ? (
                    // Portrait A4 Preview
                    <div className="w-full max-w-[400px] mx-auto bg-white border border-slate-350 shadow-md p-[3px] select-none text-slate-900 relative">
                      {/* Outer Border */}
                      <div className="border border-black p-0.5">
                        {/* Inner Border Container */}
                        <div className="border-[0.5px] border-black p-3.5 min-h-[520px] flex flex-col justify-between text-[8px] leading-tight relative font-nudi">
                          
                          {/* Page label */}
                          <div className="absolute top-1 right-2 text-[7px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                            PDF Page Preview (A4 Portrait)
                          </div>

                          {/* Government Header */}
                          <div className="text-center space-y-0.5 border-b border-black pb-1.5">
                            <p className="font-extrabold text-[10px] text-black">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</p>
                            <p className="font-bold text-[8.5px] text-black">ಕರ್ನಾಟಕ ವಸತಿ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳ ಸಂಘ, ಬೆಂಗಳೂರು</p>
                            <p className="font-bold text-[8.5px] text-black">ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ (ಹಿಂ.ವ-05), ಸೂಲಿಬೆಲೆ.</p>
                            <p className="text-[7.5px] text-black">ಹೊಸಕೋಟೆ ತಾಲ್ಲೂಕು, ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ ಜಿಲ್ಲೆ - 562129.</p>
                            <hr className="border-black border-t-[0.5px] my-1" />
                            <p className="font-bold text-[8px]">ನಿರ್ವಹಣಾ ಖಾತೆ - {financialYear}</p>
                            <p className="font-bold text-[8px]">ಖಾತೆ ಸಂಖ್ಯೆ :- SB A/c *******8921</p>
                            <p className="font-bold text-[8px]">ಖಾತೆ ನಿರ್ವಹಣೆ:- ಪ್ರಾಂಶುಪಾಲರು, ಮೊ.ದೇ.ವ.ಶಾಲೆ, ಸೂಲಿಬೆಲೆ</p>
                          </div>

                          {/* Metadata Grid Box */}
                          <div className="border border-black text-left mt-2 text-[7.5px] bg-white font-medium">
                            <div className="flex border-b border-black">
                              <div className="w-[32%] border-r border-black p-1 font-bold">ಡಿ.ಸಿ. ಬಿಲ್ ಸಂಖ್ಯೆ :-</div>
                              <div className="w-[68%] p-1 font-bold">{dcBillNumber}</div>
                            </div>
                            <div className="flex border-b border-black">
                              <div className="w-[32%] border-r border-black p-1 font-bold">ಚೆಕ್ ಸಂಖ್ಯೆ / ದಿನಾಂಕ :-</div>
                              <div className="w-[68%] p-1 font-mono">{chequeNumber} / {formatDateForPreview(chequeDate)}</div>
                            </div>
                            <div className="flex border-b border-black">
                              <div className="w-[32%] border-r border-black p-1 font-bold">ಪಾವತಿದಾರರು :-</div>
                              <div className="w-[68%] p-1 space-y-0.5">
                                <div className="font-bold">{payeeName}</div>
                                <div className="text-[7px] leading-tight text-slate-700">{payeeAddress}</div>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="w-[32%] border-r border-black p-1 font-bold">ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ :-</div>
                              <div className="w-[68%] p-1 font-bold font-mono">{Number(netPayable).toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="text-center font-bold text-[8.5px] my-1.5">
                            ವಿವರಗಳು :-
                          </div>

                          {/* Table layout */}
                          <div className="border border-black rounded-none overflow-hidden text-[7.5px]">
                            <div className="grid grid-cols-12 bg-neutral-50 border-b border-black font-bold text-center">
                              <div className="col-span-1 border-r border-black py-0.5">ಕ್ರ.ಸಂ.</div>
                              <div className="col-span-3 border-r border-black py-0.5">ಬಿಲ್ ಸಂಖ್ಯೆ / ದಿನಾಂಕ</div>
                              <div className="col-span-5 border-r border-black py-0.5 text-left pl-1">ಪಾವತಿ ವಿವರ</div>
                              <div className="col-span-3 py-0.5 text-right pr-1">ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ</div>
                            </div>

                            <div className="grid grid-cols-12 border-b border-black items-center">
                              <div className="col-span-1 border-r border-black py-1 text-center font-bold">1</div>
                              <div className="col-span-3 border-r border-black py-1 px-1 font-mono break-all">
                                {billNumber} / {formatDateForPreview(billDate)}
                              </div>
                              <div className="col-span-5 border-r border-black py-1 px-1 break-words font-medium">
                                {particulars}
                              </div>
                              <div className="col-span-3 py-1 px-1 text-right font-mono font-bold">
                                {Number(grossAmount).toFixed(2)}
                              </div>
                            </div>

                            {calculatedDeduction > 0 && (
                              <div className="grid grid-cols-12 border-b border-black items-center text-[7px]">
                                <div className="col-span-1 border-r border-black py-1 text-center font-bold">2</div>
                                <div className="col-span-3 border-r border-black py-1 px-1 font-mono">Deduct-Tax</div>
                                <div className="col-span-5 border-r border-black py-1 px-1 text-red-700 font-medium">
                                  ಕಡಿತ (Deduction) - {deductionType}
                                </div>
                                <div className="col-span-3 py-1 px-1 text-right font-mono font-bold text-red-600">
                                  -{Number(calculatedDeduction).toFixed(2)}
                                </div>
                              </div>
                            )}

                            {calculatedDeduction > 0 ? (
                              <>
                                <div className="grid grid-cols-12 border-b border-black font-bold text-[7px] items-center">
                                  <div className="col-span-9 border-r border-black py-0.5 px-1 text-right">
                                    ಒಟ್ಟು ಮೊತ್ತ (Gross Total):
                                  </div>
                                  <div className="col-span-3 py-0.5 px-1 text-right font-mono">
                                    {Number(grossAmount).toFixed(2)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-12 border-b border-black font-bold text-[7px] items-center">
                                  <div className="col-span-9 border-r border-black py-0.5 px-1 text-right">
                                    ಒಟ್ಟು ಕಡಿತಗಳು (Deductions):
                                  </div>
                                  <div className="col-span-3 py-0.5 px-1 text-right font-mono text-red-600">
                                    -{Number(calculatedDeduction).toFixed(2)}
                                  </div>
                                </div>
                                <div className="grid grid-cols-12 font-bold bg-slate-50/80 items-center">
                                  <div className="col-span-9 border-r border-black py-0.5 px-1 text-right text-indigo-900">
                                    ನಿವ್ವಳ ಪಾವತಿ (Net Payable):
                                  </div>
                                  <div className="col-span-3 py-0.5 px-1 text-right font-mono text-indigo-950 font-black">
                                    {Number(netPayable).toFixed(2)}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="grid grid-cols-12 font-bold bg-slate-50/80 items-center">
                                <div className="col-span-9 border-r border-black py-0.5 px-1 text-right">
                                  ಒಟ್ಟು ಮೊತ್ತ:
                                </div>
                                <div className="col-span-3 py-0.5 px-1 text-right font-mono font-black">
                                  {Number(grossAmount).toFixed(2)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Amount in words */}
                          <div className="mt-2 text-[7.5px] italic text-slate-800 border-b border-dashed border-slate-300 pb-1.5">
                            <span className="font-bold text-slate-700 not-italic">Amount in Rupees :- </span>
                            {numberToWords(netPayable)}
                          </div>

                          {/* Signatures */}
                          <div className="flex justify-between items-end pt-4 text-[7.5px] leading-tight">
                            <div className="w-[45%] text-center">
                              <div className="border-b border-slate-800 border-dotted h-3.5 w-full"></div>
                              <p className="font-bold text-black mt-0.5">ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ</p>
                            </div>
                            <div className="w-[45%] text-center">
                              <div className="border-b border-slate-800 border-dotted h-3.5 w-full"></div>
                              <p className="font-bold text-black mt-0.5">ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ</p>
                            </div>
                          </div>

                          {/* PDF Footer Watermark */}
                          <div className="absolute bottom-1 right-1 text-[5px] text-right font-mono text-slate-400/80 pointer-events-none scale-[0.85] origin-bottom-right leading-none">
                            <div>DC BILL : {dcBillNumber}</div>
                            <div>Generated On: {new Date().toLocaleDateString("en-IN")}</div>
                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    // Landscape Cheque Register Preview
                    <div className="w-full bg-white border border-slate-350 shadow-md p-[3px] select-none text-slate-900 relative min-h-[360px] flex flex-col justify-between">
                      {/* Outer Border */}
                      <div className="border border-black p-0.5 flex-1 flex flex-col">
                        {/* Inner Border Container */}
                        <div className="border-[0.5px] border-black p-3 flex-1 flex flex-col justify-between text-[7px] leading-tight font-sans relative">
                          
                          {/* Page label */}
                          <div className="absolute top-1.5 right-2 text-[6px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                            PDF Page Preview (A4 Landscape)
                          </div>

                          {/* Header */}
                          <div className="border-b border-black pb-1 mb-2 text-left">
                            <h4 className="font-black text-[9px] text-black">Cheque Issue Register ({financialYear})</h4>
                            <p className="text-[6.5px] text-slate-500 font-semibold">
                              Account: {regAccountType === "all" ? "All Accounts" : regAccountType === "maintenance" ? "Maintenance Only" : "Salary Only"} | Range: {regFromDate} to {regToDate}
                            </p>
                          </div>

                          {/* Landscape Table */}
                          <div className="border border-black flex-1 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-black font-bold text-center">
                                  <th className="border-r border-black p-1 text-[6.5px] text-center w-[15%]">DC Bill No</th>
                                  <th className="border-r border-black p-1 text-[6.5px] text-center w-[12%]">Cheque No</th>
                                  <th className="border-r border-black p-1 text-[6.5px] text-center w-[12%]">Date</th>
                                  <th className="border-r border-black p-1 text-[6.5px] text-left w-[20%]">Payee</th>
                                  <th className="border-r border-black p-1 text-[6.5px] text-right w-[15%]">Amount</th>
                                  <th className="p-1 text-[6.5px] text-left">Particulars</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredRegisterData.length > 0 ? (
                                  filteredRegisterData.map((row, index) => (
                                    <tr key={index} className="border-b border-black/50 hover:bg-slate-50/50">
                                      <td className="border-r border-black p-1 text-center font-bold font-mono">{row.dcBillNo}</td>
                                      <td className="border-r border-black p-1 text-center font-mono">{row.chequeNo}</td>
                                      <td className="border-r border-black p-1 text-center">{formatDateForPreview(row.date)}</td>
                                      <td className="border-r border-black p-1 font-bold text-black max-w-[70px] truncate">{row.payee}</td>
                                      <td className="border-r border-black p-1 text-right font-mono font-bold">₹{row.netAmount.toFixed(2)}</td>
                                      <td className="p-1 whitespace-pre-line leading-normal text-[6px] text-slate-600 font-medium">
                                        {row.particulars}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-400 font-bold italic">
                                      No matches found. Adjust live filters on the left panel!
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Landscape PDF Watermark */}
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-[6px] text-slate-400 font-bold">Page 1 of 1</span>
                            <div className="text-[5px] text-right font-mono text-slate-400/80 leading-none pointer-events-none">
                              <div>CHEQUE REGISTER : {financialYear}</div>
                              <div>Generated On: {new Date().toLocaleDateString("en-IN")}</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
          
        </div>
      </section>

      {/* 3. PLATFORM CORE FEATURES SECTION */}
      <section className="py-16 px-4 md:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[9px] font-black tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Security &amp; Automation</span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Redesigned Systems &amp; Features</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
            Our platform provides specialized tools configured for the exact workflow of Morarji Desai school administrations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Cheque Register */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-emerald-100">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Cheque Issue Register</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Auto-compiles payees, amounts, and particulars from DC bills into a structured landscape layout. Exports multi-line Excel sheets and landscape PDFs instantly.
            </p>
          </div>

          {/* Card 2: Live Filter Engine */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-blue-100">
              <Filter className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Dynamic Filter Panels</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No manual submit buttons. Select status, dates, and accounts to live-filter records dynamically. Input search queries with a smooth, built-in debounce.
            </p>
          </div>

          {/* Card 3: Bulk ZIP Packager & Watermark */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            <div className="bg-amber-50 text-amber-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner border border-amber-100">
              <Download className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Bulk ZIP &amp; Watermarks</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download entire date ranges of generated bills packaged as a single ZIP. Generates timezone-independent vector footer watermarks on all printed PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW STEPPER */}
      <section className="py-16 px-4 md:px-6 border-t border-slate-200/50 bg-slate-50/40">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[9px] font-black tracking-widest text-indigo-650 bg-indigo-50 px-3 py-1 rounded-full uppercase">Simple Process</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Administrative Workflow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-slate-200 z-0"></div>
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">1</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Secure Account</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Create your school profile using verified administrative credentials.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">2</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Profile Configuration</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Input your Kannada school details, bank metadata, and signatures.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">3</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Direct Ledger Entries</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Add sub-bill rows, configure tax ledgers, and manage details instantly.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">4</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Vector PDF Print</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Generate your formatted sheet. Sign, verify, and complete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEVELOPER SPOTLIGHT CARD */}
      <section className="py-16 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 justify-between border border-slate-800">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
              <Zap className="h-3 w-3" />
              Technical Architect
            </span>
            <h4 className="text-xl md:text-2xl font-extrabold tracking-tight">Manoj Kumar V</h4>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              B.Tech Computer Science and Business Systems student (6th Semester, VTU). Proud Alumnus of Morarji Desai Residential School (Sulibele) and Morarji Desai PU College (Hosakote).
            </p>
          </div>

          <div className="shrink-0 relative z-10 w-full md:w-auto">
            <Link
              href="/developer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 px-5 rounded-lg shadow-lg shadow-indigo-600/15 hover:shadow-xl transition-all cursor-pointer border border-blue-500"
            >
              Check Developer Profile
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. VIEWPORT-STICKY FOOTER */}
      <footer className="border-t border-slate-200/80 py-6 px-4 md:px-6 bg-white text-center text-xs text-slate-500 shrink-0 font-sans">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-3">
          {/* Organization info shown first */}
          <p className="text-slate-800 font-extrabold text-sm tracking-tight text-center">
            Karnataka Residential Educational Institutions Society (KREIS) School Management
          </p>

          <div className="w-16 h-0.5 bg-slate-200 rounded-full" />

          {/* Developer details shown below */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-slate-400 font-semibold text-[11px]">
            <span className="text-slate-500">Developed by</span>
            <Link href="/developer" className="font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline">
              Manoj Kumar V
            </Link>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span className="text-slate-500">Email:</span>
            <a href="mailto:svmmdrpu@gmail.com" className="hover:text-indigo-600 transition-colors">svmmdrpu@gmail.com</a>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span className="text-slate-500">Contact:</span>
            <a href="tel:+917975464020" className="hover:text-indigo-600 transition-colors">+91 7975464020</a>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <a href="https://github.com/SVM3116" target="_blank" rel="noopener noreferrer" className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 bg-slate-50/50" title="GitHub">
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://www.linkedin.com/in/manoj-kumar-v-svm/" target="_blank" rel="noopener noreferrer" className="p-1 rounded-full text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 transition-all border border-slate-200 bg-slate-50/50" title="LinkedIn">
                <LinkedinIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
