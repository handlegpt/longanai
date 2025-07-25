import EmailLogin from '@/components/EmailLogin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // 登录成功后跳转首页
  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_email', email);
    setLoginSuccess(true);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <EmailLogin onLogin={handleLogin} />
    </div>
  );
} 