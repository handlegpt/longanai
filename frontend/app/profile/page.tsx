"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  User, 
  Edit, 
  Trash2, 
  Download, 
  Share2, 
  Eye, 
  EyeOff,
  BarChart3,
  Settings,
  Mic,
  Calendar,
  Clock,
  Globe,
  Heart,
  Star,
  Plus,
  Save,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface UserStats {
  subscription_plan: string;
  monthly_generation_count: number;
  monthly_generation_limit: number;
  remaining_generations: number;
  is_unlimited: boolean;
  display_name?: string;
  bio?: string;
  preferred_voice?: string;
  preferred_language?: string;
  avatar_url?: string;
}

interface Podcast {
  id: number;
  title: string;
  description?: string;
  audio_url: string;
  cover_image_url?: string;
  duration?: string;
  voice: string;
  emotion: string;
  speed: number;
  tags?: string;
  is_public: boolean;
  created_at: string;
}

interface Analytics {
  total_podcasts: number;
  public_podcasts: number;
  private_podcasts: number;
  voice_statistics: Record<string, number>;
  total_duration_seconds: number;
  recent_podcasts_30_days: number;
  average_duration: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<number | null>(null);
  
  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    bio: '',
    preferred_voice: 'young-lady',
    preferred_language: 'cantonese'
  });

  // Podcast editing state
  const [podcastForm, setPodcastForm] = useState({
    title: '',
    description: '',
    tags: '',
    is_public: true
  });

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (!email) {
      router.push('/login');
      return;
    }
    setUserEmail(email);
    fetchUserData(email);
  }, [router]);

  const fetchUserData = async (email: string) => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch(`/api/podcast/user/stats?user_email=${encodeURIComponent(email)}`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats);
        setProfileForm({
          display_name: stats.display_name || '',
          bio: stats.bio || '',
          preferred_voice: stats.preferred_voice || 'young-lady',
          preferred_language: stats.preferred_language || 'cantonese'
        });
      }

      // Fetch user podcasts
      const podcastsResponse = await fetch(`/api/podcast/user/podcasts?user_email=${encodeURIComponent(email)}&page=1&size=50`);
      if (podcastsResponse.ok) {
        const data = await podcastsResponse.json();
        setPodcasts(data.podcasts || []);
      }

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/podcast/user/analytics?user_email=${encodeURIComponent(email)}`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
      toast.error('获取用户数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    router.push('/login');
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`/api/podcast/user/profile?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        toast.success('个人资料更新成功');
        setEditingProfile(false);
        fetchUserData(userEmail);
      } else {
        toast.error('更新失败，请重试');
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  const handleUpdatePodcast = async (podcastId: number) => {
    try {
      const response = await fetch(`/api/podcast/podcast/${podcastId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          ...podcastForm
        }),
      });

      if (response.ok) {
        toast.success('播客更新成功');
        setEditingPodcast(null);
        fetchUserData(userEmail);
      } else {
        toast.error('更新失败，请重试');
      }
    } catch (error) {
      console.error('更新播客失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  const handleDeletePodcast = async (podcastId: number) => {
    if (!confirm('确定要删除这个播客吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/podcast/podcast/${podcastId}?user_email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('播客删除成功');
        fetchUserData(userEmail);
      } else {
        toast.error('删除失败，请重试');
      }
    } catch (error) {
      console.error('删除播客失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVoiceName = (voice: string) => {
    const voiceNames: Record<string, string> = {
      'young-lady': '靓女',
      'young-man': '靓仔',
      'elderly-woman': '阿嫲'
    };
    return voiceNames[voice] || voice;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">个人中心</h1>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>编辑</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>保存</span>
                </button>
                <button
                  onClick={() => setEditingProfile(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>取消</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', name: '个人资料', icon: User },
              { id: 'podcasts', name: '我的播客', icon: Mic },
              { id: 'analytics', name: '数据统计', icon: BarChart3 },
              { id: 'settings', name: '设置', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">个人资料</h2>
                {/* 这里移除原有的编辑/保存/取消按钮 */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      显示名称
                    </label>
                    <input
                      type="text"
                      value={editingProfile ? profileForm.display_name : (userStats?.display_name || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      placeholder="输入你的显示名称"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={editingProfile ? profileForm.bio : (userStats?.bio || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      disabled={!editingProfile}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                      placeholder="介绍一下你自己..."
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      默认声音
                    </label>
                    <select
                      value={editingProfile ? profileForm.preferred_voice : (userStats?.preferred_voice || 'young-lady')}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_voice: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="young-lady">靓女</option>
                      <option value="young-man">靓仔</option>
                      <option value="elderly-woman">阿嫲</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      默认语言
                    </label>
                    <select
                      value={editingProfile ? profileForm.preferred_language : (userStats?.preferred_language || 'cantonese')}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_language: e.target.value })}
                      disabled={!editingProfile}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      <option value="cantonese">粤语</option>
                      <option value="mandarin">简体中文</option>
                      <option value="english">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      订阅套餐
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                      {userStats?.is_unlimited ? (
                        <span className="text-green-600 font-medium">企业版（无限制）</span>
                      ) : (
                        <span className="text-gray-600">
                          普通版（剩余 {userStats?.remaining_generations} 次生成）
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'podcasts' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">我的播客</h2>
                <div className="text-sm text-gray-500">
                  共 {podcasts.length} 个播客
                </div>
              </div>

              {podcasts.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">还没有生成过播客</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {podcasts.map((podcast) => (
                    <div key={podcast.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {editingPodcast === podcast.id ? (
                                <input
                                  type="text"
                                  value={podcastForm.title}
                                  onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                                  className="px-2 py-1 border border-gray-300 rounded"
                                />
                              ) : (
                                podcast.title
                              )}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              podcast.is_public 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {podcast.is_public ? '公开' : '私密'}
                            </span>
                          </div>
                          
                          {editingPodcast === podcast.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={podcastForm.description}
                                onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                                placeholder="播客描述..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                rows={2}
                              />
                              <input
                                type="text"
                                value={podcastForm.tags}
                                onChange={(e) => setPodcastForm({ ...podcastForm, tags: e.target.value })}
                                placeholder="标签（用逗号分隔）"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={podcastForm.is_public}
                                    onChange={(e) => setPodcastForm({ ...podcastForm, is_public: e.target.checked })}
                                    className="rounded"
                                  />
                                  <span>公开播客</span>
                                </label>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 space-y-1">
                              {podcast.description && <p>{podcast.description}</p>}
                              <div className="flex items-center space-x-4 text-xs">
                                <span>声音: {getVoiceName(podcast.voice)}</span>
                                <span>时长: {podcast.duration || '未知'}</span>
                                <span>创建: {new Date(podcast.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {editingPodcast === podcast.id ? (
                            <>
                              <button
                                onClick={() => handleUpdatePodcast(podcast.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingPodcast(null)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingPodcast(podcast.id);
                                  setPodcastForm({
                                    title: podcast.title,
                                    description: podcast.description || '',
                                    tags: podcast.tags || '',
                                    is_public: podcast.is_public
                                  });
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePodcast(podcast.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingPodcast !== podcast.id && (
                        <div className="mt-4">
                          <audio src={podcast.audio_url} controls className="w-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && analytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">数据统计</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Mic className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">总播客数</p>
                      <p className="text-2xl font-bold text-blue-900">{analytics.total_podcasts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Globe className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">公开播客</p>
                      <p className="text-2xl font-bold text-green-900">{analytics.public_podcasts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">总时长</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatDuration(analytics.total_duration_seconds)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-orange-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-600">近30天</p>
                      <p className="text-2xl font-bold text-orange-900">{analytics.recent_podcasts_30_days}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">声音使用统计</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.voice_statistics).map(([voice, count]) => (
                    <div key={voice} className="flex justify-between items-center">
                      <span className="text-gray-700">{getVoiceName(voice)}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(count / analytics.total_podcasts) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">设置</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">通知设置</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">邮件通知</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">生成完成提醒</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">隐私设置</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm text-gray-700">默认公开新播客</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">允许其他用户查看我的播客</span>
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">账户管理</h3>
                  <div className="space-y-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      修改邮箱地址
                    </button>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      删除账户
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 