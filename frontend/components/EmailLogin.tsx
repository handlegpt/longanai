'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, LogIn, ArrowRight, User, Loader } from 'lucide-react';
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
  };
}

export default function EmailLogin({ onLogin, translations }: EmailLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'verification'>('login');

  const handleSendVerification = async () => {
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
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('verification');
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

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error(translations.emailRequired);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.access_token, data.email);
        toast.success(translations.loginSuccess);
      } else {
        if (response.status === 404) {
          // User doesn't exist, send verification email
          await handleSendVerification();
        } else {
          toast.error(data.detail || translations.loginFailed);
        }
      }
    } catch (error) {
      toast.error(translations.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
        <Mail className="w-6 h-6 mr-2 text-primary-500" />
        {translations.loginTitle}
      </h2>
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
        <span>使用 Google 登录</span>
      </button>
      {/* 分割线 */}
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-200" />
        <span className="mx-2 text-gray-400 text-xs">或邮箱登录</span>
        <div className="flex-grow h-px bg-gray-200" />
      </div>

      {step === 'login' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translations.emailPlaceholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <LogIn className="w-5 h-5" />
              <span>{isLoading ? translations.loginLoading : translations.loginButton}</span>
            </button>

            <div className="text-center">
              <span className="text-gray-500 text-sm">{translations.orText}</span>
            </div>

            <button
              onClick={handleSendVerification}
              disabled={isLoading}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? translations.sendLoading : translations.sendVerificationButton}</span>
            </button>
          </div>
        </motion.div>
      )}

      {step === 'verification' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {translations.verificationSentTitle}
            </h3>
            <p className="text-gray-600 mb-4">
              {translations.verificationSentSubtitle.replace('{email}', email)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{translations.nextStepsTitle}：</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. {translations.step1}</li>
              <li>2. {translations.step2}</li>
              <li>3. {translations.step3}</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('login')}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>{translations.backToLogin}</span>
            </button>

            <button
              onClick={handleSendVerification}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? translations.sendLoading : translations.resendButton}</span>
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          {translations.termsText}
          <a href="#" className="text-primary-600 hover:underline">{translations.termsLink}</a>
          和
          <a href="#" className="text-primary-600 hover:underline">{translations.privacyLink}</a>
        </p>
      </div>
    </div>
  );
} 