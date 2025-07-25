'use client';

import Link from 'next/link';
import { User, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [selectedLanguage, setSelectedLanguage] = useState('cantonese');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const languages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '中文', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm z-20">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
          <img src="/logo.png" alt="龙眼AI Logo" className="h-8 w-8" />
          <span>龙眼AI</span>
        </Link>
      </div>
      <div className="flex items-center space-x-6 text-base font-medium">
        <Link href="/" className="hover:text-primary transition">制作播客</Link>
        <Link href="/explore" className="hover:text-primary transition">播客广场</Link>
        <Link href="/history" className="hover:text-primary transition">历史</Link>
        <Link href="/pricing" className="hover:text-primary transition">定价</Link>
        <Link href="/privacy" className="hover:text-primary transition">隐私</Link>
        
        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center space-x-1 hover:text-primary transition"
          >
            <Globe className="w-4 h-4" />
            <span>{languages.find(lang => lang.id === selectedLanguage)?.flag}</span>
          </button>
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedLanguage(lang.id);
                    setShowLanguageDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Link href="/login" className="flex items-center space-x-1 hover:text-primary transition">
          <User className="w-4 h-4" />
          <span>登录</span>
        </Link>
      </div>
    </nav>
  );
} 