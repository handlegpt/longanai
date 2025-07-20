'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('验证链接无效');
      return;
    }

    verifyEmail(token);
  }, [token]);

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
        toast.success('邮箱验证成功！');
        
        // 3秒后跳转到首页
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.detail || '验证失败');
        toast.error(data.detail || '验证失败');
      }
    } catch (error) {
      setStatus('error');
      setMessage('网络错误，请重试');
      toast.error('网络错误，请重试');
    }
  };

  const handleResend = async () => {
    // 这里可以添加重新发送验证邮件的功能
    toast('请联系客服重新发送验证邮件');
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">邮箱验证</h1>
            <p className="text-gray-600">验证你嘅邮箱地址</p>
          </div>

          {/* Status */}
          <div className="text-center mb-6">
            {status === 'loading' && (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                <span className="text-gray-600">正在验证...</span>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center space-x-3 text-green-600"
              >
                <CheckCircle className="w-8 h-8" />
                <span className="font-medium">验证成功</span>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center space-x-3 text-red-600"
              >
                <XCircle className="w-8 h-8" />
                <span className="font-medium">验证失败</span>
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
                  3秒后自动跳转到首页...
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary w-full"
                >
                  立即前往首页
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
                  <span>重新发送验证邮件</span>
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回首页</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              让AI讲好你嘅粤语故事
            </p>
            <p className="text-xs text-gray-400 mt-1">
              © 2024 龙眼AI. 保留所有权利.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 