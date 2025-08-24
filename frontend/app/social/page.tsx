'use client';

import React, { useState } from 'react';
import { Users, MessageCircle, Heart, Share2 } from 'lucide-react';
import Community from '@/components/social/Community';
import UserFollow from '@/components/social/UserFollow';
import { useLanguage } from '@/context/LanguageContext';

const translations = {
  cantonese: {
    title: '社交功能',
    subtitle: '與其他播客創作者互動，加入社區，分享你的作品',
    communities: '播客社區',
    communitiesDesc: '加入主題社區，與志同道合的創作者交流',
    following: '關注系統',
    followingDesc: '關注你喜歡的創作者，查看他們的動態',
    interactions: '播客互動',
    interactionsDesc: '點讚、評論、分享你喜歡的播客',
    features: '功能特色',
    feature1: '創建和加入播客主題社區',
    feature2: '關注其他創作者，建立社交網絡',
    feature3: '對播客進行評論和評分',
    feature4: '點讚和分享喜歡的播客',
    feature5: '在社區中發布帖子和討論',
    feature6: '查看關注創作者的最新作品',
  },
  mandarin: {
    title: '社交功能',
    subtitle: '与其他播客创作者互动，加入社区，分享你的作品',
    communities: '播客社区',
    communitiesDesc: '加入主题社区，与志同道合的创作者交流',
    following: '关注系统',
    followingDesc: '关注你喜欢的创作者，查看他们的动态',
    interactions: '播客互动',
    interactionsDesc: '点赞、评论、分享你喜欢的播客',
    features: '功能特色',
    feature1: '创建和加入播客主题社区',
    feature2: '关注其他创作者，建立社交网络',
    feature3: '对播客进行评论和评分',
    feature4: '点赞和分享喜欢的播客',
    feature5: '在社区中发布帖子和讨论',
    feature6: '查看关注创作者的最新作品',
  },
  english: {
    title: 'Social Features',
    subtitle: 'Interact with other podcast creators, join communities, and share your work',
    communities: 'Podcast Communities',
    communitiesDesc: 'Join themed communities and connect with like-minded creators',
    following: 'Follow System',
    followingDesc: 'Follow creators you like and see their updates',
    interactions: 'Podcast Interactions',
    interactionsDesc: 'Like, comment, and share podcasts you enjoy',
    features: 'Features',
    feature1: 'Create and join podcast-themed communities',
    feature2: 'Follow other creators and build social networks',
    feature3: 'Comment and rate podcasts',
    feature4: 'Like and share favorite podcasts',
    feature5: 'Post and discuss in communities',
    feature6: 'View latest works from followed creators',
  }
};

export default function SocialPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('communities');
  const [userEmail, setUserEmail] = useState(''); // 这里应该从用户状态获取

  // 模拟用户邮箱，实际应该从用户状态获取
  React.useEffect(() => {
    // 从localStorage或其他地方获取用户邮箱
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const tabs = [
    {
      id: 'communities',
      name: t.communities,
      icon: Users,
      description: t.communitiesDesc,
    },
    {
      id: 'following',
      name: t.following,
      icon: Users,
      description: t.followingDesc,
    },
    {
      id: 'interactions',
      name: t.interactions,
      icon: Heart,
      description: t.interactionsDesc,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* 功能特色 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t.features}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature1}</h3>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature2}</h3>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <MessageCircle className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature3}</h3>
            </div>
            <div className="bg-red-50 p-6 rounded-lg">
              <Heart className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature4}</h3>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <MessageCircle className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature5}</h3>
            </div>
            <div className="bg-indigo-50 p-6 rounded-lg">
              <Share2 className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">{t.feature6}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 标签页内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'communities' && (
          <Community userEmail={userEmail} language={language} />
        )}
        
        {activeTab === 'following' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.following}</h2>
              <p className="text-gray-600">{t.followingDesc}</p>
            </div>
            
            {/* 这里可以添加关注功能的演示或说明 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">關注功能說明</h3>
              <p className="text-gray-600 mb-4">
                關注功能允許你關注其他播客創作者，查看他們的動態和最新作品。
                在播客詳情頁面可以看到創作者信息，並進行關注操作。
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  💡 提示：在播客列表或詳情頁面中，你可以看到創作者信息並進行關注操作。
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'interactions' && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.interactions}</h2>
              <p className="text-gray-600">{t.interactionsDesc}</p>
            </div>
            
            {/* 这里可以添加互动功能的演示或说明 */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">播客互動功能</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">點讚</h4>
                  <p className="text-sm text-gray-600">為你喜歡的播客點讚</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">評論</h4>
                  <p className="text-sm text-gray-600">留下你的評論和評分</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Share2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-2">分享</h4>
                  <p className="text-sm text-gray-600">分享播客到社交媒體</p>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800">
                  💡 提示：在播客播放頁面中，你可以看到互動按鈕並進行點讚、評論、分享等操作。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
