import Link from "next/link";
import { Building2, FileSpreadsheet, LockKeyhole, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 py-4 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-800 text-white p-2 rounded">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-blue-800 uppercase">Government of Karnataka</p>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">Morarji Desai Residential School (B.C - 48)</h1>
            </div>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded border border-emerald-300">
            Office Utility
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            DC Bill Automation System
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-slate-600">
            Secure and automated preparation of Detailed Contingent (DC) Bills, cheque tracking, and administrative record keeping for the school office.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 shadow-sm space-y-3">
            <div className="text-blue-700">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-slate-900">Dynamic PDF Layout</h3>
            <p className="text-sm text-slate-600">
              Overlay bill details and dynamic rows onto the official template PDF at precise coordinates.
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 shadow-sm space-y-3">
            <div className="text-blue-700">
              <LockKeyhole className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-slate-900">Role-Based Security</h3>
            <p className="text-sm text-slate-600">
              Access is protected by secure session state. Only logged-in administrative staff can access files.
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 shadow-sm space-y-3">
            <div className="text-blue-700">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-semibold text-slate-900">Digital Archive</h3>
            <p className="text-sm text-slate-600">
              Instantly search, reprint, or download old bills with complete database audit histories.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-8">
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Office Staff Login
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Admin Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-6 bg-slate-50 text-center text-xs text-slate-500 space-y-1">
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
