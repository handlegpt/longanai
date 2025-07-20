'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, LogIn, ArrowRight } from 'lucide-react';
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
    <div className="card max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'login' ? translations.loginTitle : translations.verificationTitle}
        </h2>
        <p className="text-gray-600">
          {step === 'login' 
            ? translations.loginSubtitle
            : translations.verificationSubtitle
          }
        </p>
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
              我们已向 <strong>{email}</strong> 发送验证邮件
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