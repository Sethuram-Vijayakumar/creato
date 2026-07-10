"use client";

import React, { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { LANGUAGES_LIST, LanguageCode } from "@/lib/translations";
import { Globe, ChevronDown } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES_LIST.find((l) => l.code === language) || LANGUAGES_LIST[0];

  return (
    <div className="relative inline-block text-left z-50">
      <div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none shadow-2xs transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentLang.nativeName}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 origin-top-right rounded-lg bg-white shadow-lg border border-slate-100 ring-1 ring-black/5 focus:outline-none z-50 divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
            <div className="py-1">
              {LANGUAGES_LIST.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between ${
                    lang.code === language
                      ? "bg-luxury-purple-50 text-luxury-purple-600 font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">({lang.name})</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
