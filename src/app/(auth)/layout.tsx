import React from "react";
import { Building2, Mail, Phone } from "lucide-react";

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
