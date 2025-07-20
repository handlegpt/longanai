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
    generatePodcast: '制作播客',
    history: '历史',
    login: '登入',
    logout: '登出',
    
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
    youngLady: 'Mia',
    youngLadyDesc: '年轻女性声音 - 温柔甜美',
    youngMan: 'Mars',
    youngManDesc: '年轻男性声音 - 活力四射',
    elderlyWoman: 'David',
    elderlyWomanDesc: '成熟男性声音 - 稳重专业',
    
    // Text input
    inputTitle: '输入要转换嘅文本',
    inputSubtitle: '支持中文、英文等多种语言',
    inputPlaceholder: '请输入要转换为播客嘅文本内容...',
    characterCount: '字符数',
    generating: '生成中...',
    
    // File upload
    uploadTitle: '或者上传文件',
    uploadSubtitle: '支持TXT、DOC、PDF等格式',
    
    // FileUpload component translations
    fileUploadTitle: '文件上传生成',
    dragText: '拖拽文件到呢度，或者点击选择',
    dragActiveText: '放开文件以上传',
    formatText: '支持 TXT, PDF, DOC, DOCX 格式，最大 10MB',
    uploadedFiles: '已上传文件',
    generateFromFiles: '从文件生成播客',
    uploadSuccess: '成功上传 {count} 个文件',
    uploadError: '上传失败',
    fileTooLarge: '文件太大',
    unsupportedFormat: '格式不支持',
    noFilesUploaded: '请先上传文件',
    generatingFromFiles: '正在从文件生成播客...',
    
    // Podcast player
    podcastGenerated: '播客生成完成！',
    playPodcast: '播放播客',
    downloadPodcast: '下载播客',
    sharePodcast: '分享播客',
    podcastTitle: '生成嘅播客',
    
    // Footer
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你嘅粤语故事',
    
    // Welcome message
    welcomeTitle: '欢迎使用龙眼AI',
    welcomeSubtitle: '请先登录以开始使用粤语播客生成功能',
    loginNow: '立即登录',
    
    // EmailLogin component translations
    loginTitle: '邮箱登录',
    verificationTitle: '验证邮箱',
    loginSubtitle: '输入你嘅邮箱地址开始使用',
    verificationSubtitle: '请检查邮箱并点击验证链接',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'example@gmail.com',
    loginButton: '登录',
    loginLoading: '登录中...',
    orText: '或者',
    sendVerificationButton: '发送验证邮件',
    sendLoading: '发送中...',
    verificationSentTitle: '验证邮件已发送',
    verificationSentSubtitle: '我们已向 {email} 发送验证邮件',
    nextStepsTitle: '下一步',
    step1: '检查你嘅邮箱收件箱',
    step2: '点击验证链接',
    step3: '返回呢度继续使用',
    backToLogin: '返回登录',
    resendButton: '重新发送验证邮件',
    resendLoading: '发送中...',
    termsText: '使用邮箱登录即表示你同意我们嘅',
    termsLink: '服务条款',
    privacyLink: '隐私政策',
    emailRequired: '请输入邮箱地址',
    invalidEmail: '请输入有效嘅邮箱地址',
    verificationSent: '验证邮件已发送，请检查你嘅邮箱！',
    sendFailed: '发送失败',
    networkError: '网络错误，请重试',
    loginSuccess: '登录成功！',
    loginFailed: '登录失败',
    
    // HistoryPanel component translations
    historyTitle: '历史记录',
    totalPodcasts: '共 {count} 个播客',
    historyLoading: '加载中...',
    noHistory: '暂无历史记录',
    noHistorySubtitle: '生成嘅播客会显示喺呢度',
    host: '主持人',
    duration: '时长',
    created: '创建',
    play: '播放',
    download: '下载',
    share: '分享',
    delete: '删除',
    playSuccess: '开始播放',
    downloadSuccess: '开始下载',
    shareSuccess: '分享成功',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    historyNetworkError: '网络错误',
    shareText: '我用龙眼AI生成嘅粤语播客',
    shareTitle: '龙眼AI播客',
    linkCopied: '链接已复制到剪贴板',
    
    // VoiceSelector component translations
    voiceSelectorTitle: '选择播客主持人',
    youngLadyName: '靓女',
    youngLadyDesc: '温柔亲切，适合生活分享同情感内容',
    youngManName: '靓仔',
    youngManDesc: '活力四射，适合娱乐节目同新闻播报',
    grandmaName: '阿嫲',
    grandmaDesc: '慈祥温暖，适合故事讲述同传统文化',
    
    // PodcastGenerator component translations
    podcastGeneratorTitle: '播客内容生成',
    contentLabel: '播客内容',
    contentPlaceholder: '输入你嘅播客内容...',
    emotionLabel: '情感强度',
    speedLabel: '播放速度',
    normal: '正常',
    happy: '开心',
    sad: '悲伤',
    excited: '兴奋',
    calm: '平静',
    generateButton: '生成播客',
    generating: '生成中...',
    generateSuccess: '播客生成成功！',
    generateFailed: '生成失败，请重试',
    podcastNetworkError: '网络错误，请重试',
    contentRequired: '请输入播客内容',
    generatedResult: '生成结果',
    download: '下载',
    share: '分享',
    shareTitle: '龙眼AI播客',
    shareText: '我用龙眼AI生成嘅粤语播客',
    linkCopied: '链接已复制到剪贴板'
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
    
    // Text input
    inputTitle: '输入要转换的文本',
    inputSubtitle: '支持中文、英文等多种语言',
    inputPlaceholder: '请输入要转换为播客的文本内容...',
    characterCount: '字符数',
    generating: '生成中...',
    
    // File upload
    uploadTitle: '或者上传文件',
    uploadSubtitle: '支持TXT、DOC、PDF等格式',
    
    // FileUpload component translations
    fileUploadTitle: '文件上传生成',
    dragText: '拖拽文件到呢度，或者点击选择',
    dragActiveText: '放开文件以上传',
    formatText: '支持 TXT, PDF, DOC, DOCX 格式，最大 10MB',
    uploadedFiles: '已上传文件',
    generateFromFiles: '从文件生成播客',
    uploadSuccess: '成功上传 {count} 个文件',
    uploadError: '上传失败',
    fileTooLarge: '文件太大',
    unsupportedFormat: '格式不支持',
    noFilesUploaded: '请先上传文件',
    generatingFromFiles: '正在从文件生成播客...',
    
    // Podcast player
    podcastGenerated: '播客生成完成！',
    playPodcast: '播放播客',
    downloadPodcast: '下载播客',
    sharePodcast: '分享播客',
    podcastTitle: '生成的播客',
    
    // Footer
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    slogan: '让AI讲好你的粤语故事',
    
    // Welcome message
    welcomeTitle: '欢迎使用龙眼AI',
    welcomeSubtitle: '请先登录以开始使用粤语播客生成功能',
    loginNow: '立即登录',
    
    // EmailLogin component translations
    loginTitle: '邮箱登录',
    verificationTitle: '验证邮箱',
    loginSubtitle: '输入你嘅邮箱地址开始使用',
    verificationSubtitle: '请检查邮箱并点击验证链接',
    emailLabel: '邮箱地址',
    emailPlaceholder: 'example@gmail.com',
    loginButton: '登录',
    loginLoading: '登录中...',
    orText: '或者',
    sendVerificationButton: '发送验证邮件',
    sendLoading: '发送中...',
    verificationSentTitle: '验证邮件已发送',
    verificationSentSubtitle: '我们已向 {email} 发送验证邮件',
    nextStepsTitle: '下一步',
    step1: '检查你嘅邮箱收件箱',
    step2: '点击验证链接',
    step3: '返回呢度继续使用',
    backToLogin: '返回登录',
    resendButton: '重新发送验证邮件',
    resendLoading: '发送中...',
    termsText: '使用邮箱登录即表示你同意我们嘅',
    termsLink: '服务条款',
    privacyLink: '隐私政策',
    emailRequired: '请输入邮箱地址',
    invalidEmail: '请输入有效嘅邮箱地址',
    verificationSent: '验证邮件已发送，请检查你嘅邮箱！',
    sendFailed: '发送失败',
    networkError: '网络错误，请重试',
    loginSuccess: '登录成功！',
    loginFailed: '登录失败',
    
    // HistoryPanel component translations
    historyTitle: '历史记录',
    totalPodcasts: '共 {count} 个播客',
    historyLoading: '加载中...',
    noHistory: '暂无历史记录',
    noHistorySubtitle: '生成嘅播客会显示喺呢度',
    host: '主持人',
    duration: '时长',
    created: '创建',
    play: '播放',
    download: '下载',
    share: '分享',
    delete: '删除',
    playSuccess: '开始播放',
    downloadSuccess: '开始下载',
    shareSuccess: '分享成功',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    historyNetworkError: '网络错误',
    shareText: '我用龙眼AI生成嘅粤语播客',
    shareTitle: '龙眼AI播客',
    linkCopied: '链接已复制到剪贴板',
    
    // VoiceSelector component translations
    voiceSelectorTitle: '选择播客主持人',
    youngLadyName: '靓女',
    youngLadyDesc: '年轻女性声音 - 温柔甜美',
    youngManName: '靓仔',
    youngManDesc: '年轻男性声音 - 活力四射',
    grandmaName: '阿嫲',
    grandmaDesc: '成熟男性声音 - 稳重专业',
    
    // PodcastGenerator component translations
    podcastGeneratorTitle: '播客内容生成',
    contentLabel: '播客内容',
    contentPlaceholder: '输入你嘅播客内容...',
    emotionLabel: '情感强度',
    speedLabel: '播放速度',
    normal: '正常',
    happy: '开心',
    sad: '悲伤',
    excited: '兴奋',
    calm: '平静',
    generateButton: '生成播客',
    generating: '生成中...',
    generateSuccess: '播客生成成功！',
    generateFailed: '生成失败，请重试',
    podcastNetworkError: '网络错误，请重试',
    contentRequired: '请输入播客内容',
    generatedResult: '生成结果',
    download: '下载',
    share: '分享',
    shareTitle: '龙眼AI播客',
    shareText: '我用龙眼AI生成嘅粤语播客',
    linkCopied: '链接已复制到剪贴板'
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
    youngLady: 'Mia',
    youngLadyDesc: 'Young female voice - Soft and sweet',
    youngMan: 'Mars',
    youngManDesc: 'Young male voice - Full of energy',
    elderlyWoman: 'David',
    elderlyWomanDesc: 'Mature male voice - Steady and professional',
    
    // Text input
    inputTitle: 'Enter Text to Convert',
    inputSubtitle: 'Supports Chinese, English and other languages',
    inputPlaceholder: 'Enter text content to convert to podcast...',
    characterCount: 'Characters',
    generating: 'Generating...',
    
    // File upload
    uploadTitle: 'Or Upload File',
    uploadSubtitle: 'Supports TXT, DOC, PDF and other formats',
    
    // FileUpload component translations
    fileUploadTitle: 'File Upload Generation',
    dragText: 'Drag and drop files here, or click to select',
    dragActiveText: 'Release to upload',
    formatText: 'Supports TXT, PDF, DOC, DOCX formats, max 10MB',
    uploadedFiles: 'Uploaded Files',
    generateFromFiles: 'Generate Podcast from Files',
    uploadSuccess: 'Successfully uploaded {count} files',
    uploadError: 'Upload failed',
    fileTooLarge: 'File too large',
    unsupportedFormat: 'Unsupported format',
    noFilesUploaded: 'Please upload files first',
    generatingFromFiles: 'Generating podcast from files...',
    
    // Podcast player
    podcastGenerated: 'Podcast generated!',
    playPodcast: 'Play Podcast',
    downloadPodcast: 'Download Podcast',
    sharePodcast: 'Share Podcast',
    podcastTitle: 'Generated Podcast',
    
    // Footer
    copyright: '© 2025 Longan AI. All rights reserved.',
    slogan: 'Let AI tell your Cantonese stories well',
    
    // Welcome message
    welcomeTitle: 'Welcome to Longan AI',
    welcomeSubtitle: 'Please login to start using Cantonese podcast generation features',
    loginNow: 'Login Now',
    
    // EmailLogin component translations
    loginTitle: 'Email Login',
    verificationTitle: 'Verify Email',
    loginSubtitle: 'Enter your email address to start using',
    verificationSubtitle: 'Please check your email and click the verification link',
    emailLabel: 'Email Address',
    emailPlaceholder: 'example@gmail.com',
    loginButton: 'Login',
    loginLoading: 'Logging in...',
    orText: 'Or',
    sendVerificationButton: 'Send Verification Email',
    sendLoading: 'Sending...',
    verificationSentTitle: 'Verification Email Sent',
    verificationSentSubtitle: 'We have sent a verification email to {email}',
    nextStepsTitle: 'Next Steps',
    step1: 'Check your email inbox',
    step2: 'Click the verification link',
    step3: 'Return here to continue using',
    backToLogin: 'Back to Login',
    resendButton: 'Resend Verification Email',
    resendLoading: 'Sending...',
    termsText: 'By using email login, you agree to our',
    termsLink: 'Terms of Service',
    privacyLink: 'Privacy Policy',
    emailRequired: 'Please enter an email address',
    invalidEmail: 'Please enter a valid email address',
    verificationSent: 'Verification email sent, please check your inbox!',
    sendFailed: 'Send failed',
    networkError: 'Network error, please try again',
    loginSuccess: 'Login successful!',
    loginFailed: 'Login failed',
    
    // HistoryPanel component translations
    historyTitle: 'History',
    totalPodcasts: 'Total {count} podcasts',
    historyLoading: 'Loading...',
    noHistory: 'No history yet',
    noHistorySubtitle: 'Generated podcasts will appear here',
    host: 'Host',
    duration: 'Duration',
    created: 'Created',
    play: 'Play',
    download: 'Download',
    share: 'Share',
    delete: 'Delete',
    playSuccess: 'Playing...',
    downloadSuccess: 'Downloading...',
    shareSuccess: 'Shared successfully',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed',
    historyNetworkError: 'Network error',
    shareText: 'I generated a Cantonese podcast with Longan AI',
    shareTitle: 'Longan AI Podcast',
    linkCopied: 'Link copied to clipboard',
    
    // VoiceSelector component translations
    voiceSelectorTitle: 'Choose Podcast Host',
    youngLadyName: 'Young Lady',
    youngLadyDesc: 'Gentle and warm, suitable for life sharing and emotional content',
    youngManName: 'Young Man',
    youngManDesc: 'Full of energy, suitable for entertainment programs and news broadcasts',
    grandmaName: 'Grandma',
    grandmaDesc: 'Warm and gentle, suitable for story-telling and traditional culture',
    
    // PodcastGenerator component translations
    podcastGeneratorTitle: 'Podcast Content Generation',
    contentLabel: 'Podcast Content',
    contentPlaceholder: 'Enter your podcast content...',
    emotionLabel: 'Emotion Intensity',
    speedLabel: 'Playback Speed',
    normal: 'Normal',
    happy: 'Happy',
    sad: 'Sad',
    excited: 'Excited',
    calm: 'Calm',
    generateButton: 'Generate Podcast',
    generating: 'Generating...',
    generateSuccess: 'Podcast generated successfully!',
    generateFailed: 'Generation failed, please try again',
    podcastNetworkError: 'Network error, please try again',
    contentRequired: 'Please enter podcast content',
    generatedResult: 'Generated Result',
    download: 'Download',
    share: 'Share',
    shareTitle: 'Longan AI Podcast',
    shareText: 'I generated a Cantonese podcast with Longan AI',
    linkCopied: 'Link copied to clipboard'
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
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<{ audioUrl: string; title: string } | null>(null);

  // Website interface language options
  const interfaceLanguages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '广东话', flag: '🇨🇳' },
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
      // Simulate generated podcast
      setGeneratedPodcast({
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio
        title: `播客 - ${new Date().toLocaleString()}`
      });
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

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.language-dropdown')) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  // Show login modal if login is requested
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <EmailLogin 
          onLogin={handleLogin}
          translations={{
            loginTitle: t.loginTitle,
            verificationTitle: t.verificationTitle,
            loginSubtitle: t.loginSubtitle,
            verificationSubtitle: t.verificationSubtitle,
            emailLabel: t.emailLabel,
            emailPlaceholder: t.emailPlaceholder,
            loginButton: t.loginButton,
            loginLoading: t.loginLoading,
            orText: t.orText,
            sendVerificationButton: t.sendVerificationButton,
            sendLoading: t.sendLoading,
            verificationSentTitle: t.verificationSentTitle,
            verificationSentSubtitle: t.verificationSentSubtitle,
            nextStepsTitle: t.nextStepsTitle,
            step1: t.step1,
            step2: t.step2,
            step3: t.step3,
            backToLogin: t.backToLogin,
            resendButton: t.resendButton,
            resendLoading: t.resendLoading,
            termsText: t.termsText,
            termsLink: t.termsLink,
            privacyLink: t.privacyLink,
            emailRequired: t.emailRequired,
            invalidEmail: t.invalidEmail,
            verificationSent: t.verificationSent,
            sendFailed: t.sendFailed,
            networkError: t.networkError,
            loginSuccess: t.loginSuccess,
            loginFailed: t.loginFailed,
          }}
        />
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
                <span className="text-white font-bold text-xs">longan</span>
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

              {/* Language selector */}
              <div className="relative language-dropdown">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <span className="text-lg">
                    {interfaceLanguages.find(lang => lang.id === selectedLanguage)?.flag}
                  </span>
                  <span className="text-xs">
                    {interfaceLanguages.find(lang => lang.id === selectedLanguage)?.name}
                  </span>
                </button>
                
                {/* Language dropdown menu */}
                {showLanguageDropdown && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-32">
                    {interfaceLanguages.map((language) => (
                      <button
                        key={language.id}
                        onClick={() => {
                          setSelectedLanguage(language.id);
                          setShowLanguageDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          selectedLanguage === language.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                <div className="flex items-center space-x-4">
                  {/* Voice selection - compact version */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">选择音色:</span>
                    <div className="flex space-x-2">
                      {voices.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => setSelectedVoice(voice.id)}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedVoice === voice.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {voice.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    {t.characterCount}: {inputText.length}
                  </div>
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
            <FileUpload 
              translations={{
                title: t.fileUploadTitle,
                dragText: t.dragText,
                dragActiveText: t.dragActiveText,
                formatText: t.formatText,
                uploadedFiles: t.uploadedFiles,
                generateFromFiles: t.generateFromFiles,
                uploadSuccess: t.uploadSuccess,
                uploadError: t.uploadError,
                fileTooLarge: t.fileTooLarge,
                unsupportedFormat: t.unsupportedFormat,
                noFilesUploaded: t.noFilesUploaded,
                generatingFromFiles: t.generatingFromFiles,
              }}
            />
          </div>

          {/* Generated podcast player */}
          {generatedPodcast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 mt-8"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.podcastTitle}</h3>
                <p className="text-sm text-gray-600">{generatedPodcast.title}</p>
              </div>
              
              <div className="space-y-4">
                {/* Audio player */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <audio
                    controls
                    className="w-full"
                    src={generatedPodcast.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center space-x-4">
                  <button className="btn-primary flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>{t.playPodcast}</span>
                  </button>
                  
                  <button className="btn-secondary flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>{t.downloadPodcast}</span>
                  </button>
                  
                  <button className="btn-secondary flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>{t.sharePodcast}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
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