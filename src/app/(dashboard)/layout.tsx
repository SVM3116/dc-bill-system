"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Building2, FilePlus2, Files, LayoutDashboard, LogOut, User, Menu, X, Code, Settings, Mail, Phone } from "lucide-react";
import { SessionGuard } from "@/components/SessionGuard";

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
import { toast } from "sonner";

function getClientFinancialYear(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 3 = April
  if (month >= 3) {
    const nextYearShort = String(year + 1).slice(-2);
    return `${year}-${nextYearShort}`;
  } else {
    const prevYear = year - 1;
    const currentYearShort = String(year).slice(-2);
    return `${prevYear}-${currentYearShort}`;
  }
}

interface SidebarNavProps {
  pathname: string;
  onLinkClick?: () => void;
}

function SidebarNav({ pathname, onLinkClick }: SidebarNavProps) {
  const searchParams = useSearchParams();
  const currentAccountType = searchParams ? searchParams.get("account_type") : null;

  const renderNavLink = (name: string, href: string, icon: any, isActive: boolean, isSubItem = false, tourId?: string) => {
    const IconComponent = icon;
    return (
      <Link
        key={name}
        href={href}
        onClick={onLinkClick}
        data-tour={tourId}
        className={`flex items-center gap-3 py-2 text-sm font-semibold rounded-md transition-all duration-150 ${
          isSubItem ? "pl-8 text-xs" : "px-3"
        } ${
          isActive
            ? "bg-slate-800 text-white font-black border-l-4 border-blue-500 shadow-inner"
            : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
        }`}
      >
        <IconComponent className={`${isSubItem ? "h-3.5 w-3.5" : "h-4 w-4"} shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
        <span>{name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Main Panel Section */}
      <div className="pb-2">
        {renderNavLink("Dashboard", "/dashboard", LayoutDashboard, pathname === "/dashboard", false, "tour-dashboard")}
      </div>

      {/* Maintenance Account Section */}
      <div className="pt-4 pb-1 border-t border-slate-800/60 mt-1">
        <p className="px-3 text-xs font-black text-blue-400 tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <span className="h-1.5 w-1.5 bg-blue-500 rounded-full shrink-0" />
          Maintenance Account
        </p>
        <div className="space-y-1">
          {renderNavLink(
            "Create DC Bill",
            "/bills/new?account_type=maintenance",
            FilePlus2,
            pathname === "/bills/new" && currentAccountType === "maintenance",
            true,
            "tour-create-maintenance"
          )}
          {renderNavLink(
            "View Bills",
            "/bills?account_type=maintenance",
            Files,
            pathname === "/bills" && currentAccountType === "maintenance",
            true,
            "tour-view-maintenance"
          )}
        </div>
      </div>

      {/* Salary Account Section */}
      <div className="pt-4 pb-1 border-t border-slate-800/60 mt-2">
        <p className="px-3 text-xs font-black text-purple-400 tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <span className="h-1.5 w-1.5 bg-purple-500 rounded-full shrink-0" />
          Salary Account
        </p>
        <div className="space-y-1">
          {renderNavLink(
            "Create DC Bill",
            "/bills/new?account_type=salary",
            FilePlus2,
            pathname === "/bills/new" && currentAccountType === "salary",
            true,
            "tour-create-salary"
          )}
          {renderNavLink(
            "View Bills",
            "/bills?account_type=salary",
            Files,
            pathname === "/bills" && currentAccountType === "salary",
            true,
            "tour-view-salary"
          )}
        </div>
      </div>

      {/* Hand Vouchers Section */}
      <div className="pt-4 pb-1 border-t border-slate-800/60 mt-2">
        <p className="px-3 text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
          Hand Vouchers
        </p>
        <div className="space-y-1">
          {renderNavLink(
            "Create Hand Voucher",
            "/hand-vouchers/new",
            FilePlus2,
            pathname === "/hand-vouchers/new",
            true,
            "tour-create-voucher"
          )}
          {renderNavLink(
            "View Hand Vouchers",
            "/hand-vouchers",
            Files,
            pathname === "/hand-vouchers",
            true,
            "tour-view-vouchers"
          )}
        </div>
      </div>

      {/* Administration & Configuration Section */}
      <div className="pt-4 pb-1 border-t border-slate-800 mt-2">
        <p className="px-3 text-xs font-black text-amber-400 tracking-wider uppercase flex items-center gap-1.5 mb-2">
          <span className="h-1.5 w-1.5 bg-amber-500 rounded-full shrink-0" />
          Administration
        </p>
        <div className="space-y-1">
          {renderNavLink("Cheque Register", "/cheque-register", Files, pathname === "/cheque-register", false, "tour-cheque")}
          {renderNavLink("School Setup", "/school-setup", Settings, pathname === "/school-setup", false, "tour-setup")}
        </div>
      </div>
    </>
  );
}

function cleanKannadaText(str: string): string {
  if (!str) return "";
  const hasKannada = /[\u0C80-\u0CFF]/.test(str);
  if (!hasKannada) return str;
  const cleaned = str.replace(/[a-zA-Z][a-zA-Z0-9\s,().-]*| [a-zA-Z0-9\s,().-]*/g, (match) => {
    if (/[a-zA-Z]/.test(match)) {
      return "";
    }
    return match;
  }).trim().replace(/\s+/g, ' ');
  if (!cleaned || cleaned.replace(/[^\u0C80-\u0CFF]/g, "").length === 0) {
    return str;
  }
  return cleaned;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);
  const [userName, setUserName] = useState("Principal");
  const [schoolNameEn, setSchoolNameEn] = useState("School Dashboard");
  const [schoolNameKn, setSchoolNameKn] = useState("");
  const [schoolAddressKn, setSchoolAddressKn] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [financialYear, setFinancialYear] = useState("2026-27");

  // Fetch school configuration and user information
  useEffect(() => {
    const getSchoolData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: school } = await supabase
          .from("schools")
          .select("school_name_en, principal_name, school_name_kn, school_address_kn")
          .eq("id", user.id)
          .single();
        if (school) {
          setSchoolNameEn(school.school_name_en);
          setUserName(school.principal_name);
          setSchoolNameKn(school.school_name_kn || "");
          setSchoolAddressKn(school.school_address_kn || "");
        } else {
          setSchoolNameEn(user.user_metadata?.school_name_en || "School");
          setUserName(user.user_metadata?.principal_name || "Principal");
        }
      }
    };
    getSchoolData();
  }, [supabase]);

  // Read/initialize financial year cookie
  useEffect(() => {
    const match = document.cookie.match(/(^|;)\s*financial_year\s*=\s*([^;]+)/);
    if (match) {
      setFinancialYear(match[2]);
    } else {
      const defaultYear = getClientFinancialYear();
      document.cookie = `financial_year=${defaultYear}; path=/; max-age=31536000`;
      setFinancialYear(defaultYear);
    }
  }, []);

  const handleYearChange = (value: string) => {
    setFinancialYear(value);
    document.cookie = `financial_year=${value}; path=/; max-age=31536000`;
    router.refresh();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed: " + error.message);
      } else {
        toast.success("Successfully logged out.");
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred during logout.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* 1. DESKTOP FIXED SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0 hidden md:flex sticky top-0 h-screen">
        {/* Brand header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-1.5 rounded">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">School Office</p>
            <h2 className="text-sm font-extrabold text-white tracking-tight">DC Bill System</h2>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <React.Suspense fallback={<div className="text-slate-500 text-xs px-3">Loading menu...</div>}>
            <SidebarNav pathname={pathname} />
          </React.Suspense>
        </nav>

        {/* Profile and Logout info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-800 p-2 rounded-full text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-red-950 hover:text-red-400 rounded-md border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MOBILE NAVIGATION DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Slide-out Drawer Panel */}
          <aside className="relative flex w-full max-w-[280px] flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-transform duration-300">
            {/* Close button */}
            <div className="absolute right-4 top-4">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Brand header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
              <div className="bg-blue-600 text-white p-1.5 rounded">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">School Office</p>
                <h2 className="text-sm font-extrabold text-white tracking-tight">DC Bill System</h2>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <React.Suspense fallback={<div className="text-slate-500 text-xs px-3">Loading menu...</div>}>
                <SidebarNav pathname={pathname} onLinkClick={() => setIsDrawerOpen(false)} />
              </React.Suspense>
            </nav>

            {/* Profile and Logout info */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-slate-800 p-2 rounded-full text-slate-300">
                  <User className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-red-950 hover:text-red-400 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-1 rounded text-slate-500 hover:text-slate-700 focus:outline-none md:hidden cursor-pointer h-9 w-9 flex items-center justify-center"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h1 className="text-xs md:text-sm font-bold text-slate-800 leading-tight">
              {schoolNameEn}
            </h1>
          </div>
          
          {/* Financial Year select dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={financialYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors min-h-[38px]"
            >
              <option value="2024-25">A.Y. 2024-25</option>
              <option value="2025-26">A.Y. 2025-26</option>
              <option value="2026-27">A.Y. 2026-27</option>
              <option value="2027-28">A.Y. 2027-28</option>
            </select>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
          <SessionGuard />
          {children}
        </main>

        {/* Redesigned Footer */}
        <footer className="border-t border-slate-200 py-10 px-4 md:px-6 bg-slate-50 text-center text-xs text-slate-500 shrink-0 mt-auto font-sans">
          <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-5">
            
            {/* Credit Block */}
            <p className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse text-xs">❤️</span>
              <span>by</span>
              <Link href="/developer" className="font-black text-indigo-600 hover:text-indigo-850 transition-colors hover:underline">
                Manoj Kumar V
              </Link>
            </p>

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

    </div>
  );
}
