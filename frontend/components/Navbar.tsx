'use client';

import Link from 'next/link';
import { User, Globe, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

// 翻译对象
const translations = {
  cantonese: {
    home: '首页',
    explore: '播客广场',
    pricing: '定价',
    languageSelection: '语言选择',
    user: '用户',
    profile: '个人中心',
    logout: '退出登录',
    login: '登录',
    other: '其他',
    privacyPolicy: '隐私政策'
  },
  mandarin: {
    home: '首页',
    explore: '播客广场',
    pricing: '定价',
    languageSelection: '语言选择',
    user: '用户',
    profile: '个人中心',
    logout: '退出登录',
    login: '登录',
    other: '其他',
    privacyPolicy: '隐私政策'
  },
  english: {
    home: 'Home',
    explore: 'Explore',
    pricing: 'Pricing',
    languageSelection: 'Language',
    user: 'User',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    other: 'Other',
    privacyPolicy: 'Privacy Policy'
  }
};

export default function Navbar() {
  const { language, setLanguage } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();

  // 获取当前翻译
  const t = translations[language as keyof typeof translations] || translations.cantonese;

  const languages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '中文', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  // 根据语言获取网站名称
  const getWebsiteName = () => {
    switch (language) {
      case 'english':
        return 'Longan AI';
      default:
        return '龙眼AI';
    }
  };

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      fetchUserProfile(email);
    }
  }, []);

  // 获取用户资料
  const fetchUserProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/podcast/user/stats?user_email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserDisplayName(data.display_name || email.split('@')[0]);
      }
    } catch (error) {
      console.error('获取用户资料失败:', error);
      setUserDisplayName(email.split('@')[0]);
    }
  };

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('user_email');
      if (token && email) {
        setIsLoggedIn(true);
        setUserEmail(email);
        fetchUserProfile(email);
      } else {
        setIsLoggedIn(false);
        setUserEmail('');
        setUserDisplayName('');
      }
    };

    // 监听自定义登录事件
    const handleUserLogin = (event: CustomEvent) => {
      const { token, email } = event.detail;
      setIsLoggedIn(true);
      setUserEmail(email);
      fetchUserProfile(email);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
    };
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
    setUserDisplayName('');
    setShowUserDropdown(false);
    setShowMobileMenu(false);
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
              <img src="/logo.png" alt="龙眼AI Logo" className="h-8 w-8" />
              <span className="hidden sm:block">{getWebsiteName()}</span>
              <span className="sm:hidden">{getWebsiteName()}</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-primary transition">{t.home}</Link>
            <Link href="/explore" className="hover:text-primary transition">{t.explore}</Link>
            <Link href="/pricing" className="hover:text-primary transition">{t.pricing}</Link>
            
            {/* Language Selector */}
            <div className="relative language-dropdown">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center space-x-2 hover:text-primary transition"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">
                  {languages.find(lang => lang.id === language)?.flag} {languages.find(lang => lang.id === language)?.name}
                </span>
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
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 hover:text-primary transition"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">{userDisplayName}</span>
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
                      {t.profile}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center space-x-1 hover:text-primary transition">
                <User className="w-4 h-4" />
                <span>{t.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                {t.home}
              </Link>
              <Link
                href="/explore"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                {t.explore}
              </Link>
              <Link
                href="/pricing"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                onClick={() => setShowMobileMenu(false)}
              >
                {t.pricing}
              </Link>
              
              {/* Mobile Language selector */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 mb-2">{t.languageSelection}</div>
                <div className="space-y-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as any);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center space-x-2 ${
                        language === lang.id 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Mobile User section */}
              {isLoggedIn ? (
                <div className="px-3 py-2 border-t border-gray-200">
                  <div className="text-sm font-medium text-gray-500 mb-2">{t.user}</div>
                  <div className="text-sm text-gray-700 mb-2">{userEmail}</div>
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t.profile}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 border-t border-gray-200">
                  <Link
                    href="/login"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>{t.login}</span>
                  </Link>
                </div>
              )}
              
              {/* Mobile Privacy section - moved to bottom */}
              <div className="px-3 py-2 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-2">{t.other}</div>
                <Link
                  href="/privacy"
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t.privacyPolicy}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 