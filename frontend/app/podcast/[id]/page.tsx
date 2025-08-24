'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Clock, Calendar, Tag, Eye, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PodcastPlayer from '@/components/PodcastPlayer';
import UserFollow from '@/components/social/UserFollow';
import { useLanguage } from '@/context/LanguageContext';

interface Podcast {
  id: number;
  title: string;
  description?: string;
  audio_url: string;
  duration: string;
  cover_image_url?: string;
  user_email: string;
  user_display_name?: string;
  created_at: string;
  language: string;
  tags?: string;
  is_public: boolean;
  file_size: number;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
}

const translations = {
  cantonese: {
    back: '返回',
    notFound: '播客不存在',
    loading: '載入中...',
    error: '載入失敗',
    by: 'by',
    created: '創建於',
    duration: '時長',
    tags: '標籤',
    public: '公開',
    private: '私密',
    noDescription: '暫無描述',
    noTags: '暫無標籤',
    views: '觀看',
    likes: '點讚',
    comments: '評論',
    follow: '關注',
    unfollow: '取消關注',
    followers: '粉絲',
    following: '關注',
    networkError: '網絡錯誤',
    userNotFound: '用戶不存在',
  },
  mandarin: {
    back: '返回',
    notFound: '播客不存在',
    loading: '加载中...',
    error: '加载失败',
    by: 'by',
    created: '创建于',
    duration: '时长',
    tags: '标签',
    public: '公开',
    private: '私密',
    noDescription: '暂无描述',
    noTags: '暂无标签',
    views: '观看',
    likes: '点赞',
    comments: '评论',
    follow: '关注',
    unfollow: '取消关注',
    followers: '粉丝',
    following: '关注',
    networkError: '网络错误',
    userNotFound: '用户不存在',
  },
  english: {
    back: 'Back',
    notFound: 'Podcast not found',
    loading: 'Loading...',
    error: 'Loading failed',
    by: 'by',
    created: 'Created',
    duration: 'Duration',
    tags: 'Tags',
    public: 'Public',
    private: 'Private',
    noDescription: 'No description',
    noTags: 'No tags',
    views: 'Views',
    likes: 'Likes',
    comments: 'Comments',
    follow: 'Follow',
    unfollow: 'Unfollow',
    followers: 'Followers',
    following: 'Following',
    networkError: 'Network error',
    userNotFound: 'User not found',
  }
};

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // 获取用户邮箱
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);

    // 获取播客详情
    const fetchPodcast = async () => {
      try {
        const response = await fetch(`/api/podcast/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPodcast(data);
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

    if (params.id) {
      fetchPodcast();
    }
  }, [params.id, t]);

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

  if (error || !podcast) {
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
          {/* 播客播放器 */}
          <div className="mb-8">
            <PodcastPlayer
              podcast={podcast}
              userEmail={userEmail || undefined}
              language={language}
            />
          </div>

          {/* 用户信息卡片 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {podcast.user_display_name?.[0] || podcast.user_email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {podcast.user_display_name || podcast.user_email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-600">{podcast.user_email}</p>
                </div>
              </div>
              
              {userEmail && userEmail !== podcast.user_email && (
                <UserFollow
                  currentUserEmail={userEmail}
                  targetUserEmail={podcast.user_email}
                  language={language}
                />
              )}
            </div>
          </div>

          {/* 播客统计信息 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">播客统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{podcast.view_count || 0}</p>
                <p className="text-sm text-gray-600">{t.views}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{podcast.like_count || 0}</p>
                <p className="text-sm text-gray-600">{t.likes}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{podcast.comment_count || 0}</p>
                <p className="text-sm text-gray-600">{t.comments}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{podcast.duration}</p>
                <p className="text-sm text-gray-600">{t.duration}</p>
              </div>
            </div>
          </div>

          {/* 播客详细信息 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">详细信息</h3>
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{t.created}: {new Date(podcast.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>{t.duration}: {podcast.duration}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  podcast.is_public 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {podcast.is_public ? t.public : t.private}
                </span>
              </div>
              {podcast.tags && (
                <div className="flex items-start text-sm text-gray-600">
                  <Tag className="w-4 h-4 mr-2 mt-0.5" />
                  <div className="flex flex-wrap gap-2">
                    {podcast.tags.split(',').map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag.trim()}
                      </span>
                    ))}
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