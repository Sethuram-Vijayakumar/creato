"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TRANSLATIONS, LanguageCode, TranslationDictionary } from "@/lib/translations";

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: keyof TranslationDictionary) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Read persisted language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("creato_lang") as LanguageCode;
    if (savedLang && TRANSLATIONS[savedLang]) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (code: LanguageCode) => {
    if (TRANSLATIONS[code]) {
      setLanguageState(code);
      localStorage.setItem("creato_lang", code);
    }
  };

  const t = (key: keyof TranslationDictionary): string => {
    const currentDict = TRANSLATIONS[language];
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    // Fallback to English
    return TRANSLATIONS["en"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
