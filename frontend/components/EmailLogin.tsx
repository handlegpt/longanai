'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, LogIn, ArrowRight, User, Loader, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailLoginProps {
  onLogin: (token: string, email: string) => void;
  translations: {
    loginTitle: string;
    verificationTitle: string;
    loginSubtitle: string;
    verificationSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    loginButton: string;
    loginLoading: string;
    orText: string;
    sendVerificationButton: string;
    sendLoading: string;
    verificationSentTitle: string;
    verificationSentSubtitle: string;
    nextStepsTitle: string;
    step1: string;
    step2: string;
    step3: string;
    backToLogin: string;
    resendButton: string;
    resendLoading: string;
    termsText: string;
    termsLink: string;
    privacyLink: string;
    emailRequired: string;
    invalidEmail: string;
    verificationSent: string;
    sendFailed: string;
    networkError: string;
    loginSuccess: string;
    loginFailed: string;
    codeLabel: string;
    codePlaceholder: string;
    verifyButton: string;
    verifyLoading: string;
    codeRequired: string;
    invalidCode: string;
    googleLoginButton: string;
    orEmailLogin: string;
  };
}

export default function EmailLogin({ onLogin, translations }: EmailLoginProps) {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error(translations.emailRequired);
      return;
    }

    if (!email.includes('@')) {
      toast.error(translations.invalidEmail);
      return;
    }

    setIsLoading(true);
    try {
      // 统一发送登录验证码，无论用户是否已验证
      const response = await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
        toast.success(translations.verificationSent);
      } else {
        toast.error(data.detail || translations.sendFailed);
      }
    } catch (error) {
      toast.error(translations.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error(translations.codeRequired);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-login-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.access_token, data.email);
        toast.success(translations.loginSuccess);
      } else {
        toast.error(data.detail || translations.invalidCode);
      }
    } catch (error) {
      toast.error(translations.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(translations.verificationSent);
      } else {
        toast.error(data.detail || translations.sendFailed);
      }
    } catch (error) {
      toast.error(translations.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'email' ? translations.loginTitle : translations.verificationTitle}
        </h2>
        <p className="text-gray-600">
          {step === 'email' ? translations.loginSubtitle : translations.verificationSubtitle}
        </p>
      </div>

      {step === 'email' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Google 登录按钮 */}
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm transition-all duration-150"
            onClick={() => {
              window.location.href = '/api/auth/google/login';
            }}
          >
            <span className="w-5 h-5 mr-1">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.5z"/>
                  <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.8 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 15.3 3 7.9 8.7 6.3 14.7z"/>
                  <path fill="#FBBC05" d="M24 43c5.4 0 10-1.8 13.3-4.9l-6.2-5.1c-2 1.4-4.5 2.2-7.1 2.2-5.6 0-10.3-3.8-12-9l-6.5 5c3.2 6.3 10.1 11.8 18.5 11.8z"/>
                  <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-4.1 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C36.1 5.1 30.4 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.3-3.5z"/>
                </g>
              </svg>
            </span>
            <span>{translations.googleLoginButton || '使用 Google 登录'}</span>
          </button>

          {/* 分割线 */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">{translations.orEmailLogin || '或邮箱登录'}</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translations.emailPlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{translations.sendLoading}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{translations.sendVerificationButton}</span>
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.codeLabel}
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={translations.codePlaceholder}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-center text-lg tracking-widest"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>{translations.verifyLoading}</span>
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                <span>{translations.verifyButton}</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
            >
              {translations.resendButton}
            </button>
          </div>

          <button
            onClick={() => setStep('email')}
            className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            {translations.backToLogin}
          </button>
        </motion.div>
      )}

      <div className="text-center text-xs text-gray-500">
        {translations.termsText}
        <a href="/terms" className="text-primary-600 hover:text-primary-700">
          {translations.termsLink}
        </a>
        {' '}和{' '}
        <a href="/privacy" className="text-primary-600 hover:text-primary-700">
          {translations.privacyLink}
        </a>
      </div>
    </div>
  );
} 