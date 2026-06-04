"use client";

import React, { useState } from "react";
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
  Mail, 
  Phone, 
  Check,
  Zap,
  ArrowUpRight
} from "lucide-react";

export default function Home() {
  // Simulator state
  const [payeeName, setPayeeName] = useState("One Rupee Software Solutions");
  const [payeeAddress, setPayeeAddress] = useState("Sulibele Road, Devanahalli Taluk, Bangalore Rural");
  const [dcBillNumber, setDcBillNumber] = useState("05/2026-27");
  const [chequeNumber, setChequeNumber] = useState("982919");
  const [chequeDate, setChequeDate] = useState("2026-06-04");
  const [billNumber, setBillNumber] = useState("BILL-082");
  const [billDate, setBillDate] = useState("2026-06-04");
  const [particulars, setParticulars] = useState("Software development & automation support");
  const [grossAmount, setGrossAmount] = useState(15000);
  const [deductionType, setDeductionType] = useState("TDS (2%)");
  const [deductionMode, setDeductionMode] = useState<"percentage" | "fixed">("percentage");
  const [deductionValue, setDeductionValue] = useState(2);
  const [showLeftSig, setShowLeftSig] = useState(true);

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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-800">
      
      {/* 1. STICKY FROSTED HEADER */}
      <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-2 rounded-lg shadow-md shadow-blue-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-indigo-700 uppercase leading-none">Government of Karnataka</p>
              <h1 className="text-sm md:text-base font-black text-slate-900 tracking-tight mt-0.5">KREIS DC Bill Platform</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/developer" 
              className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline-flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200"
            >
              <Code className="h-3.5 w-3.5" />
              Developer Profile
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md shadow-sm shadow-blue-700/10 hover:shadow-md transition-all flex items-center gap-1"
            >
              Staff Login
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO & INTERACTIVE PREVIEW SEGMENT */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 border-b border-slate-200/50 bg-gradient-to-b from-white via-white to-slate-50/30">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6 text-left lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              SaaS Multi-Tenant Release 2.0
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Automate Your School <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900">
                Detailed Contingency Bills
              </span>
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg">
              Say goodbye to manual templates. Instantly generate official KREIS DC Bills, customize deduction ledgers, calculate tax structures automatically, and print ready-to-sign vector PDFs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-lg shadow-md shadow-blue-700/15 text-white bg-blue-700 hover:bg-blue-800 hover:scale-[1.01] active:scale-[0.99] transition-all"
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
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900">100%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kannada Font Compliant</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900">Instant</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Multi-Page PDF Split</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-slate-900">Active</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cheque Collisions Check</p>
              </div>
            </div>
          </div>

          {/* Right Interactive Simulator Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 p-5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-700 to-indigo-600"></div>
              
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calculator className="h-4.5 w-4.5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm">Live DC Bill Calculations Simulator</h3>
                </div>
                <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Live Preview</span>
              </div>

              {/* Side by side layout on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Inputs Form Panel */}
                <div className="md:col-span-5 space-y-3 text-left">
                  
                  {/* Payee Info */}
                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payee Information</p>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Vendor Name</label>
                      <input 
                        type="text" 
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        placeholder="Payee vendor name"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Vendor Address</label>
                      <textarea 
                        value={payeeAddress}
                        onChange={(e) => setPayeeAddress(e.target.value)}
                        rows={2}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium resize-none"
                        placeholder="Payee full address"
                      />
                    </div>
                  </div>

                  {/* Reference details */}
                  <div className="space-y-2 border-b border-slate-100 pb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference &amp; Cheque</p>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">DC Bill Number</label>
                      <input 
                        type="text" 
                        value={dcBillNumber}
                        onChange={(e) => setDcBillNumber(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        placeholder="e.g. 05/2026-27"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Cheque Number</label>
                        <input 
                          type="text" 
                          value={chequeNumber}
                          onChange={(e) => setChequeNumber(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                          placeholder="Cheque #"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Cheque Date</label>
                        <input 
                          type="date" 
                          value={chequeDate}
                          onChange={(e) => setChequeDate(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-2 pb-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item &amp; Tax Details</p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Item Bill No</label>
                        <input 
                          type="text" 
                          value={billNumber}
                          onChange={(e) => setBillNumber(e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                          placeholder="e.g. BILL-082"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase">Item Bill Date</label>
                        <input 
                          type="date" 
                          value={billDate}
                          onChange={(e) => setBillDate(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Item Particulars</label>
                      <input 
                        type="text" 
                        value={particulars}
                        onChange={(e) => setParticulars(e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        placeholder="Purpose description"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Gross Amount (₹)</label>
                      <input 
                        type="number" 
                        value={grossAmount}
                        onChange={(e) => setGrossAmount(Number(e.target.value))}
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium"
                        placeholder="Amount"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Tax Ledger</label>
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
                        className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-600 bg-slate-50/50 font-medium cursor-pointer"
                      >
                        <option value="TDS (2%)">TDS (2% Percentage)</option>
                        <option value="GST (4%)">GST (4% Percentage)</option>
                        <option value="Security Deposit (Fixed ₹500)">Security Deposit (Fixed ₹500)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-2">
                      <input 
                        type="checkbox" 
                        id="simLeftSig"
                        checked={showLeftSig}
                        onChange={(e) => setShowLeftSig(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="simLeftSig" className="text-[11px] text-slate-650 ml-2 cursor-pointer font-bold select-none">
                        Show Left Signature
                      </label>
                    </div>

                  </div>
                </div>

                {/* PDF Preview Panel - A4 Stylized Representation */}
                <div className="md:col-span-7 w-full flex flex-col justify-center">
                  <div className="w-full max-w-[400px] mx-auto bg-white border border-slate-300 shadow-md p-[3px] select-none text-slate-900">
                    
                    {/* Outer Border */}
                    <div className="border border-black p-0.5">
                      
                      {/* Inner Border Container */}
                      <div className="border-[0.5px] border-black p-3.5 min-h-[520px] flex flex-col justify-between text-[8px] leading-tight relative font-nudi">
                        
                        {/* A4 Run Watermark */}
                        <div className="absolute top-1 right-2 text-[7px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                          PDF Page Preview
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
                          {/* Row 1 */}
                          <div className="flex border-b border-black">
                            <div className="w-[32%] border-r border-black p-1 font-bold">ಡಿ.ಸಿ. ಬಿಲ್ ಸಂಖ್ಯೆ :-</div>
                            <div className="w-[68%] p-1 font-bold">{dcBillNumber}</div>
                          </div>
                          {/* Row 2 */}
                          <div className="flex border-b border-black">
                            <div className="w-[32%] border-r border-black p-1 font-bold">ಚೆಕ್ ಸಂಖ್ಯೆ / ದಿನಾಂಕ :-</div>
                            <div className="w-[68%] p-1 font-mono">{chequeNumber} / {formatDateForPreview(chequeDate)}</div>
                          </div>
                          {/* Row 3 */}
                          <div className="flex border-b border-black">
                            <div className="w-[32%] border-r border-black p-1 font-bold">ಪಾವತಿದಾರರು :-</div>
                            <div className="w-[68%] p-1 space-y-0.5">
                              <div className="font-bold">{payeeName}</div>
                              <div className="text-[7px] leading-tight text-slate-700">{payeeAddress}</div>
                            </div>
                          </div>
                          {/* Row 4 */}
                          <div className="flex">
                            <div className="w-[32%] border-r border-black p-1 font-bold">ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ :-</div>
                            <div className="w-[68%] p-1 font-bold font-mono">{Number(netPayable).toFixed(2)}</div>
                          </div>
                        </div>

                        {/* Section Header Label */}
                        <div className="text-center font-bold text-[8.5px] my-1.5">
                          ವಿವರಗಳು :-
                        </div>

                        {/* Table layout replica */}
                        <div className="border border-black rounded-none overflow-hidden text-[7.5px]">
                          {/* Table Headers */}
                          <div className="grid grid-cols-12 bg-neutral-50 border-b border-black font-bold text-center">
                            <div className="col-span-1 border-r border-black py-0.5">ಕ್ರ.ಸಂ.</div>
                            <div className="col-span-3 border-r border-black py-0.5">ಬಿಲ್ ಸಂಖ್ಯೆ / ದಿನಾಂಕ</div>
                            <div className="col-span-5 border-r border-black py-0.5 text-left pl-1">ಪಾವತಿ ವಿವರ</div>
                            <div className="col-span-3 py-0.5 text-right pr-1">ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ</div>
                          </div>

                          {/* Row 1: Main Gross Payee Item */}
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

                          {/* Row 2: Deduction Item (only if calculatedDeduction > 0) */}
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

                          {/* Totals Section Blocks */}
                          {calculatedDeduction > 0 ? (
                            <>
                              {/* Gross Total */}
                              <div className="grid grid-cols-12 border-b border-black font-bold text-[7px] items-center">
                                <div className="col-span-9 border-r border-black py-0.5 px-1 text-right">
                                  ಒಟ್ಟು ಮೊತ್ತ (Gross Total):
                                </div>
                                <div className="col-span-3 py-0.5 px-1 text-right font-mono">
                                  {Number(grossAmount).toFixed(2)}
                                </div>
                              </div>
                              {/* Total Deductions */}
                              <div className="grid grid-cols-12 border-b border-black font-bold text-[7px] items-center">
                                <div className="col-span-9 border-r border-black py-0.5 px-1 text-right">
                                  ಒಟ್ಟು ಕಡಿತಗಳು (Deductions):
                                </div>
                                <div className="col-span-3 py-0.5 px-1 text-right font-mono text-red-600">
                                  -{Number(calculatedDeduction).toFixed(2)}
                                </div>
                              </div>
                              {/* Net Payable */}
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
                            // Simple total row when no tax deduction
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
                          <div className="w-[45%] text-left">
                            {showLeftSig ? (
                              <div className="text-center">
                                <div className="border-b border-slate-800 border-dotted h-3.5 w-full"></div>
                                <p className="font-bold text-black mt-0.5">ಜಿಲ್ಲಾ ಅಧಿಕಾರಿಗಳ ಸಹಿ</p>
                              </div>
                            ) : (
                              <div className="text-center text-slate-300 italic py-1">[ Left Blank ]</div>
                            )}
                          </div>
                          <div className="w-[45%] text-center">
                            <div className="border-b border-slate-800 border-dotted h-3.5 w-full"></div>
                            <p className="font-bold text-black mt-0.5">ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
          
        </div>
      </section>

      {/* 3. PLATFORM CORE FEATURES SECTION */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-extrabold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">Security &amp; Automation</span>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Features Built For KREIS School Offices</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-lg mx-auto">
            Our platform provides structural tools configured for the exact workflow of Morarji Desai administrative systems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="bg-blue-50 text-blue-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
              <FileText className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Dynamic PDF Layout</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintains exact coordinate mapping to print payee rows, voucher totals, and dynamic multi-page continuations onto the pre-printed sheets.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="bg-indigo-50 text-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Role-Based Security</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Row-Level Security (RLS) policies prevent cross-tenant queries. Each school logs in separately to access its own local ledger history.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4">
            <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm md:text-base">Digital Archiving</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track and store saved drafts, duplicate active bills instantly to save entry time, and perform precise sequential index searches.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LIFECYCLE WORKFLOW STEPPER */}
      <section className="py-16 px-6 border-t border-slate-200/50 bg-slate-50/40">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full">Simple Process</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Administrative Workflow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-7 left-10 right-10 h-0.5 bg-slate-200 z-0"></div>
            
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">1</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Secure Account</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Create your school profile using standard email verification.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">2</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Profile Configuration</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Input your Kannada name, bank metadata, and signature lines.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">3</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Input Bills</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Add sub-bill rows and configure your multiple tax deductions.</p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-sm relative z-10 text-center space-y-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mx-auto shadow-md">4</div>
              <h5 className="font-bold text-slate-900 text-xs md:text-sm">Vector PDF Print</h5>
              <p className="text-[11px] text-slate-500 leading-relaxed">Generate your formatted sheet. Sign, verify, and complete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DEVELOPER SPOTLIGHT CARD */}
      <section className="py-16 px-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-950/20 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 justify-between border border-slate-800">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-3 relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
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
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-5 rounded-lg shadow-lg shadow-blue-600/15 hover:shadow-xl transition-all cursor-pointer border border-blue-500"
            >
              Check Developer Profile
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. VIEWPORT-STICKY FOOTER */}
      <footer className="border-t border-slate-200/80 py-5 px-6 bg-white text-center text-xs text-slate-500 shrink-0">
        <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="font-semibold text-slate-700">Developed by Manoj Kumar V</span>
            <span className="text-slate-300">|</span>
            <span>Email:</span>
            <a href="mailto:svmmdrpu@gmail.com" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">svmmdrpu@gmail.com</a>
            <span className="text-slate-300">|</span>
            <span>Contact:</span>
            <a href="tel:+917975464020" className="font-medium text-blue-600 hover:text-blue-800 hover:underline">+91 7975464020</a>
          </p>
          <p className="text-slate-400 font-medium">
            Karnataka Residential Educational Institutions Society (KREIS) School Management
          </p>
        </div>
      </footer>

    </div>
  );
}
