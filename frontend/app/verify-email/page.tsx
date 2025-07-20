'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Interface language translations
const translations = {
  cantonese: {
    title: '邮箱验证',
    subtitle: '验证你嘅邮箱地址',
    loading: '正在验证...',
    success: '验证成功',
    error: '验证失败',
    invalidLink: '验证链接无效',
    verifyFailed: '验证失败',
    networkError: '网络错误，请重试',
    successMessage: '邮箱验证成功！',
    verifyFailedMessage: '验证失败',
    networkErrorMessage: '网络错误，请重试',
    autoRedirect: '3秒后自动跳转到首页...',
    goHome: '立即前往首页',
    resendEmail: '重新发送验证邮件',
    backHome: '返回首页',
    slogan: '让AI讲好你嘅粤语故事',
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    contactSupport: '请联系客服重新发送验证邮件'
  },
  mandarin: {
    title: '邮箱验证',
    subtitle: '验证你的邮箱地址',
    loading: '正在验证...',
    success: '验证成功',
    error: '验证失败',
    invalidLink: '验证链接无效',
    verifyFailed: '验证失败',
    networkError: '网络错误，请重试',
    successMessage: '邮箱验证成功！',
    verifyFailedMessage: '验证失败',
    networkErrorMessage: '网络错误，请重试',
    autoRedirect: '3秒后自动跳转到首页...',
    goHome: '立即前往首页',
    resendEmail: '重新发送验证邮件',
    backHome: '返回首页',
    slogan: '让AI讲好你的粤语故事',
    copyright: '© 2025 龙眼AI. 保留所有权利.',
    contactSupport: '请联系客服重新发送验证邮件'
  },
  english: {
    title: 'Email Verification',
    subtitle: 'Verify your email address',
    loading: 'Verifying...',
    success: 'Verification Successful',
    error: 'Verification Failed',
    invalidLink: 'Invalid verification link',
    verifyFailed: 'Verification failed',
    networkError: 'Network error, please try again',
    successMessage: 'Email verification successful!',
    verifyFailedMessage: 'Verification failed',
    networkErrorMessage: 'Network error, please try again',
    autoRedirect: 'Redirecting to homepage in 3 seconds...',
    goHome: 'Go to Homepage',
    resendEmail: 'Resend Verification Email',
    backHome: 'Back to Homepage',
    slogan: 'Let AI tell your Cantonese stories well',
    copyright: '© 2025 Longan AI. All rights reserved.',
    contactSupport: 'Please contact support to resend verification email'
  }
};

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('cantonese');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Get current translation
  const t = translations[selectedLanguage as keyof typeof translations] || translations.cantonese;

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t.invalidLink);
      return;
    }

    verifyEmail(token);
  }, [token, t]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        toast.success(t.successMessage);
        
        // 3秒后跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.detail || t.verifyFailedMessage);
        toast.error(data.detail || t.verifyFailedMessage);
      }
    } catch (error) {
      setStatus('error');
      setMessage(t.networkErrorMessage);
      toast.error(t.networkErrorMessage);
    }
  };

  const handleResend = async () => {
    // 这里可以添加重新发送验证邮件的功能
    toast(t.contactSupport);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">龙</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {status === 'loading' && (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="text-gray-600">{t.loading}</span>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center space-x-3 text-green-600"
              >
                <CheckCircle className="w-8 h-8" />
                <span className="font-medium">{t.success}</span>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center space-x-3 text-red-600"
              >
                <XCircle className="w-8 h-8" />
                <span className="font-medium">{t.error}</span>
              </motion.div>
            )}
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-700">{message}</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'success' && (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  {t.autoRedirect}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary w-full"
                >
                  {t.goHome}
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>{t.resendEmail}</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backHome}</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t.slogan}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t.copyright}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 