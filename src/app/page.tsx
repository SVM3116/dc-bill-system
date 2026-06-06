"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageContext";
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
  FileArchive,
  Menu,
  X,
  MapPin,
  Mail,
  Phone,
  Bookmark,
  GraduationCap
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

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    style={props.style}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Home() {
  const { t, language } = useTranslation();
  // Simulator active tab
  const [activeTab, setActiveTab] = useState<"dc_bill" | "hand_voucher" | "cheque_register">("dc_bill");

  // ==================== STATE FOR TAB 1: DC BILL ====================
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

  // ==================== STATE FOR TAB 2: HAND VOUCHER ====================
  const [hvLayout, setHvLayout] = useState<"teacher" | "milling" | "labor" | "gas">("teacher");
  const [hvPaymentMode, setHvPaymentMode] = useState<"cheque" | "cash">("cheque");
  const [hvMainContent, setHvMainContent] = useState("ಅತಿಥಿ ಶಿಕ್ಷಕರ ಗೌರವ ಧನ");
  const [hvCertContent, setHvCertContent] = useState("ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ದಕ್ಷತೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸಿದ್ದಾರೆ");
  const [hvChequeNum, setHvChequeNum] = useState("982925");
  const [hvChequeDate, setHvChequeDate] = useState("2026-06-05");

  // Layout-specific parameters for Hand Voucher
  const [teacherSubject, setTeacherSubject] = useState("Mathematics");
  const [teacherMonth, setTeacherMonth] = useState("June");
  const [teacherDays, setTeacherDays] = useState(22);
  const [teacherRate, setTeacherRate] = useState(500);

  const [millingDate, setMillingDate] = useState("2026-06-05");
  const [millingQtyKg, setMillingQtyKg] = useState(120);
  const [millingRate, setMillingRate] = useState(12);

  const [laborMonth, setLaborMonth] = useState("May");
  const [laborQty, setLaborQty] = useState(2);
  const [laborRate, setLaborRate] = useState(1200);

  const [gasDate, setGasDate] = useState("2026-06-03");
  const [gasQty, setGasQty] = useState(3);
  const [gasRate, setGasRate] = useState(350);

  // ==================== STATE FOR TAB 3: CHEQUE REGISTER ====================
  const [regAccountType, setRegAccountType] = useState<"all" | "maintenance" | "salary">("all");
  const [regFromDate, setRegFromDate] = useState("2026-04-01");
  const [regToDate, setRegToDate] = useState("2026-06-06");
  const [regSearch, setRegSearch] = useState("");

  // ==================== SIMULATED ZIP COMPILER STATE ====================
  const [zippingState, setZippingState] = useState<"idle" | "zipping" | "success">("idle");
  const [zipProgress, setZipProgress] = useState(0);
  const [zipText, setZipText] = useState("");

  // Automatically update Hand Voucher Kannada fields when layout changes
  useEffect(() => {
    if (hvLayout === "teacher") {
      setHvMainContent("ಅತಿಥಿ ಶಿಕ್ಷಕರ ಗೌರವ ಧನ");
      setHvCertContent("ಅತಿಥಿ ಶಿಕ್ಷಕರಾಗಿ ದಕ್ಷತೆಯಿಂದ ಕಾರ್ಯನಿರ್ವಹಿಸಿದ್ದಾರೆ");
    } else if (hvLayout === "milling") {
      setHvMainContent("ರಾಗಿ ಮತ್ತು ಗೋಧಿ ಕ್ಲೀನಿಂಗ್ ಮತ್ತು ಮಿಲ್ಲಿಂಗ್ ವೆಚ್ಚ");
      setHvCertContent("ಮಿಲ್ಲಿಂಗ್ ಮತ್ತು ಕ್ಲೀನಿಂಗ್ ಮಾಡಿಸಿ ಧಾನ್ಯ ವಿತರಿಸಲಾಗಿದೆ");
    } else if (hvLayout === "labor") {
      setHvMainContent("ನೀರಿನ ಸಂಪ್ ಶುಚಿಗೊಳಿಸಿದ ಕೂಲಿ");
      setHvCertContent("ನೀರಿನ ಸಂಪ್ ಸ್ವಚ್ಛಗೊಳಿಸಿ ಸ್ವಚ್ಛ ನೀರು ಒದಗಿಸಲಾಗಿದೆ");
    } else if (hvLayout === "gas") {
      setHvMainContent("ಗ್ಯಾಸ್ ಸಿಲಿಂಡರ್ ಸಾಗಣೆ ವೆಚ್ಚ");
      setHvCertContent("ವಸತಿ ಶಾಲೆ ಅಡುಗೆ ಉಪಯೋಗಕ್ಕೆ ಸಿಲಿಂಡರ್ ತರಲಾಗಿದೆ");
    }
  }, [hvLayout]);

  // Calculations for DC Bill Simulator
  const calculatedDeduction = deductionMode === "percentage" 
    ? (grossAmount * deductionValue) / 100 
    : deductionValue;
  const netPayable = Math.max(0, grossAmount - calculatedDeduction);

  // Calculations for Hand Voucher Simulator
  let hvCalculatedAmount = 0;
  if (hvLayout === "teacher") {
    hvCalculatedAmount = (Number(teacherDays) || 0) * (Number(teacherRate) || 0);
  } else if (hvLayout === "milling") {
    hvCalculatedAmount = (Number(millingQtyKg) || 0) * (Number(millingRate) || 0);
  } else if (hvLayout === "labor") {
    hvCalculatedAmount = (Number(laborQty) || 0) * (Number(laborRate) || 0);
  } else if (hvLayout === "gas") {
    hvCalculatedAmount = (Number(gasQty) || 0) * (Number(gasRate) || 0);
  }

  // Parse financial year dynamically from DC Bill number
  let financialYear = "2026-27";
  if (dcBillNumber && dcBillNumber.includes("/")) {
    financialYear = dcBillNumber.split("/")[1].trim();
  }

  // Date format helper (YYYY-MM-DD -> DD-MM-YYYY)
  function formatDateForPreview(dateStr: string): string {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  // Simple number to words conversion for simulator
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
    setZipProgress(5);
    setZipText("Querying documents from database...");
    
    const steps = [
      { progress: 25, text: "Compiling Maintenance & Salary DC Bills..." },
      { progress: 50, text: "Rendering Nudi-font Kannada templates..." },
      { progress: 75, text: "Packing PDFs into zip container using JSZip..." },
      { progress: 95, text: "Generating client-side download stream..." },
      { progress: 100, text: "ZIP archive successfully downloaded!" }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setZipProgress(step.progress);
        setZipText(step.text);
        if (step.progress === 100) {
          setTimeout(() => {
            setZippingState("success");
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

  // Mock database entries for Cheque Register
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
      dcBillNo: "2026-27/HV/01",
      chequeNo: hvPaymentMode === "cheque" ? hvChequeNum : "CASH",
      date: hvChequeDate,
      payee: "Guest Teacher / Vendor",
      netAmount: hvCalculatedAmount,
      particulars: `1. ${hvLayout === "teacher" ? "Guest Teacher Salary" : hvLayout === "milling" ? "Ragi & Wheat Milling" : hvLayout === "labor" ? "Sump Cleaning Labor" : "Gas Cylinder Transport"}\n2. Particulars: ${hvMainContent}`,
      accountType: hvLayout === "teacher" ? "salary" : "maintenance"
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

  // Filter mock register dynamically
  const filteredRegisterData = mockChequeRegisterData.filter(row => {
    if (regAccountType !== "all" && row.accountType !== regAccountType) {
      return false;
    }
    if (regFromDate && row.date < regFromDate) return false;
    if (regToDate && row.date > regToDate) return false;
    if (regSearch) {
      const q = regSearch.toLowerCase();
      const matchPayee = row.payee.toLowerCase().includes(q);
      const matchBill = row.dcBillNo.toLowerCase().includes(q);
      const matchCheque = row.chequeNo.toLowerCase().includes(q);
      const matchPart = row.particulars.toLowerCase().includes(q);
      return matchPayee || matchBill || matchCheque || matchPart;
    }
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-600 selection:text-white font-sans">
      
      {/* 1. HEADER (Normalized standard color classes for 100% visibility) */}
      <header className="h-16 border-b border-slate-300 bg-white/95 backdrop-blur-md flex items-center sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-xl shadow-md flex items-center justify-center shrink-0">
              <Building2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] font-black tracking-widest text-indigo-900 uppercase leading-none hidden sm:block">{t("govTitle")}</p>
              <h1 className="text-xs sm:text-sm md:text-base font-black text-slate-900 tracking-tight mt-0.5">
                <span className="sm:hidden">{t("kreisPlatformShort")}</span>
                <span className="hidden sm:inline">{t("kreisPlatform")}</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/developer" 
              className="hidden sm:flex text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg items-center gap-1.5 transition-all shadow-sm"
            >
              <Code className="h-3.5 w-3.5 text-slate-900" />
              {t("devProfile")}
            </Link>
            <Link
              href="/login"
              className="text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span className="sm:hidden">{t("loginShort")}</span>
              <span className="hidden sm:inline">{t("staffLogin")}</span>
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO & 3-TAB INTERACTIVE SIMULATOR */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 md:px-6 border-b border-slate-200 bg-gradient-to-b from-white via-white to-slate-50">
        {/* Glow background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-24 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6 text-left lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="h-3 w-3 text-indigo-650 animate-pulse" />
              {t("saasSubtitle")}
            </div>
            
            <h2 className="text-3xl md:text-5.5xl font-black text-slate-900 tracking-tight leading-[1.12]">
              {t("heroTitle")} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-950">
                {t("heroTitleSpan")}
              </span>
            </h2>
            
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-lg font-medium">
              {t("heroDescription")}
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all text-center"
              >
                {t("officeStaffLogin")}
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-300 text-sm font-black rounded-lg text-slate-700 bg-white hover:bg-slate-100 transition-all shadow-sm text-center"
              >
                {t("createAdminAccount")}
              </Link>
            </div>

            {/* Trusted Schools Badge List */}
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">{t("trustedBy")}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md text-[9.5px] font-bold text-slate-600">MDRS Sulibele</span>
                <span className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md text-[9.5px] font-bold text-slate-600">MDRS Malur</span>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xl md:text-2xl font-black text-indigo-600">100%</p>
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">{t("kannadaNudiFont")}</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-emerald-600">Dynamic</p>
                <p className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">{t("fourVoucherLayouts")}</p>
              </div>
              <div>
                <p className="text-xl md:text-2xl font-black text-amber-600">Automatic</p>
                <p className="text-[9px] text-slate-455 font-extrabold uppercase tracking-wider">{t("autoChequeRegister")}</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3-Tab Interactive Simulator in Browser Shell */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-1.5 relative overflow-hidden">
              {/* Browser control bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900 text-xs text-slate-400 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                </div>
                <div className="bg-slate-950 px-6 py-0.5 rounded border border-slate-850 font-mono text-[9px] w-[50%] truncate text-center text-slate-455 shadow-inner">
                  localhost:3000/demo-simulator
                </div>
                <div className="w-8"></div>
              </div>

              {/* White Canvas */}
              <div className="bg-white rounded-xl p-4 sm:p-5 space-y-5 relative overflow-hidden">
                {/* Simulator header */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5 text-left">
                    <Calculator className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h3 className="font-black text-slate-900 text-xs md:text-sm">Interactive System Simulator</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Instantly test the main system functions</p>
                    </div>
                  </div>

                  {/* 3 tabs navigation - SOLID visible status colors */}
                  <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300 shrink-0 self-center sm:self-auto gap-1">
                    <button
                      onClick={() => setActiveTab("dc_bill")}
                      className={`px-3 py-1.5 text-[9px] md:text-[10px] font-black tracking-wide uppercase rounded-md transition-all cursor-pointer border ${activeTab === "dc_bill" ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-50 hover:bg-slate-200 text-slate-705 border-slate-300"}`}
                    >
                      DC Bill
                    </button>
                    <button
                      onClick={() => setActiveTab("hand_voucher")}
                      className={`px-3 py-1.5 text-[9px] md:text-[10px] font-black tracking-wide uppercase rounded-md transition-all cursor-pointer border ${activeTab === "hand_voucher" ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-50 hover:bg-slate-200 text-slate-705 border-slate-300"}`}
                    >
                      Hand Voucher
                    </button>
                    <button
                      onClick={() => setActiveTab("cheque_register")}
                      className={`px-3 py-1.5 text-[9px] md:text-[10px] font-black tracking-wide uppercase rounded-md transition-all cursor-pointer border ${activeTab === "cheque_register" ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-50 hover:bg-slate-200 text-slate-705 border-slate-300"}`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                {/* Simulator Body split columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Form Inputs */}
                  <div className="md:col-span-5 space-y-3 text-left">
                    
                    {activeTab === "dc_bill" && (
                      <>
                        <div className="space-y-2 border-b border-slate-100 pb-3">
                          <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Payee (ಪಾವತಿದಾರರು)</p>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Vendor Name</label>
                            <input 
                              type="text" 
                              value={payeeName}
                              onChange={(e) => setPayeeName(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold"
                              placeholder="e.g. Durga Electricals"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Vendor Address</label>
                            <textarea 
                              value={payeeAddress}
                              onChange={(e) => setPayeeAddress(e.target.value)}
                              rows={2}
                              className="w-full p-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold resize-none"
                              placeholder="e.g. Devanahalli Taluk"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 border-b border-slate-100 pb-3">
                          <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Cheque Details</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-600 uppercase">Cheque No</label>
                              <input 
                                type="text" 
                                value={chequeNumber}
                                onChange={(e) => setChequeNumber(e.target.value)}
                                className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-mono font-bold"
                                placeholder="Cheque #"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-600 uppercase">Cheque Date</label>
                              <input 
                                type="date" 
                                value={chequeDate}
                                onChange={(e) => setChequeDate(e.target.value)}
                                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pb-1">
                          <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Amounts &amp; Taxes</p>
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Gross Amount (₹)</label>
                            <input 
                              type="number" 
                              value={grossAmount}
                              onChange={(e) => setGrossAmount(Number(e.target.value))}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-mono font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Tax Category</label>
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
                              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold cursor-pointer"
                            >
                              <option value="TDS (2%)">TDS (2% Percentage)</option>
                              <option value="GST (4%)">GST (4% Percentage)</option>
                              <option value="Deposit (Fixed ₹500)">Security Deposit (Fixed ₹500)</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === "hand_voucher" && (
                      <>
                        <div className="space-y-2 border-b border-slate-100 pb-3">
                          <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Voucher Config</p>
                          
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Layout Type</label>
                            <select 
                              value={hvLayout}
                              onChange={(e) => setHvLayout(e.target.value as any)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 font-bold text-indigo-700 cursor-pointer"
                            >
                              <option value="teacher">Guest Teacher Layout (ಅತಿಥಿ ಶಿಕ್ಷಕರು)</option>
                              <option value="milling">Milling &amp; Cleaning Layout (ಮಿಲ್ಲಿಂಗ್)</option>
                              <option value="labor">Labor / Coolie Layout (ಕೂಲಿ ಕೆಲಸ)</option>
                              <option value="gas">Gas Cylinder Transport Layout (ಅನಿಲ ಸಾಗಣೆ)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Payment Mode</label>
                            {/* SOLID visible segment switches at all times */}
                            <div className="grid grid-cols-2 gap-1.5 bg-slate-150 p-1 rounded-lg border border-slate-300">
                              <button
                                onClick={() => setHvPaymentMode("cheque")}
                                className={`py-1.5 text-[9px] font-black uppercase rounded-md transition-all border ${hvPaymentMode === "cheque" ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-300"}`}
                              >
                                Cheque
                              </button>
                              <button
                                onClick={() => setHvPaymentMode("cash")}
                                className={`py-1.5 text-[9px] font-black uppercase rounded-md transition-all border ${hvPaymentMode === "cash" ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-300"}`}
                              >
                                Cash
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Layout specific fields */}
                        <div className="space-y-2 border-b border-slate-200 pb-3 bg-indigo-50 p-2 rounded-lg border border-indigo-200">
                          <p className="text-[9px] font-black text-indigo-900 tracking-wider uppercase">Voucher Calculations</p>
                          
                          {hvLayout === "teacher" && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Subject</label>
                                  <input 
                                    type="text" 
                                    value={teacherSubject} 
                                    onChange={(e) => setTeacherSubject(e.target.value)} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Month</label>
                                  <input 
                                    type="text" 
                                    value={teacherMonth} 
                                    onChange={(e) => setTeacherMonth(e.target.value)} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-bold"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Teaching Days</label>
                                  <input 
                                    type="number" 
                                    value={teacherDays} 
                                    onChange={(e) => setTeacherDays(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Rate per Day (₹)</label>
                                  <input 
                                    type="number" 
                                    value={teacherRate} 
                                    onChange={(e) => setTeacherRate(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {hvLayout === "milling" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-600 uppercase">Milling Date</label>
                                <input 
                                  type="date" 
                                  value={millingDate} 
                                  onChange={(e) => setMillingDate(e.target.value)} 
                                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Quantity (Kg)</label>
                                  <input 
                                    type="number" 
                                    value={millingQtyKg} 
                                    onChange={(e) => setMillingQtyKg(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Rate per Kg (₹)</label>
                                  <input 
                                    type="number" 
                                    value={millingRate} 
                                    onChange={(e) => setMillingRate(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {hvLayout === "labor" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-600 uppercase">Month</label>
                                <input 
                                  type="text" 
                                  value={laborMonth} 
                                  onChange={(e) => setLaborMonth(e.target.value)} 
                                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-650 bg-white font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Jobs / Quantity</label>
                                  <input 
                                    type="number" 
                                    value={laborQty} 
                                    onChange={(e) => setLaborQty(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Rate per Job (₹)</label>
                                  <input 
                                    type="number" 
                                    value={laborRate} 
                                    onChange={(e) => setLaborRate(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {hvLayout === "gas" && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-600 uppercase">Transport Date</label>
                                <input 
                                  type="date" 
                                  value={gasDate} 
                                  onChange={(e) => setGasDate(e.target.value)} 
                                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-bold"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Cylinder Count</label>
                                  <input 
                                    type="number" 
                                    value={gasQty} 
                                    onChange={(e) => setGasQty(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-extrabold text-slate-600 uppercase">Rate per Cyl (₹)</label>
                                  <input 
                                    type="number" 
                                    value={gasRate} 
                                    onChange={(e) => setGasRate(Number(e.target.value))} 
                                    className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-600 bg-white font-mono font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[10px] font-extrabold text-indigo-950 pt-1.5 border-t border-indigo-200">
                            <span>VOUCHER SUM:</span>
                            <span className="font-mono text-xs text-indigo-800">₹{Number(hvCalculatedAmount).toFixed(2)}</span>
                          </div>
                        </div>

                        {hvPaymentMode === "cheque" && (
                          <div className="space-y-2">
                            <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase">Reference Cheque</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-600 uppercase">Cheque No</label>
                                <input 
                                  type="text" 
                                  value={hvChequeNum}
                                  onChange={(e) => setHvChequeNum(e.target.value)}
                                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-extrabold text-slate-600 uppercase">Cheque Date</label>
                                <input 
                                  type="date" 
                                  value={hvChequeDate}
                                  onChange={(e) => setHvChequeDate(e.target.value)}
                                  className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {activeTab === "cheque_register" && (
                      <>
                        <div className="space-y-4">
                          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-1 text-indigo-900 font-extrabold text-[10px] uppercase">
                              <Filter className="h-3 w-3 animate-bounce" />
                              <span>Live filters</span>
                            </div>
                            <p className="text-[9.5px] text-slate-600 leading-normal font-bold">
                              Type search criteria to dynamically filter cheque items without any manually clicked buttons.
                            </p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Live Search Input</label>
                            <input 
                              type="text" 
                              value={regSearch}
                              onChange={(e) => setRegSearch(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold"
                              placeholder="Type Payee name to filter..."
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold text-slate-600 uppercase">Account Type</label>
                            <select 
                              value={regAccountType}
                              onChange={(e) => setRegAccountType(e.target.value as any)}
                              className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 text-slate-800 font-bold cursor-pointer"
                            >
                              <option value="all">All Accounts (Maintenance &amp; Salary)</option>
                              <option value="maintenance">Maintenance Account Only</option>
                              <option value="salary">Salary Account Only</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-600 uppercase">From Date</label>
                              <input 
                                type="date" 
                                value={regFromDate}
                                onChange={(e) => setRegFromDate(e.target.value)}
                                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[10px] text-slate-800 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-extrabold text-slate-600 uppercase">To Date</label>
                              <input 
                                type="date" 
                                value={regToDate}
                                onChange={(e) => setRegToDate(e.target.value)}
                                className="w-full h-8 px-2 rounded-lg border border-slate-300 text-[10px] text-slate-800 font-bold"
                              />
                            </div>
                          </div>

                          {/* Reset filter button - SOLID visibility always */}
                          <button
                            onClick={() => {
                              setRegAccountType("all");
                              setRegFromDate("2026-04-01");
                              setRegToDate("2026-06-06");
                              setRegSearch("");
                            }}
                            className="w-full text-center flex items-center justify-center gap-1.5 py-2 border border-slate-300 bg-slate-100 hover:bg-slate-200 rounded-lg text-[10px] text-slate-700 font-black transition-all cursor-pointer shadow-sm"
                          >
                            <RotateCcw className="h-3 w-3 text-slate-900" />
                            Reset Filters
                          </button>
                        </div>
                      </>
                    )}

                    {/* Simulated ZIP downloader widget */}
                    <div className="pt-4 border-t border-slate-200 text-left">
                      <p className="text-[9px] font-black text-slate-400 tracking-wider uppercase mb-2">ZIP Archive packager</p>
                      {zippingState === "idle" ? (
                        <button
                          onClick={triggerSimulatedZip}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs py-2 px-3 rounded-lg shadow-md transition-all cursor-pointer border border-slate-800"
                        >
                          <FileArchive className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                          Simulate Bulk ZIP Download
                        </button>
                      ) : zippingState === "zipping" ? (
                        <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2 animate-pulse">
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 text-indigo-600 animate-spin" />
                              Zipping files...
                            </span>
                            <span>{zipProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full transition-all duration-300 rounded-full" 
                              style={{ width: `${zipProgress}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-slate-500 italic leading-none font-bold truncate">{zipText}</p>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-black">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 font-black" />
                          Simulated ZIP Packaged &amp; Saved!
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right PDF Preview Panel */}
                  <div className="md:col-span-7 w-full flex flex-col justify-center">
                    
                    {activeTab === "dc_bill" && (
                      <div className="w-full max-w-[400px] mx-auto bg-white border border-slate-300 shadow-md p-[3px] select-none text-slate-900 relative">
                        <div className="border border-black p-0.5">
                          <div className="border-[0.5px] border-black p-3.5 min-h-[520px] flex flex-col justify-between text-[8px] leading-tight relative font-nudi">
                            
                            <div className="absolute top-1 right-2 text-[7px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                              A4 Portrait PDF
                            </div>

                            {/* Karnataka Gov Header */}
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
                                  <div className="font-bold text-black">{payeeName}</div>
                                  <div className="text-[7px] leading-tight text-slate-700">{payeeAddress}</div>
                                </div>
                              </div>
                              <div className="flex">
                                <div className="w-[32%] border-r border-black p-1 font-bold">ಮೊತ್ತ ರೂ. ಗಳಲ್ಲಿ :-</div>
                                <div className="w-[68%] p-1 font-bold font-mono text-black">₹{Number(netPayable).toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="text-center font-bold text-[8.5px] my-1.5">
                              ವಿವರಗಳು :-
                            </div>

                            {/* Itemized list table */}
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
                                <div className="col-span-5 border-r border-black py-1 px-1 break-words font-medium text-slate-800">
                                  {particulars}
                                </div>
                                <div className="col-span-3 py-1 px-1 text-right font-mono font-bold text-black">
                                  {Number(grossAmount).toFixed(2)}
                                </div>
                              </div>

                              {calculatedDeduction > 0 && (
                                <div className="grid grid-cols-12 border-b border-black items-center text-[7px] bg-rose-50/20">
                                  <div className="col-span-1 border-r border-black py-1 text-center font-bold">2</div>
                                  <div className="col-span-3 border-r border-black py-1 px-1 font-mono text-red-700">Deduct-Tax</div>
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
                                      Gross Total:
                                    </div>
                                    <div className="col-span-3 py-0.5 px-1 text-right font-mono">
                                      {Number(grossAmount).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-12 border-b border-black font-bold text-[7px] items-center">
                                    <div className="col-span-9 border-r border-black py-0.5 px-1 text-right text-red-650">
                                      Deductions:
                                    </div>
                                    <div className="col-span-3 py-0.5 px-1 text-right font-mono text-red-655 font-bold">
                                      -{Number(calculatedDeduction).toFixed(2)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-12 font-bold bg-slate-50/80 items-center">
                                    <div className="col-span-9 border-r border-black py-0.5 px-1 text-right text-indigo-900">
                                      Net Payable (ನಿವ್ವಳ ಪಾವತಿ):
                                    </div>
                                    <div className="col-span-3 py-0.5 px-1 text-right font-mono text-indigo-950 font-black">
                                      {Number(netPayable).toFixed(2)}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="grid grid-cols-12 font-bold bg-slate-50/80 items-center">
                                  <div className="col-span-9 border-r border-black py-0.5 px-1 text-right text-indigo-900">
                                    Gross / Net:
                                  </div>
                                  <div className="col-span-3 py-0.5 px-1 text-right font-mono font-black text-indigo-950">
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

                            {/* Signatures block */}
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

                            {/* Vector stamp */}
                            <div className="absolute bottom-1 right-1 text-[5px] text-right font-mono text-slate-400/80 pointer-events-none scale-[0.85] origin-bottom-right leading-none">
                              <div>DC BILL : {dcBillNumber}</div>
                              <div>Generated On: {new Date().toLocaleDateString("en-IN")}</div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "hand_voucher" && (
                      <div className="w-full max-w-[400px] mx-auto bg-white border border-slate-300 shadow-md p-[3px] select-none text-slate-900 relative">
                        <div className="border border-black p-0.5">
                          <div className="border-[0.5px] border-black p-3.5 min-h-[520px] flex flex-col justify-between text-[7.5px] leading-relaxed relative font-nudi">
                            
                            <div className="absolute top-1 right-2 text-[7px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                              Hand Voucher PDF
                            </div>

                            {/* Header */}
                            <div className="text-center space-y-0.5 border-b border-black pb-1.5">
                              <h4 className="font-extrabold text-[9.5px] text-black">ಕೈ ರಶೀದಿ (HAND VOUCHER)</h4>
                              <p className="font-bold text-[8px] text-black">ಕರ್ನಾಟಕ ವಸತಿ ಶಿಕ್ಷಣ ಸಂಸ್ಥೆಗಳ ಸಂಘ, ಬೆಂಗಳೂರು</p>
                              <p className="font-bold text-[8px] text-black">ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ.</p>
                            </div>

                            {/* Compiled Kannada description paragraph */}
                            <div className="text-left mt-3 font-medium text-black leading-relaxed space-y-2 border-b border-slate-200 pb-2.5">
                              {hvLayout === "teacher" ? (
                                <p>
                                  ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ, ಇಲ್ಲಿ <span className="font-bold text-indigo-700 underline">{hvMainContent}</span> ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು {hvPaymentMode === "cheque" ? `ಚೆಕ್ ಸಂಖ್ಯೆ :- ${hvChequeNum} / ${formatDateForPreview(hvChequeDate)} ರ ಮೂಲಕ` : "ನಿಲಯಪಾಲಕರಿಂದ ನಗದಾಗಿ"} ಗೌರವ ಧನ ಪಡೆದಿರುತ್ತೇನೆ ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.
                                </p>
                              ) : (
                                <p>
                                  ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ, ಇಲ್ಲಿ {financialYear}ನೇ ಸಾಲಿನಲ್ಲಿ <span className="font-bold text-indigo-700 underline">{hvMainContent}</span> ಬಿಲ್ ಬಾಬ್ತು ಹಣವನ್ನು ಈ ಕೆಳಗೆ ಸಹಿ ಮಾಡಿರುವ ನಾನು {hvPaymentMode === "cheque" ? `ಚೆಕ್ ಸಂಖ್ಯೆ :- ${hvChequeNum} / ${formatDateForPreview(hvChequeDate)} ರ ಮೂಲಕ ಪಡೆದಿರುತ್ತೇನೆ` : "ನಿಲಯಪಾಲಕರಿಂದ ನಗದಾಗಿ ಪಡೆದಿರುತ್ತೇನೆ"} ಮತ್ತು ಅದರ ವಿವರ ಈ ಕೆಳಗಿನಂತಿದೆ.
                                </p>
                              )}
                            </div>

                            {/* Dynamic items details container */}
                            <div className="my-3 border border-black overflow-hidden rounded-none text-[7.5px] leading-normal font-sans">
                              {hvLayout === "teacher" && (
                                <div className="p-2 space-y-1 text-left bg-slate-50/50">
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Subject (ವಿಷಯ):</span>
                                    <span className="font-bold text-black">{teacherSubject}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Teaching Month:</span>
                                    <span className="font-bold text-black">{teacherMonth}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Days Configured:</span>
                                    <span className="font-mono text-black font-bold">{teacherDays} Days</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Allowance Rate:</span>
                                    <span className="font-mono text-black font-bold">₹{teacherRate}.00 / Day</span>
                                  </div>
                                  <div className="flex justify-between pt-1 text-indigo-900 font-extrabold text-[8.5px]">
                                    <span>Calculated Total (Qty * Rate):</span>
                                    <span className="font-mono">₹{hvCalculatedAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}

                              {hvLayout === "milling" && (
                                <div className="p-2 space-y-1 text-left bg-slate-50/50">
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Milling Date (ದಿನಾಂಕ):</span>
                                    <span className="font-mono text-black font-bold">{formatDateForPreview(millingDate)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Grain Weight (Kg):</span>
                                    <span className="font-mono text-black font-bold">{millingQtyKg} Kg</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Processing Rate:</span>
                                    <span className="font-mono text-black font-bold">₹{millingRate}.00 / Kg</span>
                                  </div>
                                  <div className="flex justify-between pt-1 text-indigo-900 font-extrabold text-[8.5px]">
                                    <span>Calculated Total (Kg * Rate):</span>
                                    <span className="font-mono">₹{hvCalculatedAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}

                              {hvLayout === "labor" && (
                                <div className="p-2 space-y-1 text-left bg-slate-50/50">
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Work Month (ತಿಂಗಳು):</span>
                                    <span className="font-bold text-black">{laborMonth}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Jobs Completed:</span>
                                    <span className="font-mono text-black font-bold">{laborQty}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Wage Rate:</span>
                                    <span className="font-mono text-black font-bold">₹{laborRate}.00 / job</span>
                                  </div>
                                  <div className="flex justify-between pt-1 text-indigo-900 font-extrabold text-[8.5px]">
                                    <span>Calculated Total (Jobs * Rate):</span>
                                    <span className="font-mono">₹{hvCalculatedAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}

                              {hvLayout === "gas" && (
                                <div className="p-2 space-y-1 text-left bg-slate-50/50">
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Delivery Date:</span>
                                    <span className="font-mono text-black font-bold">{formatDateForPreview(gasDate)}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Cylinders Count:</span>
                                    <span className="font-mono text-black font-bold">{gasQty} Cylinders</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-100 pb-1">
                                    <span className="font-bold text-slate-500">Transport Rate:</span>
                                    <span className="font-mono text-black font-bold">₹{gasRate}.00 / cyl</span>
                                  </div>
                                  <div className="flex justify-between pt-1 text-indigo-900 font-extrabold text-[8.5px]">
                                    <span>Calculated Total (Qty * Rate):</span>
                                    <span className="font-mono">₹{hvCalculatedAmount.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Certification paragraph in Kannada */}
                            <div className="text-left font-medium text-black leading-relaxed p-2 bg-slate-50 border-l-2 border-indigo-600 rounded">
                              <p className="font-bold text-[8px] text-indigo-700 mb-0.5">ಪ್ರಮಾಣೀಕರಣ (Certification)</p>
                              ಮೊರಾರ್ಜಿ ದೇಸಾಯಿ ವಸತಿ ಶಾಲೆ, ಸೂಲಿಬೆಲೆ, ಇಲ್ಲಿಗೆ {financialYear}ನೇ ಸಾಲಿನಲ್ಲಿ <span className="font-bold underline">{hvCertContent}</span> ಎಂದು ದೃಢೀಕರಿಸಿದೆ.
                            </div>

                            {/* Signatures */}
                            <div className="flex justify-between items-end pt-5 text-[7.5px]">
                              <div className="w-[30%] text-center">
                                <div className="border-b border-slate-800 border-dotted h-4 w-full"></div>
                                <p className="font-bold text-black mt-0.5">ಸ್ವೀಕೃತದಾರರ ಸಹಿ</p>
                              </div>
                              <div className="w-[30%] text-center">
                                <div className="border-b border-slate-800 border-dotted h-4 w-full"></div>
                                <p className="font-bold text-black mt-0.5">ಲೆಕ್ಕಿಗರ ಸಹಿ</p>
                              </div>
                              <div className="w-[30%] text-center">
                                <div className="border-b border-slate-800 border-dotted h-4 w-full"></div>
                                <p className="font-bold text-black mt-0.5">ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ</p>
                              </div>
                            </div>

                            {/* Vector watermark */}
                            <div className="absolute bottom-1 right-1 text-[5px] text-right font-mono text-slate-400/85 pointer-events-none leading-none">
                              <div>VOUCHER : {financialYear}/HV/01</div>
                              <div>Layout: {hvLayout.toUpperCase()}</div>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "cheque_register" && (
                      <div className="w-full bg-white border border-slate-300 shadow-md p-[3px] select-none text-slate-900 relative min-h-[365px] flex flex-col justify-between">
                        <div className="border border-black p-0.5 flex-1 flex flex-col">
                          <div className="border-[0.5px] border-black p-3 flex-1 flex flex-col justify-between text-[7px] leading-tight font-sans relative">
                            
                            <div className="absolute top-1.5 right-2 text-[6px] bg-slate-50 text-slate-400 font-extrabold uppercase border border-slate-200 px-1 py-0.5 pointer-events-none rounded">
                              Cheque Register Landscape
                            </div>

                            {/* Header */}
                            <div className="border-b border-black pb-1 mb-2 text-left">
                              <h4 className="font-black text-[9px] text-black">Cheque Issue Register ({financialYear})</h4>
                              <p className="text-[6.5px] text-slate-500 font-semibold">
                                Filter: {regAccountType === "all" ? "All Accounts" : regAccountType === "maintenance" ? "Maintenance" : "Salary"} | Dates: {formatDateForPreview(regFromDate)} to {formatDateForPreview(regToDate)}
                              </p>
                            </div>

                            {/* Table */}
                            <div className="border border-black flex-1 overflow-x-auto min-h-[220px]">
                              <table className="w-full text-left border-collapse min-w-[340px]">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-black font-bold text-center">
                                    <th className="border-r border-black p-1 text-[6.5px] text-center w-[16%]">DC Bill No</th>
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
                                      <tr key={index} className="border-b border-black/50 hover:bg-slate-50 text-[6.5px] items-start">
                                        <td className="border-r border-black p-1 text-center font-bold font-mono">{row.dcBillNo}</td>
                                        <td className="border-r border-black p-1 text-center font-mono">{row.chequeNo}</td>
                                        <td className="border-r border-black p-1 text-center">{formatDateForPreview(row.date)}</td>
                                        <td className="border-r border-black p-1 font-bold text-black max-w-[75px] truncate">{row.payee}</td>
                                        <td className="border-r border-black p-1 text-right font-mono font-bold text-black">₹{row.netAmount.toFixed(2)}</td>
                                        <td className="p-1 whitespace-pre-line leading-normal text-[6px] text-slate-600 font-medium">
                                          {row.particulars}
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold italic text-xs">
                                        No register entries match. Adjust filters.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Watermark and Page details */}
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-[6px] text-slate-400 font-bold">Page 1 of 1</span>
                              <div className="text-[5px] text-right font-mono text-slate-400/80 leading-none">
                                <div>CHEQUE REGISTER : {financialYear}</div>
                                <div>Audit Timestamp: {new Date().toLocaleDateString("en-IN")}</div>
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
          
        </div>
      </section>

      {/* 3. COMPARISON SECTION: EXCEL VS KREIS PLATFORM AUTOMATION */}
      <section className="py-20 px-4 md:px-6 max-w-6xl mx-auto w-full border-t border-slate-300">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-200">Comparison Guide</span>
          <h3 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight">Traditional Excel vs. KREIS DC Bill Platform</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
            Understand how our unified digital platform transforms institutional administrative chores compared to legacy spreadsheet workflows.
          </p>
        </div>

        {/* Desktop View: Full Grid Table (hidden on mobile, visible on desktop) */}
        <div className="hidden md:block border border-slate-300 bg-white rounded-2xl shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-4 w-[20%] font-black uppercase text-[10px] tracking-wider">Administrative Area</th>
                  <th className="p-4 w-[40%] font-black uppercase text-[10px] tracking-wider border-l border-slate-200 text-rose-700 bg-rose-50/20">Traditional Excel &amp; Manual Sheets</th>
                  <th className="p-4 w-[40%] font-black uppercase text-[10px] tracking-wider border-l border-slate-200 text-indigo-800 bg-indigo-50/25">KREIS Automation Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-600">
                
                {/* Row 1: Bill Numbering */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Bill Number Sequencing</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Staff manually track sequences in paper notebooks. High risk of duplicated sequence numbers or skipped slots.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Automatic sequential numbering (`01/2026-27`) calculated dynamically and locked per institution.</span>
                    </div>
                  </td>
                </tr>

                {/* Row 2: Cheque register */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Cheque Issue Register</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Office typist manually transcribes cheque numbers, dates, payees, and particulars line-by-line. High copy errors.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Zero data-entry. The system compiles register ledgers instantly directly from saved DC Bills and Hand Vouchers.</span>
                    </div>
                  </td>
                </tr>

                {/* Row 3: Deductions */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Tax Deductions Arithmetic</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Manual computation of 2% TDS or 4% GST deductions using pocket calculators. Math slip-ups easily print to files.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Core calculator engine computes percentages and fixed deductions, generating net amounts on keystroke.</span>
                    </div>
                  </td>
                </tr>

                {/* Row 4: Kannada Font rendering */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Kannada Print Layouts</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Copying texts from Nudi editor into Excel templates leads to corrupted glyphs, overlapping text, and broken prints.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>System font canvas translates Unicode characters directly into flawless, Nudi-compliant printed vector A4 PDFs.</span>
                    </div>
                  </td>
                </tr>

                {/* Row 5: Bulk operations */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Bulk Document Zipping</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Office staff manually locate file paths, rename individual sheets, and compile them into WinZip folders.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Integrated JSZip packages all compiled documents matching date filters automatically with a live status bar.</span>
                    </div>
                  </td>
                </tr>

                {/* Row 6: Security and access */}
                <tr>
                  <td className="p-4 font-black text-slate-800">Data Safety &amp; Access Control</td>
                  <td className="p-4 border-l border-slate-200 bg-rose-50/5">
                    <div className="flex items-start gap-2">
                      <X className="h-4.5 w-4.5 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Excel spreadsheets saved locally. Vulnerable to accidental deletions, file corruption, or unauthorized eyes.</span>
                    </div>
                  </td>
                  <td className="p-4 border-l border-slate-200 bg-indigo-50/5 text-slate-800">
                    <div className="flex items-start gap-2">
                      <Check className="h-4.5 w-4.5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                      <span>Protected cloud storage with Supabase Row-Level Security (RLS) ensuring strict multi-tenant school isolation.</span>
                    </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View: Stacked Comparison Cards (visible on mobile, hidden on desktop) */}
        <div className="md:hidden space-y-4">
          {[
            {
              area: "Bill Number Sequencing",
              traditional: "Staff manually track sequences in paper notebooks. High risk of duplicated sequence numbers or skipped slots.",
              kreis: "Automatic sequential numbering ('01/2026-27') calculated dynamically and locked per institution."
            },
            {
              area: "Cheque Issue Register",
              traditional: "Office typist manually transcribes cheque numbers, dates, payees, and particulars line-by-line. High copy errors.",
              kreis: "Zero data-entry. The system compiles register ledgers instantly directly from saved DC Bills and Hand Vouchers."
            },
            {
              area: "Tax Deductions Arithmetic",
              traditional: "Manual computation of 2% TDS or 4% GST deductions using pocket calculators. Math slip-ups easily print to files.",
              kreis: "Core calculator engine computes percentages and fixed deductions, generating net amounts on keystroke."
            },
            {
              area: "Kannada Print Layouts",
              traditional: "Copying texts from Nudi editor into Excel templates leads to corrupted glyphs, overlapping text, and broken prints.",
              kreis: "System font canvas translates Unicode characters directly into flawless, Nudi-compliant printed vector A4 PDFs."
            },
            {
              area: "Bulk Document Zipping",
              traditional: "Office staff manually locate file paths, rename individual sheets, and compile them into WinZip folders.",
              kreis: "Integrated JSZip packages all compiled documents matching date filters automatically with a live status bar."
            },
            {
              area: "Data Safety & Access Control",
              traditional: "Excel spreadsheets saved locally. Vulnerable to accidental deletions, file corruption, or unauthorized eyes.",
              kreis: "Protected cloud storage with Supabase Row-Level Security (RLS) ensuring strict multi-tenant school isolation."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-300 rounded-xl p-4 shadow-sm space-y-3">
              <h4 className="font-black text-xs text-slate-900 border-b border-slate-100 pb-1.5 uppercase tracking-wider">
                {item.area}
              </h4>
              <div className="space-y-2">
                <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 text-xs text-slate-700">
                  <p className="text-[9px] font-black text-rose-800 uppercase tracking-wider mb-1">Traditional Excel &amp; Manual</p>
                  <div className="flex items-start gap-1.5">
                    <X className="h-4 w-4 text-rose-600 bg-rose-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item.traditional}</span>
                  </div>
                </div>
                <div className="bg-indigo-50/30 border border-indigo-100 rounded-lg p-2.5 text-xs text-slate-800">
                  <p className="text-[9px] font-black text-indigo-900 uppercase tracking-wider mb-1">KREIS Platform Automation</p>
                  <div className="flex items-start gap-1.5 font-bold">
                    <Check className="h-4 w-4 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item.kreis}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM CORE FEATURES SECTION */}
      <section className="py-20 px-4 md:px-6 max-w-6xl mx-auto w-full border-t border-slate-200">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-200">Feature Suite</span>
          <h3 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight">Technical Architecture &amp; System Capabilities</h3>
          <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
            Programmatic solutions mapped to standard KREIS residential school office administrative requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: DC Bills Module */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
            <div className="bg-indigo-55 text-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-200">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Contingency (DC) Bills</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Create Maintenance &amp; Salary DC Bills with automatic school-scoped sequential numbering (`01/2026-27`) and unique 6-digit cheque logging.
            </p>
          </div>

          {/* Card 2: Hand Vouchers */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
            <div className="bg-emerald-50 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center border border-emerald-200">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Dynamic Hand Vouchers</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Separate module supporting 4 layouts: Guest Teacher, Milling, Labor, and Gas. Computes `quantity * rate` dynamically with zero mobile horizontal drag.
            </p>
          </div>

          {/* Card 3: Cheque Register */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="bg-blue-50 text-blue-700 w-10 h-10 rounded-xl flex items-center justify-center border border-blue-200">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Cheque Issue Register</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Auto-compiles details serial-wise directly from created DC Bills. Supports custom date-range filters, landscape A4 PDF printing, and Excel sheets.
            </p>
          </div>

          {/* Card 4: Deductions Engine */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-bl-full pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
            <div className="bg-violet-50 text-violet-700 w-10 h-10 rounded-xl flex items-center justify-center border border-violet-200">
              <Calculator className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Flexible Deductions</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
              Inject custom percentages (TDS/GST) and fixed deductions. Calculates net payable amounts and English amount-in-words strings automatically.
            </p>
          </div>

          {/* Card 5: Bulk Downloader */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            <div className="bg-amber-50 text-amber-700 w-10 h-10 rounded-xl flex items-center justify-center border border-amber-200">
              <Download className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Bulk ZIP Packager</h4>
            <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
              Export generated documents in date ranges. Compiles PDFs sequentially inside a client-side ZIP container with a progressive status bar.
            </p>
          </div>

          {/* Card 6: Multi-Tenant Isolation */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
            <div className="bg-cyan-50 text-cyan-700 w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Multi-Tenant Isolation</h4>
            <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
              Institutional security driven by Supabase Row-Level Security (RLS). Ensures schools only read, update, or delete their own bills and configs.
            </p>
          </div>

          {/* Card 7: PDF Watermarks */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
            <div className="bg-rose-50 text-rose-700 w-10 h-10 rounded-xl flex items-center justify-center border border-rose-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Audit Watermarks</h4>
            <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
              Automatically embeds timezone-independent audit stamps on all print pages, displaying compiled document IDs and creation dates.
            </p>
          </div>

          {/* Card 8: Setup Wizard */}
          <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-4 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-bl-full pointer-events-none group-hover:bg-pink-500/10 transition-colors" />
            <div className="bg-pink-50 text-pink-700 w-10 h-10 rounded-xl flex items-center justify-center border border-pink-200">
              <Building2 className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Onboarding Setup Wizard</h4>
            <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
              Guide staff to configure Kannada Unicode school details, persistent SB A/c records, bank routing keys, and principal signatures.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW STEPPER TIMELINE (With Lucide React Icons inside 100% visible circles) */}
      <section className="py-20 px-4 md:px-6 border-t border-slate-200 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[9px] font-black tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase border border-indigo-200">Process Workflow</span>
            <h3 className="text-2xl md:text-3.5xl font-black text-slate-900 tracking-tight">Administrative Procedure</h3>
            <p className="text-slate-550 text-xs md:text-sm max-w-xl mx-auto font-medium">
              How the DC Bill Automation System streamlines document generation in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop timeline horizontal bar */}
            <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-700 opacity-20 z-0"></div>
            
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10 text-center space-y-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md border border-indigo-700 relative">
                <LockKeyhole className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">1</span>
              </div>
              <h5 className="font-extrabold text-slate-900 text-sm">Secure Authentication</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Staff log in via secure credentials. Segregated multi-school environment isolation is enforced.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10 text-center space-y-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md border border-indigo-700 relative">
                <Building2 className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">2</span>
              </div>
              <h5 className="font-extrabold text-slate-900 text-sm">Configuration Profile</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Setup Kannada school titles, addresses, bank metadata, and signatures in the database wizard once.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10 text-center space-y-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md border border-indigo-700 relative">
                <FileText className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">3</span>
              </div>
              <h5 className="font-extrabold text-slate-900 text-sm">Create Bill / Voucher</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Input transaction data. System automatically numbers drafts and computes tax deductions dynamically.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all relative z-10 text-center space-y-4">
              <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-md border border-indigo-700 relative">
                <Download className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">4</span>
              </div>
              <h5 className="font-extrabold text-slate-900 text-sm">Vector PDF Printout</h5>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Download formatted document with vector font maps, sign, check the auto-compiled register log, and archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DEVELOPER SPOTLIGHT BENTO PASSPORT CARD */}
      <section className="py-20 px-4 md:px-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left side details */}
            <div className="md:col-span-8 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-500/30">
                <Zap className="h-3 w-3 text-indigo-400" />
                Technical Architect
              </div>
              
              <div className="space-y-1">
                <h4 className="text-2xl md:text-3.5xl font-black tracking-tight text-white">Manoj Kumar V</h4>
                <p className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  Alumnus of Morarji Desai Residential School (Sulibele)
                </p>
                <p className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  Alumnus of Morarji Desai PU College (Hosakote)
                </p>
              </div>

              <div className="text-slate-300 font-medium text-xs md:text-[13px] leading-relaxed max-w-lg space-y-2">
                <p className="flex items-start gap-1.5">
                  <GraduationCap className="h-4 w-4 text-indigo-300 shrink-0 mt-0.5" />
                  <span>6th Semester B.Tech student in Computer Science and Business Systems (CSBS) at Visvesvaraya Technological University (VTU).</span>
                </p>
                <p>
                  Architected this automation suite to streamline government institutional workflows, converting manual school DC billing procedures into an optimized, secure digital pipeline.
                </p>
              </div>
            </div>

            {/* Right social list (SOLID backgrounds, highly visible redirect links) */}
            <div className="md:col-span-4 w-full flex flex-col gap-3 justify-center">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-[9px] font-black tracking-widest text-slate-300 uppercase text-center">Contact &amp; Profiles</p>
                
                <a 
                  href="mailto:svmmdrpu@gmail.com" 
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-905 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all text-slate-200 text-[11px] font-black"
                >
                  <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">svmmdrpu@gmail.com</span>
                </a>

                <a 
                  href="tel:+917975464020" 
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-905 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all text-slate-200 text-[11px] font-black"
                >
                  <Phone className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span>+91 7975464020</span>
                </a>

                <div className="grid grid-cols-2 gap-2">
                  <a 
                    href="https://github.com/SVM3116" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-905 border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 text-white text-xs font-black transition-all"
                  >
                    <GithubIcon className="h-4 w-4 text-white" />
                    GitHub
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/manoj-kumar-v-svm/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 text-white text-xs font-black transition-all"
                  >
                    <LinkedinIcon className="h-4 w-4 text-white" />
                    LinkedIn
                  </a>
                </div>
              </div>

              <Link
                href="/developer"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 px-5 rounded-xl shadow-lg border border-indigo-500"
              >
                Developer Profile
                <ArrowUpRight className="h-4 w-4 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CENTERED FOOTER */}
      <footer className="border-t border-slate-200 py-10 px-4 md:px-6 bg-slate-50 text-center text-xs text-slate-500 shrink-0 mt-auto font-sans">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-5">
          
          {/* Institutional banner */}
          <p className="text-slate-800 font-black text-sm tracking-tight text-center max-w-xl leading-relaxed">
            Karnataka Residential Educational Institutions Society (KREIS)
          </p>

          {/* Credit Block */}
          <p className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse text-xs">❤️</span>
            <span>by</span>
            <Link href="/developer" className="font-black text-indigo-600 hover:text-indigo-850 transition-colors hover:underline">
              Manoj Kumar V
            </Link>
          </p>

          <div className="w-16 h-[1px] bg-slate-300 rounded-full" />

          {/* Redesigned Contact & Social Icons Row */}
          <div className="flex items-center justify-center gap-3">
            {/* Email Icon */}
            <a 
              href="mailto:svmmdrpu@gmail.com" 
              className="w-9 h-9 rounded-full text-slate-600 hover:text-red-600 bg-white hover:bg-red-50 transition-all border border-slate-200 hover:border-red-200 flex items-center justify-center shadow-sm"
              title="Email: svmmdrpu@gmail.com"
            >
              <Mail className="h-4 w-4" />
            </a>

            {/* Phone Icon */}
            <a 
              href="tel:+917975464020" 
              className="w-9 h-9 rounded-full text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 transition-all border border-slate-200 hover:border-blue-200 flex items-center justify-center shadow-sm"
              title="Call: +91 7975464020"
            >
              <Phone className="h-4 w-4" />
            </a>

            {/* WhatsApp Icon */}
            <a 
              href="https://wa.me/917975464020" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full text-slate-600 hover:text-emerald-600 bg-white hover:bg-emerald-50 transition-all border border-slate-200 hover:border-emerald-200 flex items-center justify-center shadow-sm"
              title="WhatsApp Chat: +91 7975464020"
            >
              <WhatsappIcon className="h-4.5 w-4.5" />
            </a>

            {/* GitHub Icon */}
            <a 
              href="https://github.com/SVM3116" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 transition-all border border-slate-200 hover:border-slate-350 flex items-center justify-center shadow-sm"
              title="GitHub Profile"
            >
              <GithubIcon className="h-4 w-4" />
            </a>

            {/* LinkedIn Icon */}
            <a 
              href="https://www.linkedin.com/in/manoj-kumar-v-svm/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 transition-all border border-slate-200 hover:border-indigo-200 flex items-center justify-center shadow-sm"
              title="LinkedIn Profile"
            >
              <LinkedinIcon className="h-4 w-4" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}
