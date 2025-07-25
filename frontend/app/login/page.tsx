"use client";

import EmailLogin from '@/components/EmailLogin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // 默认粤语翻译
  const translations = {
    loginTitle: '登入',
    verificationTitle: '郵箱驗證',
    loginSubtitle: '輸入你嘅郵箱地址嚟登入',
    verificationSubtitle: '我哋已經發送咗驗證郵件俾你',
    emailLabel: '郵箱地址',
    emailPlaceholder: '請輸入你嘅郵箱地址',
    loginButton: '登入',
    loginLoading: '登入中...',
    orText: '或者',
    sendVerificationButton: '發送驗證郵件',
    sendLoading: '發送中...',
    verificationSentTitle: '驗證郵件已發送',
    verificationSentSubtitle: '請檢查你嘅郵箱並點擊驗證連結',
    nextStepsTitle: '下一步',
    step1: '檢查你嘅郵箱',
    step2: '點擊驗證連結',
    step3: '返回呢度登入',
    backToLogin: '返回登入',
    resendButton: '重新發送',
    resendLoading: '重新發送中...',
    termsText: '登入即表示你同意我哋嘅',
    termsLink: '服務條款',
    privacyLink: '私隱政策',
    emailRequired: '請輸入郵箱地址',
    invalidEmail: '請輸入有效嘅郵箱地址',
    verificationSent: '驗證郵件已發送',
    sendFailed: '發送失敗，請重試',
    networkError: '網絡錯誤，請重試',
    loginSuccess: '登入成功',
    loginFailed: '登入失敗，請重試'
  };

  // 登录成功后跳转首页
  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setLoginSuccess(true);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <EmailLogin onLogin={handleLogin} translations={translations} />
    </div>
  );
} 