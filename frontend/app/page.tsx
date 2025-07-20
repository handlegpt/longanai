'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Download, Share2, History, Upload, User, LogOut, Globe, Play, Pause } from 'lucide-react';
import PodcastGenerator from '@/components/PodcastGenerator';
import VoiceSelector from '@/components/VoiceSelector';
import FileUpload from '@/components/FileUpload';
import HistoryPanel from '@/components/HistoryPanel';
import EmailLogin from '@/components/EmailLogin';

// Interface language translations
const translations = {
  cantonese: {
    // Header
    title: '龙眼AI',
    subtitle: '智能粤语播客生成平台',
    generatePodcast: '生成播客',
    history: '历史记录',
    login: '登录',
    logout: '退出',
    
    // Hero section
    heroTitle: '用AI生成地道嘅粤语播客',
    heroSubtitle: '选择你嘅播客主持人，输入内容，一键生成专业级嘅粤语播客',
    
    // Language selection
    selectLanguage: '选择语言',
    cantoneseLang: '粤语',
    guangdonghuaLang: '广东话',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: '选择声音',
    youngLady: '靓女',
    youngLadyDesc: '年轻女性声音',
    youngMan: '靓仔',
    youngManDesc: '年轻男性声音',
    elderlyWoman: '阿嫲',
    elderlyWomanDesc: '年长女性声音',
    
    // Text input
    inputTitle: '输入要转换的文本',
    inputSubtitle: '支持中文、英文等多种语言',
    inputPlaceholder: '请输入要转换为播客的文本内容...',
    characterCount: '字符数',
    generating: '生成中...',
    
    // File upload
    uploadTitle: '或者上传文件',
    uploadSubtitle: '支持TXT、DOC、PDF等格式',
    
    // Footer
    copyright: '© 2024 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你嘅粤语故事',
    
    // Welcome message
    welcomeTitle: '欢迎使用龙眼AI',
    welcomeSubtitle: '请先登录以开始使用粤语播客生成功能',
    loginNow: '立即登录'
  },
  mandarin: {
    // Header
    title: '龙眼AI',
    subtitle: '智能粤语播客生成平台',
    generatePodcast: '生成播客',
    history: '历史记录',
    login: '登录',
    logout: '退出',
    
    // Hero section
    heroTitle: '用AI生成地道的粤语播客',
    heroSubtitle: '选择你的播客主持人，输入内容，一键生成专业级的粤语播客',
    
    // Language selection
    selectLanguage: '选择语言',
    cantoneseLang: '粤语',
    guangdonghuaLang: '广东话',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: '选择声音',
    youngLady: '靓女',
    youngLadyDesc: '年轻女性声音',
    youngMan: '靓仔',
    youngManDesc: '年轻男性声音',
    elderlyWoman: '阿嫲',
    elderlyWomanDesc: '年长女性声音',
    
    // Text input
    inputTitle: '输入要转换的文本',
    inputSubtitle: '支持中文、英文等多种语言',
    inputPlaceholder: '请输入要转换为播客的文本内容...',
    characterCount: '字符数',
    generating: '生成中...',
    
    // File upload
    uploadTitle: '或者上传文件',
    uploadSubtitle: '支持TXT、DOC、PDF等格式',
    
    // Footer
    copyright: '© 2024 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你的粤语故事',
    
    // Welcome message
    welcomeTitle: '欢迎使用龙眼AI',
    welcomeSubtitle: '请先登录以开始使用粤语播客生成功能',
    loginNow: '立即登录'
  },
  english: {
    // Header
    title: 'Longan AI',
    subtitle: 'Intelligent Cantonese Podcast Generation Platform',
    generatePodcast: 'Generate Podcast',
    history: 'History',
    login: 'Login',
    logout: 'Logout',
    
    // Hero section
    heroTitle: 'Generate Authentic Cantonese Podcasts with AI',
    heroSubtitle: 'Choose your podcast host, input content, and generate professional Cantonese podcasts with one click',
    
    // Language selection
    selectLanguage: 'Select Language',
    cantoneseLang: 'Cantonese',
    guangdonghuaLang: 'Guangdong Dialect',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: 'Select Voice',
    youngLady: 'Young Lady',
    youngLadyDesc: 'Young female voice',
    youngMan: 'Young Man',
    youngManDesc: 'Young male voice',
    elderlyWoman: 'Elderly Woman',
    elderlyWomanDesc: 'Elderly female voice',
    
    // Text input
    inputTitle: 'Enter Text to Convert',
    inputSubtitle: 'Supports Chinese, English and other languages',
    inputPlaceholder: 'Enter text content to convert to podcast...',
    characterCount: 'Characters',
    generating: 'Generating...',
    
    // File upload
    uploadTitle: 'Or Upload File',
    uploadSubtitle: 'Supports TXT, DOC, PDF and other formats',
    
    // Footer
    copyright: '© 2024 Longan AI. All rights reserved.',
    slogan: 'Let AI tell your Cantonese stories well',
    
    // Welcome message
    welcomeTitle: 'Welcome to Longan AI',
    welcomeSubtitle: 'Please login to start using Cantonese podcast generation features',
    loginNow: 'Login Now'
  }
};

export default function Home() {
  // State management for UI components
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedVoice, setSelectedVoice] = useState('young-lady');
  const [selectedLanguage, setSelectedLanguage] = useState('cantonese');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Website interface language options
  const interfaceLanguages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '普通话', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  // Voice options for podcast generation
  const voices = [
    { id: 'young-lady', name: '靓女', description: '年轻女性声音' },
    { id: 'young-man', name: '靓仔', description: '年轻男性声音' },
    { id: 'elderly-woman', name: '阿嫲', description: '年长女性声音' },
  ];

  // Get current translation based on selected interface language
  const t = translations[selectedLanguage as keyof typeof translations] || translations.cantonese;

  // Handle user login
  const handleLogin = (token: string, email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setShowLogin(false);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
  };

  // Handle user logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setShowLogin(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
  };

  // Handle podcast generation
  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('请输入要转换的文本');
      return;
    }
    
    setIsGenerating(true);
    // TODO: Call API to generate podcast
    setTimeout(() => {
      setIsGenerating(false);
      alert('播客生成完成！');
    }, 3000);
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // Show login modal if login is requested
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <EmailLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header with navigation and user controls */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">龙</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            
            {/* Navigation and user section */}
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'generate'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.generatePodcast}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {t.history}
                </button>
              </nav>

              {/* User authentication section */}
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{userEmail}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>{t.login}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show new interface regardless of login status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero section with main title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t.heroTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>

          {/* Interface language and voice selection cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Interface language selection card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">{t.selectLanguage}</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {interfaceLanguages.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => setSelectedLanguage(language.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLanguage === language.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{language.flag}</div>
                    <div className="text-sm font-medium">{language.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice selection card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-900">{t.selectVoice}</h3>
              </div>
              <div className="space-y-3">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedVoice === voice.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-sm text-gray-500">{voice.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text input section for podcast content */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.inputTitle}</h3>
              <p className="text-sm text-gray-600">{t.inputSubtitle}</p>
            </div>
            
            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {t.characterCount}: {inputText.length}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>{t.generating}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{t.generatePodcast}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* File upload section as alternative */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.uploadTitle}</h3>
              <p className="text-sm text-gray-600">{t.uploadSubtitle}</p>
            </div>
            <FileUpload />
          </div>
        </motion.div>
      </main>

      {/* Footer with copyright information */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>{t.copyright}</p>
            <p className="mt-2">{t.slogan}</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 