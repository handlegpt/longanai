'use client';

// Polyfill for crypto.randomUUID
if (typeof window !== "undefined") {
  if (window.crypto && typeof window.crypto.randomUUID !== "function") {
    window.crypto.randomUUID = function() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }) as `${string}-${string}-${string}-${string}-${string}`;
    };
  }
  if (!window.crypto) {
    (window as any).crypto = {
      randomUUID: function() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === "x" ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }) as `${string}-${string}-${string}-${string}-${string}`;
      }
    };
  }
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Mic, Download, Share2, History, Upload, User, LogOut, Globe, Play, Pause, Trash2, Lock } from 'lucide-react';
import PodcastGenerator from '@/components/PodcastGenerator';
import VoiceSelector from '@/components/VoiceSelector';
import FileUpload from '@/components/FileUpload';
import HistoryPanel from '@/components/HistoryPanel';
import EmailLogin from '@/components/EmailLogin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

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
    heroTag: 'AI驱动的粤语播客生成',
    heroTitle: '用AI生成地道嘅粤语播客',
    heroSubtitle: '选择你嘅播客主持人，输入内容，一键生成专业级嘅粤语播客',
    
    // Language selection
    selectLanguage: '输入语言',
    selectLanguageHint: '请选择你输入的内容是粤语还是普通话',
    cantoneseLang: '粤语',
    guangdonghuaLang: '广东话',
    mandarinLang: '普通话',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: '选择声音',
    
    // Text input
    inputTitle: '输入要转换嘅文本',
    inputSubtitle: '支持中文、英文等多种语言',
    inputPlaceholder: '请输入要转换为播客嘅文本内容...',
    characterCount: '字符数',
    generating: '生成紧...',
    
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
    slogan: '让AI讲好你嘅粤语故事，让粤语传承下去',
    
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
    generateSuccess: '播客生成成功！',
    generateFailed: '生成失败，请重试',
    podcastNetworkError: '网络错误，请重试',
    contentRequired: '请输入播客内容',
    generatedResult: '生成结果',
    
    // Feature highlights
    feature1Title: '智能语音合成',
    feature1Desc: '用先进嘅Edge TTS技术，生成自然流畅嘅粤语语音，等每个字都充满情感',
    feature2Title: '多种音色选择',
    feature2Desc: '靓女、靓仔两种唔同风格嘅播客主持人，满足唔同内容需求',
    feature3Title: '一键生成下载',
    feature3Desc: '输入文本，选择音色，一键生成并下载播客音频，简单高效',
    
    // Buy Me a Coffee section
    supportTitle: '请我饮一杯咖啡，支持我哋继续搞落去！',
    supportDesc: '',
    buyMeCoffee: 'Buy Me a Coffee',
    uploadFile: '上传文件',
    
    // Additional UI elements
    selectVoiceLabel: '选择音色:',
    generatedPodcastLabel: '生成嘅播客',
    clickToPlayText: '点击播放按钮开始收听',
    durationLabel: '时长',
    
    // Latest podcasts section
    latestPodcastsTitle: '最新播客',
    latestPodcastsSubtitle: '全站用户最近生成嘅公开播客',
    viewMore: '查看更多',
    noPublicPodcasts: '暂无公开播客',
    loadingPodcasts: '加载中...',
    byUser: 'by',
    
    // User stats and system status
    remainingGenerations: '剩余 {count} 次生成',
    unlimitedGenerations: '无限制生成',
    systemLoad: '系统负载',
    
    // UI elements
    addCover: '添加封面',
    home: '首页',
    explore: '播客广场',
    pricing: '定价',
    quickLinks: '快速链接',
    legalInfo: '法律信息',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    contactUs: '联系我们',
    createButton: '創作',
    slogans: [
      "揀主持人、輸入內容，一鍵生成粵語播客",
      "释放你嘅创意，让AI为你讲述精彩嘅粤语故事",
      "克隆你嘅声音，打造专属嘅个人品牌播客",
      "用AI技术，让每个字都充满情感同温度",
      "从文字到声音，让粤语文化传承下去"
    ],
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
    heroTag: 'AI驱动的粤语播客生成',
    heroTitle: '用AI生成地道的粤语播客',
    heroSubtitle: '选择你的播客主持人，输入内容，一键生成专业级的粤语播客',
    
    // Language selection
    selectLanguage: '输入語言',
    selectLanguageHint: '請選擇你輸入的內容是粵語還是普通話',
    cantoneseLang: '粤语',
    guangdonghuaLang: '广东话',
    mandarinLang: '普通话',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: '选择声音',
    
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
    dragText: '拖拽文件到这里，或者点击选择',
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
    step3: '返回这里继续使用',
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
    generateSuccess: '播客生成成功！',
    generateFailed: '生成失败，请重试',
    podcastNetworkError: '网络错误，请重试',
    contentRequired: '请输入播客内容',
    generatedResult: '生成结果',
    
    // Feature highlights
    feature1Title: '智能语音合成',
    feature1Desc: '使用先进的Edge TTS技术，生成自然流畅的粤语语音，让每个字都充满情感',
    feature2Title: '多种音色选择',
    feature2Desc: '靓女、靓仔两种不同风格的播客主持人，满足不同内容需求',
    feature3Title: '一键生成下载',
    feature3Desc: '输入文本，选择音色，一键生成并下载播客音频，简单高效',
    
    // Buy Me a Coffee section
    supportTitle: '请我喝一杯咖啡，支持我们继续开发！',
    supportDesc: '',
    buyMeCoffee: 'Buy Me a Coffee',
    uploadFile: '上传文件',
    
    // Additional UI elements
    selectVoiceLabel: '选择音色:',
    generatedPodcastLabel: '生成的播客',
    clickToPlayText: '点击播放按钮开始收听',
    durationLabel: '时长',
    
    // Latest podcasts section
    latestPodcastsTitle: '最新播客',
    latestPodcastsSubtitle: '全站用户最近生成的公开播客',
    viewMore: '查看更多',
    noPublicPodcasts: '暂无公开播客',
    loadingPodcasts: '加载中...',
    byUser: 'by',
    
    // User stats and system status
    remainingGenerations: '剩余 {count} 次生成',
    unlimitedGenerations: '无限制生成',
    systemLoad: '系统负载',
    
    // UI elements
    addCover: '添加封面',
    home: '首页',
    explore: '播客广场',
    pricing: '定价',
    quickLinks: '快速链接',
    legalInfo: '法律信息',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    contactUs: '联系我们',
    createButton: '创作',
    slogans: [
      "选择主持人，输入内容，一键生成粤语播客",
      "释放你的创意，让AI为你讲述精彩的粤语故事",
      "克隆你的声音，打造专属的个人品牌播客",
      "用AI技术，让每个字都充满情感和温度",
      "从文字到声音，让粤语文化传承下去"
    ],
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
    heroTag: 'AI-powered Cantonese Podcast Generation',
    heroTitle: 'Generate Authentic Cantonese Podcasts with AI',
    heroSubtitle: 'Choose your podcast host, input content, and generate professional Cantonese podcasts with one click',
    
    // Language selection
    selectLanguage: 'Input Language',
    selectLanguageHint: 'Please select whether your input is Cantonese or Mandarin',
    cantoneseLang: 'Cantonese',
    guangdonghuaLang: 'Guangdong Dialect',
    mandarinLang: 'Mandarin',
    englishLang: 'English',
    
    // Voice selection
    selectVoice: 'Select Voice',
    
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
    generateSuccess: 'Podcast generated successfully!',
    generateFailed: 'Generation failed, please try again',
    podcastNetworkError: 'Network error, please try again',
    contentRequired: 'Please enter podcast content',
    generatedResult: 'Generated Result',
    
    // Feature highlights
    feature1Title: 'Intelligent Voice Synthesis',
    feature1Desc: 'Using advanced Edge TTS technology to generate natural and fluent Cantonese speech with emotional depth',
    feature2Title: 'Multiple Voice Options',
    feature2Desc: 'Two different podcast hosts - Young Lady and Young Man - to meet various content needs',
    feature3Title: 'One-Click Generation & Download',
    feature3Desc: 'Input text, select voice, and generate and download podcast audio with one click - simple and efficient',
    
    // Buy Me a Coffee section
    supportTitle: 'Buy me a coffee to support our development!',
    supportDesc: '',
    buyMeCoffee: 'Buy Me a Coffee',
    uploadFile: 'Upload File',
    
    // Additional UI elements
    selectVoiceLabel: 'Choose Voice',
    generatedPodcastLabel: 'Generated Podcast',
    clickToPlayText: 'Click the play button to start listening',
    durationLabel: 'Duration',
    
    // Latest podcasts section
    latestPodcastsTitle: 'Latest Podcasts',
    latestPodcastsSubtitle: 'Recently generated public podcasts from all users',
    viewMore: 'View More',
    noPublicPodcasts: 'No public podcasts yet',
    loadingPodcasts: 'Loading...',
    byUser: 'by',
    
    // User stats and system status
    remainingGenerations: 'Remaining {count} generations',
    unlimitedGenerations: 'Unlimited generations',
    systemLoad: 'System Load',
    
    // UI elements
    addCover: 'Add Cover',
    home: 'Home',
    explore: 'Explore',
    pricing: 'Pricing',
    quickLinks: 'Quick Links',
    legalInfo: 'Legal Info',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contactUs: 'Contact Us',
    createButton: 'Create',
    slogans: [
      "Choose a host, input content, generate a Cantonese podcast with one click",
      "Unleash your creativity, let AI tell wonderful Cantonese stories",
      "Clone your voice, build your personal brand podcast",
      "With AI, every word is full of emotion and warmth",
      "From text to sound, let Cantonese culture live on"
    ],
  }
};

