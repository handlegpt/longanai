'use client';

import Link from 'next/link';
import { User, Globe, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const router = useRouter();

  const languages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '中文', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('user_email');
      if (token && email) {
        setIsLoggedIn(true);
        setUserEmail(email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-dropdown') && !target.closest('.language-dropdown')) {
        setShowUserDropdown(false);
        setShowLanguageDropdown(false);
      }
    };

    if (showUserDropdown || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showLanguageDropdown]);

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    setIsLoggedIn(false);
    setUserEmail('');
    setShowUserDropdown(false);
    router.push('/');
  };

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
        <div className="relative language-dropdown">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center space-x-1 hover:text-primary transition"
          >
            <Globe className="w-4 h-4" />
            <span>{languages.find(lang => lang.id === language)?.flag}</span>
          </button>
          {showLanguageDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    setLanguage(lang.id as any);
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
        
        {/* 用户登录状态 */}
        {isLoggedIn ? (
          <div className="relative user-dropdown">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 hover:text-primary transition"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">{userEmail.split('@')[0]}</span>
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  {userEmail}
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserDropdown(false)}
                >
                  个人中心
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="flex items-center space-x-1 hover:text-primary transition">
            <User className="w-4 h-4" />
            <span>登录</span>
          </Link>
        )}
      </div>
    </nav>
  );
} 