"use client";

import EmailLogin from '@/components/EmailLogin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function EnglishLoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // English translations
  const translations = {
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
    invalidCode: 'Invalid verification code',
    googleLoginButton: 'Sign in with Google',
    orEmailLogin: 'or email login'
  };

  // Handle login success
  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setLoginSuccess(true);
    router.push('/en');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <EmailLogin onLogin={handleLogin} translations={translations} />
    </div>
  );
} 