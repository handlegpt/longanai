'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, LogIn, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface EmailLoginProps {
  onLogin: (token: string, email: string) => void;
}

export default function EmailLogin({ onLogin }: EmailLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'verification'>('login');

  const handleSendVerification = async () => {
    if (!email.trim()) {
      toast.error('请输入邮箱地址');
      return;
    }

    if (!email.includes('@')) {
      toast.error('请输入有效嘅邮箱地址');
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
        toast.success('验证邮件已发送，请检查你嘅邮箱！');
      } else {
        toast.error(data.detail || '发送失败');
      }
    } catch (error) {
      toast.error('网络错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error('请输入邮箱地址');
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
        toast.success('登录成功！');
      } else {
        if (response.status === 404) {
          // User doesn't exist, send verification email
          await handleSendVerification();
        } else {
          toast.error(data.detail || '登录失败');
        }
      }
    } catch (error) {
      toast.error('网络错误，请重试');
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
          {step === 'login' ? '邮箱登录' : '验证邮箱'}
        </h2>
        <p className="text-gray-600">
          {step === 'login' 
            ? '输入你嘅邮箱地址开始使用' 
            : '请检查邮箱并点击验证链接'
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
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
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
              <span>{isLoading ? '登录中...' : '登录'}</span>
            </button>

            <div className="text-center">
              <span className="text-gray-500 text-sm">或者</span>
            </div>

            <button
              onClick={handleSendVerification}
              disabled={isLoading}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? '发送中...' : '发送验证邮件'}</span>
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
              验证邮件已发送
            </h3>
            <p className="text-gray-600 mb-4">
              我们已向 <strong>{email}</strong> 发送验证邮件
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">下一步：</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. 检查你嘅邮箱收件箱</li>
              <li>2. 点击验证链接</li>
              <li>3. 返回呢度继续使用</li>
            </ol>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStep('login')}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>返回登录</span>
            </button>

            <button
              onClick={handleSendVerification}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? '发送中...' : '重新发送验证邮件'}</span>
            </button>
          </div>
        </motion.div>
      )}

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          使用邮箱登录即表示你同意我们嘅
          <a href="#" className="text-primary-600 hover:underline">服务条款</a>
          和
          <a href="#" className="text-primary-600 hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  );
} 