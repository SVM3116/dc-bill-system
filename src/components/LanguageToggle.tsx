"use client";

import React from "react";
import { useTranslation } from "@/components/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-300 shadow-sm shrink-0 gap-0.5">
      <button
        type="button"
        onClick={() => setLanguage("kn")}
        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer border ${
          language === "kn"
            ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
            : "bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-300"
        }`}
      >
        ಕನ್ನಡ
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-md transition-all cursor-pointer border ${
          language === "en"
            ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
            : "bg-slate-50 hover:bg-slate-200 text-slate-700 border-slate-300"
        }`}
      >
        EN
      </button>
    </div>
  );
}