export default function Home() {
  const { language } = useLanguage();
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
  const [generatedPodcast, setGeneratedPodcast] = useState<{ audioUrl: string; title: string; duration?: string; image?: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);
  const [podcastHistory, setPodcastHistory] = useState<Array<{ id: string; audioUrl: string; title: string; duration?: string; createdAt: string; image?: string }>>([]);
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);
  const [podcastImage, setPodcastImage] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<{
    subscription_plan: string;
    monthly_generation_count: number;
    monthly_generation_limit: number;
    remaining_generations: number;
    is_unlimited: boolean;
  } | null>(null);
  const [publicPodcasts, setPublicPodcasts] = useState<Array<{ id: number; audioUrl: string; title: string; duration?: string; createdAt: string; image?: string; coverImageUrl?: string; description?: string; userEmail?: string; tags?: string }>>([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    max_concurrent_generations: number;
    current_active_generations: number;
    available_slots: number;
    thread_pool_workers: number;
    system_health: string;
  } | null>(null);
  const t = translations[language as keyof typeof translations] || translations.cantonese;

  // slogans 多语言化
  const slogans = t.slogans;
  const [currentSloganIndex, setCurrentSloganIndex] = useState(0);

  // 轮播标语效果
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 3000); // 每3秒切换一次

    return () => clearInterval(interval);
  }, [slogans.length]);

  // Website interface language options
  const interfaceLanguages = [
    { id: 'cantonese', name: '粤语', flag: '🇭🇰' },
    { id: 'mandarin', name: '简体中文', flag: '🇨🇳' },
    { id: 'english', name: 'English', flag: '🇺🇸' },
  ];

  // Voice options for podcast generation
  const voices = [
    { id: 'young-lady', name: '靓女', description: '年轻女性声音' },
    { id: 'young-man', name: '靓仔', description: '年轻男性声音' },
  ];

  // Get current translation based on selected interface language
  // const t = translations[language as keyof typeof translations] || translations.cantonese;

  // 根据语言获取网站名称
  const getWebsiteName = () => {
    switch (language) {
      case 'english':
        return 'Longan AI';
      default:
        return '龍眼AI';
    }
  };

  // Load podcast history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('podcast_history');
    if (savedHistory) {
      setPodcastHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 拉取全站公开播客
  useEffect(() => {
    setLoadingPublic(true);
    fetch('/api/podcast/public?page=1&size=6')
      .then(res => res.json())
      .then(data => {
        setPublicPodcasts(data.podcasts || []);
      })
      .catch(() => setPublicPodcasts([]))
      .finally(() => setLoadingPublic(false));
  }, []);

  // 拉取系统状态
  useEffect(() => {
    fetch('/api/podcast/system/status')
      .then(res => res.json())
      .then(data => {
        setSystemStatus(data);
      })
      .catch(() => {
        console.log('无法获取系统状态');
      });
  }, []);

  // Generate title from content
  const generateTitleFromContent = (content: string) => {
    // Remove special characters and get first meaningful sentence or phrase
    const cleanContent = content.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '').trim();
    
    // Try to find the first sentence (ending with 。！？.!?)
    const sentenceMatch = cleanContent.match(/^[^。！？.!?]+[。！？.!?]/);
    if (sentenceMatch) {
      const sentence = sentenceMatch[0].replace(/[。！？.!?]$/, '');
      return sentence.length > 50 ? sentence.substring(0, 50) + '...' : sentence;
    }
    
    // If no sentence found, take first 30-50 characters
    const title = cleanContent.length > 50 ? cleanContent.substring(0, 50) + '...' : cleanContent;
    return title || '我的播客';
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPodcastImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save podcast to history
  const savePodcastToHistory = (podcast: { audioUrl: string; title: string; duration?: string; image?: string }) => {
    const newPodcast = {
      id: Date.now().toString(),
      ...podcast,
      createdAt: new Date().toISOString()
    };
    
    const updatedHistory = [newPodcast, ...podcastHistory];
    setPodcastHistory(updatedHistory);
    localStorage.setItem('podcast_history', JSON.stringify(updatedHistory));
  };

  // Get displayed podcasts (latest 6 or all)
  const displayedPodcasts = showAllPodcasts ? podcastHistory : podcastHistory.slice(0, 6);

  // Handle audio play
  const handlePlayAudio = () => {
    if (audioRef) {
      audioRef.play();
    }
  };

  // Handle audio download
  const handleDownloadAudio = () => {
    if (generatedPodcast) {
      const link = document.createElement('a');
      link.href = generatedPodcast.audioUrl;
      link.download = `${generatedPodcast.title || 'podcast'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle audio share
  const handleShareAudio = async () => {
    if (generatedPodcast) {
      try {
        // Check if Web Share API is available and supported
        if (navigator.share && navigator.canShare) {
          const shareData = {
            title: t.shareTitle || '龙眼AI播客',
            text: t.shareText || '我用龙眼AI生成的粤语播客',
            url: window.location.href,
          };
          
          // Check if the data can be shared
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            console.log('分享成功');
          } else {
            throw new Error('分享数据不被支持');
          }
        } else {
          // Fallback: copy URL to clipboard
          try {
            await navigator.clipboard.writeText(window.location.href);
            alert(t.linkCopied || '链接已复制到剪贴板');
            console.log('链接已复制到剪贴板');
          } catch (clipboardError) {
            // If clipboard API fails, show the URL in an alert
            alert(`分享链接: ${window.location.href}`);
            console.log('显示分享链接');
          }
        }
      } catch (error) {
        console.error('分享失败:', error);
        
        // Show user-friendly error message
        if (error instanceof Error && error.message.includes('分享数据不被支持')) {
          alert('当前浏览器不支持分享功能，已复制链接到剪贴板');
        } else if (error instanceof Error && error.name === 'AbortError') {
          // User cancelled the share
          console.log('用户取消了分享');
        } else {
          alert('分享失败，请手动复制链接');
        }
      }
    } else {
      alert('没有可分享的播客');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: any) => {
    const files = event.target.files;
    if (!files) return;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ['.txt', '.doc', '.docx', '.pdf', '.md'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (validTypes.indexOf(fileExtension) !== -1 && file.size <= 10 * 1024 * 1024) {
        setUploadedFiles(prev => [...prev, file]);
        
        // Read file content and add to text input
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setInputText(prev => prev + (prev ? '\n\n' : '') + `[来自文件: ${file.name}]\n${content}`);
        };
        reader.readAsText(file);
      }
    }
  };

  // Handle user login
  const handleLogin = (token: string, email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setShowLogin(false);
    
    // 触发自定义事件通知导航栏更新
    window.dispatchEvent(new CustomEvent('userLogin', { 
      detail: { token, email } 
    }));
    
    // 获取用户统计信息
    fetchUserStats(email);
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
    // Check if user is logged in
    if (!isLoggedIn) {
      alert('请先登录后再生成播客');
      setShowLogin(true);
      return;
    }
    
    if (!inputText.trim()) {
      alert('请输入要转换的文本');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // First, translate Mandarin to Cantonese if needed
      let finalText = inputText;
      let isTranslated = false;
      if (selectedLanguage === 'mandarin') {
        try {
          const translationResponse = await fetch('/api/translate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: inputText,
              targetLanguage: 'cantonese'
            }),
          });
          
          if (translationResponse.ok) {
            const translationData = await translationResponse.json();
            finalText = translationData.translatedText;
            isTranslated = true;
          }
        } catch (error) {
          console.error('翻译失败，使用原文:', error);
        }
      }
      
      // Call real backend API to generate podcast
      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: finalText,
          voice: selectedVoice,
          emotion: 'normal',
          speed: 1.0,
          user_email: userEmail,  // 添加用户邮箱
          title: generateTitleFromContent(inputText),  // 传递生成的标题
          is_translated: isTranslated,  // 添加翻译状态
          language: selectedLanguage,  // 添加语言字段
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const generatedTitle = generateTitleFromContent(inputText);
        setGeneratedPodcast({
          audioUrl: data.audioUrl,
          title: generatedTitle,
          duration: data.duration || '00:00:00',
          image: podcastImage || undefined
        });
        savePodcastToHistory({
          audioUrl: data.audioUrl,
          title: generatedTitle,
          duration: data.duration || '00:00:00',
          image: podcastImage || undefined
        });
        // Reset image after saving
        setPodcastImage(null);
        
        // Show remaining generations if available
        if (data.remainingGenerations !== undefined) {
          if (data.remainingGenerations === -1) {
            console.log('企业版用户，无生成限制');
          } else {
            console.log(`剩余生成次数: ${data.remainingGenerations}`);
          }
        }
        
        // Refresh user stats after successful generation
        if (userEmail) {
          fetchUserStats(userEmail);
        }
      } else {
        const errorData = await response.json();
        let errorMessage = '生成失败';
        
        // 根据不同的错误状态码提供具体的错误信息
        switch (response.status) {
          case 400:
            errorMessage = `请求参数错误: ${errorData.detail || '请检查输入内容'}`;
            break;
          case 401:
            errorMessage = '登录已过期，请重新登录';
            setShowLogin(true);
            break;
          case 403:
            errorMessage = '权限不足，请先验证邮箱';
            break;
          case 404:
            errorMessage = '服务不可用，请稍后重试';
            break;
          case 429:
            errorMessage = `已达到本月生成限制 (${errorData.detail || '未知限制'})\n\n请考虑升级到专业版获得更多生成次数。`;
            break;
          case 500:
            errorMessage = '服务器内部错误，请稍后重试';
            break;
          case 503:
            errorMessage = '服务暂时不可用，请稍后重试';
            break;
          default:
            errorMessage = `生成失败: ${errorData.detail || '未知错误'}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('生成播客时出错:', error);
      
      // 根据错误类型提供更具体的错误信息
      let errorMessage = '网络错误，请重试';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = '网络连接失败，请检查网络连接后重试';
      } else if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请稍后重试';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到服务器，请检查网络连接';
        } else {
          errorMessage = `生成失败: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('user_email');
      if (token && email) {
        setIsLoggedIn(true);
        setUserEmail(email);
        // Fetch user stats
        fetchUserStats(email);
      }
    };

    // 初始检查
    checkLoginStatus();

    // 添加定期检查，确保状态同步
    const interval = setInterval(checkLoginStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle URL parameters for OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const email = urlParams.get('email');
    
    if (accessToken && email) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Set login state
      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('user_email', email);
      setIsLoggedIn(true);
      setUserEmail(email);
      
      // 触发自定义事件通知导航栏更新
      window.dispatchEvent(new CustomEvent('userLogin', { 
        detail: { token: accessToken, email } 
      }));
      
      // Fetch user stats
      fetchUserStats(email);
    }
  }, []);

  // Fetch user statistics
  const fetchUserStats = async (email: string) => {
    try {
      const response = await fetch(`/api/podcast/user/stats?user_email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const stats = await response.json();
        setUserStats(stats);
      }
    } catch (error) {
      console.error('获取用户统计失败:', error);
    }
  };

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
      {/* Main content area with improved design */}
      <main className="max-w-6xl mx-auto">
        {/* Show new interface regardless of login status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero section with main title */}
          <div className="text-center mb-8 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <span className="mr-2">🎙️</span>
                {t.heroTag}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 via-secondary-600 to-purple-600 bg-clip-text text-transparent">
                {t.heroTitle}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSloganIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.8 }}
                    className="inline-block"
                  >
                    {slogans[currentSloganIndex]}
                  </motion.span>
                </AnimatePresence>
              </p>
              
              {/* 移除标语指示器点点 */}
            </motion.div>
            
            {/* Text input section for podcast content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-6 sm:p-10 mb-6 sm:mb-10 border border-gray-100"
            >
              <div className="space-y-6 sm:space-y-8">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="输入你的播客内容..."
                    className="w-full h-32 sm:h-48 p-4 sm:p-8 border-2 border-gray-200 rounded-xl sm:rounded-2xl resize-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 text-base sm:text-lg leading-relaxed"
                  />
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center space-x-2 sm:space-x-4">
                    {/* Image upload button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md"
                        title="添加封面"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </label>
                    </div>
                    
                    {/* File upload button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".txt,.doc,.docx,.pdf,.md"
                        multiple
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg cursor-pointer hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
                        title="上传文件"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                    </div>
                    
                    {/* Character count */}
                    <div className={`text-xs sm:text-sm bg-white px-2 sm:px-3 py-1 rounded-full shadow-sm border ${
                      inputText.length > 9000 ? 'text-red-500 border-red-200' : 
                      inputText.length > 8000 ? 'text-orange-500 border-orange-200' : 
                      'text-gray-400 border-gray-200'
                    }`}>
                      {inputText.length} / 10000
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
                    {/* Input language selection */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🌐</span>
                        <span className="text-sm sm:text-lg font-semibold text-gray-700">{t.selectLanguage}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{t.selectLanguageHint}</div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={() => setSelectedLanguage('cantonese')}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 shadow-md ${
                            selectedLanguage === 'cantonese'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-lg'
                          }`}
                        >
                          {t.cantoneseLang}
                        </button>
                        <button
                          onClick={() => setSelectedLanguage('mandarin')}
                          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 shadow-md ${
                            selectedLanguage === 'mandarin'
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-lg'
                          }`}
                        >
                          {t.mandarinLang}
                        </button>
                      </div>
                    </div>
                    
                    {/* Voice selection - improved version */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🎭</span>
                        <span className="text-sm sm:text-lg font-semibold text-gray-700">{t.voiceSelectorTitle}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {voices.map((voice) => (
                          <button
                            key={voice.id}
                            onClick={() => setSelectedVoice(voice.id)}
                            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 shadow-md ${
                              selectedVoice === voice.id
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-lg'
                            }`}
                          >
                            {voice.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* User stats display */}
                    {isLoggedIn && userStats && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded-lg border border-green-200">
                        <span className="text-lg">📊</span>
                        <span>
                          {userStats.is_unlimited ? (
                            t.unlimitedGenerations
                          ) : (
                            t.remainingGenerations.replace('{count}', userStats.remaining_generations.toString())
                          )}
                        </span>
                      </div>
                    )}
                    
                    {/* System status display */}
                    {systemStatus && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 rounded-lg border border-blue-200">
                        <span className="text-lg">⚡</span>
                        <span>
                          {t.systemLoad}: {systemStatus.current_active_generations}/{systemStatus.max_concurrent_generations}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        setShowLogin(true);
                        return;
                      }
                      if (!inputText.trim()) {
                        alert('请输入要转换的文本');
                        return;
                      }
                      handleGenerate();
                    }}
                    disabled={isGenerating}
                    className="btn-primary flex items-center space-x-3 sm:space-x-4 px-6 sm:px-10 py-3 sm:py-5 text-base sm:text-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all duration-200 shadow-xl w-full sm:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                        <span>{t.generating}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>{t.createButton}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Generated podcast player with improved design */}
            {generatedPodcast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-6"
              >
                <div className="flex items-start space-x-4 mb-4">
                  {/* Podcast cover image */}
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {generatedPodcast.image ? (
                      <img 
                        src={generatedPodcast.image} 
                        alt="播客封面" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{generatedPodcast.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">刚刚生成</p>
                    <div className="text-sm text-gray-500">{t.durationLabel}: {generatedPodcast.duration || '00:00:00'}</div>
                  </div>
                </div>
                
                {/* Compact audio player */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <audio
                    ref={setAudioRef}
                    controls
                    className="w-full h-12 rounded-lg"
                    src={generatedPodcast.audioUrl}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
                
                {/* Action buttons in a more compact layout */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button 
                      onClick={handlePlayAudio}
                      className="p-2 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors"
                      title="播放"
                    >
                      <Play className="w-4 h-4 text-primary-600" />
                    </button>
                    
                    <button 
                      onClick={handleDownloadAudio}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="下载"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button 
                      onClick={handleShareAudio}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="分享"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      {/* 最新播客（全站公开） */}
      {publicPodcasts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.latestPodcastsTitle}</h2>
                <p className="text-gray-600">{t.latestPodcastsSubtitle}</p>
              </div>
              <Link 
                href="/explore" 
                className="hidden sm:inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <span>{t.viewMore}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicPodcasts.map((podcast) => (
                <motion.div
                  key={podcast.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      {/* Podcast cover image */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        {podcast.coverImageUrl ? (
                          <img 
                            src={podcast.coverImageUrl} 
                            alt="播客封面" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{podcast.title}</h3>
                        <div className="text-xs text-gray-500">时长: {podcast.duration || '00:00:00'}</div>
                        {podcast.userEmail && (
                          <div className="text-xs text-gray-400">{t.byUser} {podcast.userEmail.split('@')[0]}</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <audio
                        controls
                        className="w-full h-10 rounded-md"
                        src={podcast.audioUrl}
                      >
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                    {podcast.description && (
                      <div className="text-xs text-gray-500 mb-2 line-clamp-2">{podcast.description}</div>
                    )}
                    {podcast.tags && podcast.tags.split(',').filter(tag => tag.trim()).length > 0 && (
                      <div className="flex gap-2 flex-wrap text-xs text-gray-400 mb-2">
                        {podcast.tags.split(',').filter(tag => tag.trim()).map(tag => (
                          <span key={tag} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">#{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {loadingPublic && (
              <div className="text-center py-8 text-gray-400">{t.loadingPodcasts}</div>
            )}
            {!loadingPublic && publicPodcasts.length === 0 && (
              <div className="text-center py-8 text-gray-400">{t.noPublicPodcasts}</div>
            )}
            {/* Mobile "查看更多" button */}
            <div className="text-center sm:hidden mt-8">
              <Link 
                href="/explore" 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <span>{t.viewMore}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Buy Me a Coffee section */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.supportTitle}</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{t.supportDesc}</p>
            <a
              href="https://buymeacoffee.com/wego"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-lg"
            >
              <span className="text-2xl">☕</span>
              <span>{t.buyMeCoffee}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer with copyright information */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 品牌信息 */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <img src="/logo.png" alt="龙眼AI Logo" className="h-8 w-8" />
                <span className="font-bold text-xl text-primary">{getWebsiteName()}</span>
              </div>
              <p className="text-gray-600 text-sm">{t.slogan}</p>
            </div>
            
            {/* 快速链接 */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-900 mb-4">{t.quickLinks}</h3>
              <div className="space-y-2">
                <Link href="/" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.home}
                </Link>
                <Link href="/explore" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.explore}
                </Link>
                <Link href="/pricing" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.pricing}
                </Link>
              </div>
            </div>
            
            {/* 法律信息 */}
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-900 mb-4">{t.legalInfo}</h3>
              <div className="space-y-2">
                <Link href="/privacy" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.privacyPolicy}
                </Link>
                <Link href="/terms" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.termsOfService}
                </Link>
                <a href="mailto:support@longan.ai" className="block text-sm text-gray-600 hover:text-primary transition">
                  {t.contactUs}
                </a>
              </div>
            </div>
          </div>
          
          {/* 版权信息 */}
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600 text-sm">{t.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 