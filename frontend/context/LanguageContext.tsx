"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type Language = "cantonese" | "mandarin" | "english";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  switchLanguageWithPath: (lang: Language) => void;
}>({
  language: "mandarin",
  setLanguage: () => {},
  switchLanguageWithPath: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

// 语言路径映射
const languagePaths = {
  mandarin: '/zh',
  cantonese: '/cantonese', 
  english: '/en'
};

// 根据路径检测语言
function detectLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/en')) return 'english';
  if (pathname.startsWith('/cantonese')) return 'cantonese';
  if (pathname.startsWith('/zh')) return 'mandarin';
  return 'mandarin'; // 默认中文
}

// 获取语言对应的路径
function getLanguagePath(language: Language): string {
  return languagePaths[language];
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("mandarin");

  // 根据当前路径设置语言
  useEffect(() => {
    const detectedLanguage = detectLanguageFromPath(pathname);
    setLanguageState(detectedLanguage);
    localStorage.setItem("selected_language", detectedLanguage);
  }, [pathname]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selected_language", lang);
  };

  // 切换语言并跳转到对应路径
  const switchLanguageWithPath = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("selected_language", lang);
    
    const targetPath = getLanguagePath(lang);
    const currentPath = pathname;
    
    // 如果当前路径不是目标语言路径，则跳转
    if (!currentPath.startsWith(targetPath)) {
      // 移除当前语言前缀
      let newPath = currentPath;
      Object.values(languagePaths).forEach(path => {
        if (newPath.startsWith(path)) {
          newPath = newPath.substring(path.length);
        }
      });
      
      // 如果路径为空，设为根路径
      if (!newPath || newPath === '/') {
        newPath = '/';
      }
      
      // 添加新的语言前缀
      const finalPath = targetPath + newPath;
      router.push(finalPath);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, switchLanguageWithPath }}>
      {children}
    </LanguageContext.Provider>
  );
};