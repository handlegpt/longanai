'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mic, Users, Heart, MessageCircle, Calendar, Tag, Settings, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import UserFollow from '@/components/social/UserFollow';
import PodcastInteraction from '@/components/social/PodcastInteraction';
import { useLanguage } from '@/context/LanguageContext';

interface UserProfile {
  email: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  podcast_count: number;
  follower_count: number;
  following_count: number;
  total_likes: number;
  total_views: number;
}

interface UserPodcast {
  id: number;
  title: string;
  description?: string;
  audio_url: string;
  duration: string;
  cover_image_url?: string;
  created_at: string;
  language: string;
  tags?: string;
  is_public: boolean;
  like_count: number;
  comment_count: number;
  view_count: number;
}

const translations = {
  cantonese: {
    back: '返回',
    notFound: '用戶不存在',
    loading: '載入中...',
    error: '載入失敗',
    profile: '個人資料',
    podcasts: '播客作品',
    followers: '粉絲',
    following: '關注',
    totalLikes: '總點讚',
    totalViews: '總觀看',
    memberSince: '加入時間',
    noBio: '暫無個人簡介',
    noPodcasts: '暫無播客作品',
    public: '公開',
    private: '私密',
    editProfile: '編輯資料',
    settings: '設置',
    networkError: '網絡錯誤',
    userNotFound: '用戶不存在',
    follow: '關注',
    unfollow: '取消關注',
    edit: '編輯',
  },
  mandarin: {
    back: '返回',
    notFound: '用户不存在',
    loading: '加载中...',
    error: '加载失败',
    profile: '个人资料',
    podcasts: '播客作品',
    followers: '粉丝',
    following: '关注',
    totalLikes: '总点赞',
    totalViews: '总观看',
    memberSince: '加入时间',
    noBio: '暂无个人简介',
    noPodcasts: '暂无播客作品',
    public: '公开',
    private: '私密',
    editProfile: '编辑资料',
    settings: '设置',
    networkError: '网络错误',
    userNotFound: '用户不存在',
    follow: '关注',
    unfollow: '取消关注',
    edit: '编辑',
  },
  english: {
    back: 'Back',
    notFound: 'User not found',
    loading: 'Loading...',
    error: 'Loading failed',
    profile: 'Profile',
    podcasts: 'Podcasts',
    followers: 'Followers',
    following: 'Following',
    totalLikes: 'Total Likes',
    totalViews: 'Total Views',
    memberSince: 'Member since',
    noBio: 'No bio',
    noPodcasts: 'No podcasts',
    public: 'Public',
    private: 'Private',
    editProfile: 'Edit Profile',
    settings: 'Settings',
    networkError: 'Network error',
    userNotFound: 'User not found',
    follow: 'Follow',
    unfollow: 'Unfollow',
    edit: 'Edit',
  }
};

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPodcasts, setUserPodcasts] = useState<UserPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'podcasts' | 'about'>('podcasts');

  useEffect(() => {
    // 获取当前用户邮箱
    const email = localStorage.getItem('userEmail');
    setCurrentUserEmail(email);

    // 获取用户资料
    const fetchUserProfile = async () => {
      try {
        const userEmail = decodeURIComponent(params.email as string);
        const response = await fetch(`/api/user/${userEmail}/profile`);
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else if (response.status === 404) {
          setError(t.notFound);
        } else {
          setError(t.error);
        }
      } catch (err) {
        setError(t.networkError);
      } finally {
        setLoading(false);
      }
    };

    // 获取用户播客
    const fetchUserPodcasts = async () => {
      try {
        const userEmail = decodeURIComponent(params.email as string);
        const response = await fetch(`/api/user/${userEmail}/podcasts`);
        if (response.ok) {
          const data = await response.json();
          setUserPodcasts(data.podcasts || []);
        }
      } catch (err) {
        console.error('Failed to fetch user podcasts:', err);
      }
    };

    if (params.email) {
      fetchUserProfile();
      fetchUserPodcasts();
    }
  }, [params.email, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || t.notFound}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUserEmail === userProfile.email;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t.back}
            </button>
            
            {isOwnProfile && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/settings')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title={t.editProfile}
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/settings')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  title={t.settings}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 用户资料卡片 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {userProfile.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt={userProfile.display_name || userProfile.email}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    userProfile.display_name?.[0] || userProfile.email[0].toUpperCase()
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {userProfile.display_name || userProfile.email.split('@')[0]}
                  </h1>
                  <p className="text-gray-600 mb-2">{userProfile.email}</p>
                  {userProfile.bio && (
                    <p className="text-gray-700 max-w-md">{userProfile.bio}</p>
                  )}
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{t.memberSince}: {new Date(userProfile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {!isOwnProfile && currentUserEmail && (
                <UserFollow
                  currentUserEmail={currentUserEmail}
                  targetUserEmail={userProfile.email}
                  language={language}
                />
              )}
            </div>

            {/* 统计信息 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.podcast_count}</p>
                <p className="text-sm text-gray-600">{t.podcasts}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.follower_count}</p>
                <p className="text-sm text-gray-600">{t.followers}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.following_count}</p>
                <p className="text-sm text-gray-600">{t.following}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.total_likes}</p>
                <p className="text-sm text-gray-600">{t.totalLikes}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{userProfile.total_views}</p>
                <p className="text-sm text-gray-600">{t.totalViews}</p>
              </div>
            </div>
          </div>

          {/* 标签页 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('podcasts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'podcasts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.podcasts} ({userPodcasts.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'about'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.profile}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'podcasts' ? (
                <div>
                  {userPodcasts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🎙️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noPodcasts}</h3>
                      <p className="text-gray-600">这个用户还没有发布任何播客作品</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userPodcasts.map((podcast) => (
                        <div
                          key={podcast.id}
                          className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/podcast/${podcast.id}`)}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                              🎙️
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {podcast.title}
                              </h3>
                              <p className="text-xs text-gray-500">{podcast.duration}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{new Date(podcast.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                {podcast.like_count}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {podcast.comment_count}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">个人简介</h3>
                    <p className="text-gray-700">
                      {userProfile.bio || t.noBio}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">账户信息</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>邮箱: {userProfile.email}</p>
                      <p>加入时间: {new Date(userProfile.created_at).toLocaleDateString()}</p>
                      <p>播客数量: {userProfile.podcast_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
