import React from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-slate-50/60 justify-between">
      {/* Header */}
      <header className="border-b border-slate-200/80 py-3.5 px-6 bg-white/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
              KREIS DC Bill Platform
            </span>
          </Link>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            Secure Auth
          </span>
        </div>
      </header>

      {/* Main card area */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 bg-white shrink-0">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
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
          <p className="text-slate-400">
            Karnataka Residential Educational Institutions Society (KREIS) School Management
          </p>
        </div>
      </footer>
    </div>
  );
}
