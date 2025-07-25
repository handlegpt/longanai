"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [userStats, setUserStats] = useState<any>(null);
  const [podcastHistory, setPodcastHistory] = useState<any[]>([]);

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);
    fetch(`/api/podcast/user/stats?user_email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(setUserStats);
    const savedHistory = localStorage.getItem('podcast_history');
    if (savedHistory) setPodcastHistory(JSON.parse(savedHistory));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">个人中心</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-2"><span className="font-semibold">邮箱：</span>{userEmail}</div>
        {userStats && (
          <div className="mb-2">
            <span className="font-semibold">套餐：</span>
            {userStats.is_unlimited ? '企业版（无限制）' : `普通版（剩余 ${userStats.remaining_generations} 次生成）`}
          </div>
        )}
        <button onClick={handleLogout} className="mt-4 btn-secondary flex items-center space-x-2">
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">我的播客历史</h2>
        {podcastHistory.length === 0 ? (
          <div className="text-gray-500">暂无历史记录</div>
        ) : (
          <ul className="space-y-3">
            {podcastHistory.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b py-2">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                </div>
                <audio src={item.audioUrl} controls className="h-8" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 