"use client";

import EmailLogin from '@/components/EmailLogin';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // 多语言翻译
  const translations = {
    cantonese: {
      loginTitle: '登入',
      verificationTitle: '輸入驗證碼',
      loginSubtitle: '輸入你嘅郵箱地址，我哋會發送驗證碼',
      verificationSubtitle: '請輸入發送到你郵箱嘅6位驗證碼',
      emailLabel: '郵箱地址',
      emailPlaceholder: '請輸入你嘅郵箱地址',
      loginButton: '發送驗證碼',
      loginLoading: '發送中...',
      orText: '或者',
      sendVerificationButton: '發送驗證碼',
      sendLoading: '發送中...',
      verificationSentTitle: '驗證碼已發送',
      verificationSentSubtitle: '我哋已經發送咗驗證碼俾你',
      nextStepsTitle: '下一步',
      step1: '檢查你嘅郵箱',
      step2: '輸入6位驗證碼',
      step3: '點擊驗證按鈕',
      backToLogin: '返回登入',
      resendButton: '重新發送驗證碼',
      resendLoading: '重新發送中...',
      termsText: '登入即表示你同意我哋嘅',
      termsLink: '服務條款',
      privacyLink: '私隱政策',
      emailRequired: '請輸入郵箱地址',
      invalidEmail: '請輸入有效嘅郵箱地址',
      verificationSent: '驗證碼已發送',
      sendFailed: '發送失敗，請重試',
      networkError: '網絡錯誤，請重試',
      loginSuccess: '登入成功',
      loginFailed: '登入失敗，請重試',
      codeLabel: '驗證碼',
      codePlaceholder: '請輸入6位驗證碼',
      verifyButton: '驗證',
      verifyLoading: '驗證中...',
      codeRequired: '請輸入驗證碼',
      invalidCode: '驗證碼錯誤'
    },
    mandarin: {
      loginTitle: '邮箱登录',
      verificationTitle: '输入验证码',
      loginSubtitle: '输入你的邮箱地址，我们会发送验证码',
      verificationSubtitle: '请输入发送到你邮箱的6位验证码',
      emailLabel: '邮箱地址',
      emailPlaceholder: '请输入你的邮箱地址',
      loginButton: '发送验证码',
      loginLoading: '发送中...',
      orText: '或者',
      sendVerificationButton: '发送验证码',
      sendLoading: '发送中...',
      verificationSentTitle: '验证码已发送',
      verificationSentSubtitle: '我们已经发送了验证码给你',
      nextStepsTitle: '下一步',
      step1: '检查你的邮箱',
      step2: '输入6位验证码',
      step3: '点击验证按钮',
      backToLogin: '返回登录',
      resendButton: '重新发送验证码',
      resendLoading: '重新发送中...',
      termsText: '登录即表示你同意我们的',
      termsLink: '服务条款',
      privacyLink: '隐私政策',
      emailRequired: '请输入邮箱地址',
      invalidEmail: '请输入有效的邮箱地址',
      verificationSent: '验证码已发送',
      sendFailed: '发送失败，请重试',
      networkError: '网络错误，请重试',
      loginSuccess: '登录成功',
      loginFailed: '登录失败，请重试',
      codeLabel: '验证码',
      codePlaceholder: '请输入6位验证码',
      verifyButton: '验证',
      verifyLoading: '验证中...',
      codeRequired: '请输入验证码',
      invalidCode: '验证码错误'
    },
    english: {
      loginTitle: 'Email Login',
      verificationTitle: 'Enter Verification Code',
      loginSubtitle: 'Enter your email address, we will send you a verification code',
      verificationSubtitle: 'Please enter the 6-digit verification code sent to your email',
      emailLabel: 'Email Address',
      emailPlaceholder: 'example@gmail.com',
      loginButton: 'Send Verification Code',
      loginLoading: 'Sending...',
      orText: 'Or',
      sendVerificationButton: 'Send Verification Code',
      sendLoading: 'Sending...',
      verificationSentTitle: 'Verification Code Sent',
      verificationSentSubtitle: 'We have sent a verification code to {email}',
      nextStepsTitle: 'Next Steps',
      step1: 'Check your email inbox',
      step2: 'Enter the 6-digit verification code',
      step3: 'Click the verify button',
      backToLogin: 'Back to Login',
      resendButton: 'Resend Verification Code',
      resendLoading: 'Sending...',
      termsText: 'By using email login, you agree to our',
      termsLink: 'Terms of Service',
      privacyLink: 'Privacy Policy',
      emailRequired: 'Please enter an email address',
      invalidEmail: 'Please enter a valid email address',
      verificationSent: 'Verification code sent, please check your inbox!',
      sendFailed: 'Send failed',
      networkError: 'Network error, please try again',
      loginSuccess: 'Login successful!',
      loginFailed: 'Login failed',
      codeLabel: 'Verification Code',
      codePlaceholder: 'Enter 6-digit code',
      verifyButton: 'Verify',
      verifyLoading: 'Verifying...',
      codeRequired: 'Please enter verification code',
      invalidCode: 'Invalid verification code'
    }
  };

  // 获取当前语言的翻译
  const t = translations[language as keyof typeof translations] || translations.cantonese;

  // 登录成功后跳转到对应语言的首页
  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setLoginSuccess(true);
    
    // 根据当前语言跳转到对应的首页
    const languagePaths = {
      cantonese: '/cantonese',
      mandarin: '/zh',
      english: '/en'
    };
    const targetPath = languagePaths[language as keyof typeof languagePaths] || '/zh';
    router.push(targetPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <EmailLogin onLogin={handleLogin} translations={t} />
    </div>
  );
} 