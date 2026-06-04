"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Building2, FilePlus2, Files, LayoutDashboard, LogOut, User, Menu, X, Code, Settings } from "lucide-react";
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

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Create DC Bill",
      href: "/bills/new",
      icon: FilePlus2,
    },
    {
      name: "View All Bills",
      href: "/bills",
      icon: Files,
    },
    {
      name: "School Setup",
      href: "/school-setup",
      icon: Settings,
    },
  ];

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
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
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
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-blue-800 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
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
          {children}
        </main>

        {/* Developer Attribution Footer */}
        <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-500 shrink-0">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="flex flex-wrap items-center justify-center gap-1.5">
              <span>Developed by</span>
              <Link href="/developer" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
                Manoj Kumar V
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Email:</span>
              <a href="mailto:svmmdrpu@gmail.com" className="hover:text-blue-600 hover:underline">svmmdrpu@gmail.com</a>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Contact:</span>
              <a href="tel:+917975464020" className="hover:text-blue-600 hover:underline">+91 7975464020</a>
            </p>
            <p className="text-center md:text-right w-full md:max-w-xl text-slate-500 mt-1 md:mt-0">
              {schoolNameKn || schoolNameEn} {schoolAddressKn ? `- ${schoolAddressKn}` : ""}
            </p>
          </div>
        </footer>
      </div>

    </div>
  );
}
