"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Lang = "en" | "hi";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedLang = localStorage.getItem("pyq_lang") as Lang;
    if (storedLang === "hi" || storedLang === "en") {
      setLangState(storedLang);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("pyq_lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {/* Suppress hydration mismatch by returning empty during SSR, or just children if we don't care about initial text mismatch */}
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
