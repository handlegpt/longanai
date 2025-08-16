"use client";

import EmailLogin from '@/components/EmailLogin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CantoneseLoginPage() {
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Cantonese translations
  const translations = {
    loginTitle: '郵箱登入',
    verificationTitle: '輸入驗證碼',
    loginSubtitle: '輸入你嘅郵箱地址，我哋會發送驗證碼',
    verificationSubtitle: '請輸入發送到你郵箱嘅6位驗證碼',
    emailLabel: '郵箱地址',
    emailPlaceholder: 'example@gmail.com',
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
    verificationSent: '驗證碼已發送，請檢查你嘅郵箱！',
    sendFailed: '發送失敗',
    networkError: '網絡錯誤，請重試',
    loginSuccess: '登入成功！',
    loginFailed: '登入失敗',
    codeLabel: '驗證碼',
    codePlaceholder: '請輸入6位驗證碼',
    verifyButton: '驗證',
    verifyLoading: '驗證中...',
    codeRequired: '請輸入驗證碼',
    invalidCode: '驗證碼錯誤'
  };

  // Handle login success
  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setLoginSuccess(true);
    router.push('/cantonese');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <EmailLogin onLogin={handleLogin} translations={translations} />
    </div>
  );
} 