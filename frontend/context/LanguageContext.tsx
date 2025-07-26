"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "cantonese" | "mandarin" | "english";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({
  language: "cantonese",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("mandarin");

  useEffect(() => {
    const saved = localStorage.getItem("selected_language");
    if (saved) setLanguageState(saved as Language);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selected_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}; 