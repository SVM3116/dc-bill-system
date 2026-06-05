import React from "react";
import { Building2 } from "lucide-react";

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
      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 bg-white shrink-0 font-sans">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-2.5">
          {/* Organization info shown first */}
          <p className="text-slate-800 font-extrabold text-sm tracking-tight text-center">
            Karnataka Residential Educational Institutions Society (KREIS) School Management
          </p>

          <div className="w-16 h-0.5 bg-slate-200 rounded-full" />

          {/* Developer details shown below */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-slate-400 font-semibold text-[11px]">
            <span className="text-slate-500">Developed by</span>
            <Link href="/developer" className="font-extrabold text-blue-600 hover:text-blue-800 hover:underline">
              Manoj Kumar V
            </Link>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span className="text-slate-500">Email:</span>
            <a href="mailto:svmmdrpu@gmail.com" className="hover:text-blue-600 transition-colors">svmmdrpu@gmail.com</a>
            <div className="h-3 w-[1px] bg-slate-200" />
            <span className="text-slate-500">Contact:</span>
            <a href="tel:+917975464020" className="hover:text-blue-600 transition-colors">+91 7975464020</a>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <a href="https://github.com/SVM3116" target="_blank" rel="noopener noreferrer" className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 bg-slate-50/50" title="GitHub">
                <GithubIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://www.linkedin.com/in/manoj-kumar-v-svm/" target="_blank" rel="noopener noreferrer" className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-200 bg-slate-50/50" title="LinkedIn">
                <LinkedinIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
