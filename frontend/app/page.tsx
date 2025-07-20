'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Download, Share2, History, Upload, User, LogOut, Globe, Play, Pause } from 'lucide-react';
import PodcastGenerator from '@/components/PodcastGenerator';
import VoiceSelector from '@/components/VoiceSelector';
import FileUpload from '@/components/FileUpload';
import HistoryPanel from '@/components/HistoryPanel';
import EmailLogin from '@/components/EmailLogin';

export default function Home() {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedVoice, setSelectedVoice] = useState('young-lady');
  const [selectedLanguage, setSelectedLanguage] = useState('cantonese');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const languages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '普通话', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  const voices = [
    { id: 'young-lady', name: '靓女', description: '年轻女性声音' },
    { id: 'young-man', name: '靓仔', description: '年轻男性声音' },
    { id: 'elderly-woman', name: '阿嫲', description: '年长女性声音' },
  ];

  const handleLogin = (token: string, email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setShowLogin(false);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setShowLogin(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      alert('请输入要转换的文本');
      return;
    }
    
    setIsGenerating(true);
    // TODO: 调用API生成播客
    setTimeout(() => {
      setIsGenerating(false);
      alert('播客生成完成！');
    }, 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const email = localStorage.getItem('user_email');
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <EmailLogin onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">龙</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">龙眼AI</h1>
                <p className="text-sm text-gray-600">智能粤语播客生成平台</p>
              </div>
            </div>
            
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
                  生成播客
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'history'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  历史记录
                </button>
              </nav>

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
                    <span>退出</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                欢迎使用龙眼AI
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                请先登录以开始使用粤语播客生成功能
              </p>
              <button
                onClick={() => setShowLogin(true)}
                className="btn-primary text-lg px-8 py-3"
              >
                立即登录
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {activeTab === 'generate' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Hero Section */}
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    用AI生成地道嘅粤语播客
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    选择你嘅播客主持人，输入内容，一键生成专业级嘅粤语播客
                  </p>
                </div>

                {/* Language and Voice Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Language Selection */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="w-5 h-5 text-primary-500" />
                      <h3 className="text-lg font-semibold text-gray-900">选择语言</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {languages.map((language) => (
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

                  {/* Voice Selection */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Mic className="w-5 h-5 text-primary-500" />
                      <h3 className="text-lg font-semibold text-gray-900">选择声音</h3>
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

                {/* Text Input Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">输入要转换的文本</h3>
                    <p className="text-sm text-gray-600">支持中文、英文等多种语言</p>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="请输入要转换为播客的文本内容..."
                      className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        字符数: {inputText.length}
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !inputText.trim()}
                        className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>生成中...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>生成播客</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">或者上传文件</h3>
                    <p className="text-sm text-gray-600">支持TXT、DOC、PDF等格式</p>
                  </div>
                  <FileUpload />
                </div>
              </motion.div>
            ) : (
              <HistoryPanel />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 龙眼AI. 保留所有权利.</p>
            <p className="mt-2">让AI讲好你嘅粤语故事</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 