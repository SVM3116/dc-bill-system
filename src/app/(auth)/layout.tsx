import React from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 justify-between">
      {/* Header */}
      <header className="border-b border-slate-200 py-3 px-6 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-800 text-white p-1.5 rounded">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-800 tracking-tight text-sm sm:text-base">
              MDRS Malur (B.C - 48)
            </span>
          </Link>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
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
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 bg-white space-y-1">
        <p>
          Developed by{" "}
          <Link href="/developer" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
            Manoj Kumar V (Proud Alumnus)
          </Link>
        </p>
        <p>Morarji Desai Residential School, Malur Town, Malur Taluk, Kolar District - 563130</p>
      </footer>
    </div>
  );
}
