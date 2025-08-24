'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, MessageSquare, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommunityProps {
  userEmail: string;
  language: 'cantonese' | 'mandarin' | 'english';
}

interface CommunityData {
  id: number;
  name: string;
  description: string;
  creator_email: string;
  member_count: number;
  created_at: string;
}

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  user_email: string;
  user_display_name: string;
  podcast_id?: number;
  is_pinned: boolean;
  created_at: string;
}

const translations = {
  cantonese: {
    communities: '播客社區',
    createCommunity: '創建社區',
    joinCommunity: '加入社區',
    leaveCommunity: '離開社區',
    communityName: '社區名稱',
    communityDescription: '社區描述',
    isPublic: '公開社區',
    create: '創建',
    cancel: '取消',
    join: '加入',
    leave: '離開',
    members: '成員',
    posts: '帖子',
    createPost: '發布帖子',
    postTitle: '帖子標題',
    postContent: '帖子內容',
    submit: '提交',
    noCommunities: '暫無社區',
    noPosts: '暫無帖子',
    createSuccess: '創建成功！',
    joinSuccess: '加入成功！',
    leaveSuccess: '離開成功！',
    postSuccess: '發布成功！',
    error: '操作失敗，請重試',
    memberCount: '成員',
    postCount: '帖子',
    pinned: '置頂',
    latestPosts: '最新帖子',
    allCommunities: '所有社區',
  },
  mandarin: {
    communities: '播客社区',
    createCommunity: '创建社区',
    joinCommunity: '加入社区',
    leaveCommunity: '离开社区',
    communityName: '社区名称',
    communityDescription: '社区描述',
    isPublic: '公开社区',
    create: '创建',
    cancel: '取消',
    join: '加入',
    leave: '离开',
    members: '成员',
    posts: '帖子',
    createPost: '发布帖子',
    postTitle: '帖子标题',
    postContent: '帖子内容',
    submit: '提交',
    noCommunities: '暂无社区',
    noPosts: '暂无帖子',
    createSuccess: '创建成功！',
    joinSuccess: '加入成功！',
    leaveSuccess: '离开成功！',
    postSuccess: '发布成功！',
    error: '操作失败，请重试',
    memberCount: '成员',
    postCount: '帖子',
    pinned: '置顶',
    latestPosts: '最新帖子',
    allCommunities: '所有社区',
  },
  english: {
    communities: 'Podcast Communities',
    createCommunity: 'Create Community',
    joinCommunity: 'Join Community',
    leaveCommunity: 'Leave Community',
    communityName: 'Community Name',
    communityDescription: 'Community Description',
    isPublic: 'Public Community',
    create: 'Create',
    cancel: 'Cancel',
    join: 'Join',
    leave: 'Leave',
    members: 'Members',
    posts: 'Posts',
    createPost: 'Create Post',
    postTitle: 'Post Title',
    postContent: 'Post Content',
    submit: 'Submit',
    noCommunities: 'No communities yet',
    noPosts: 'No posts yet',
    createSuccess: 'Created successfully!',
    joinSuccess: 'Joined successfully!',
    leaveSuccess: 'Left successfully!',
    postSuccess: 'Posted successfully!',
    error: 'Operation failed, please try again',
    memberCount: 'members',
    postCount: 'posts',
    pinned: 'Pinned',
    latestPosts: 'Latest Posts',
    allCommunities: 'All Communities',
  }
};

export default function Community({
  userEmail,
  language
}: CommunityProps) {
  const t = translations[language];
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 表单状态
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  // 获取社区列表
  const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/social/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  // 获取社区帖子
  const fetchPosts = async (communityId: number) => {
    try {
      const response = await fetch(`/api/social/communities/${communityId}/posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  // 创建社区
  const handleCreateCommunity = async () => {
    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    if (!communityName.trim()) {
      toast.error('請輸入社區名稱');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: communityName,
          description: communityDescription,
          is_public: isPublic
        }),
      });

      if (response.ok) {
        toast.success(t.createSuccess);
        setShowCreateForm(false);
        setCommunityName('');
        setCommunityDescription('');
        setIsPublic(true);
        fetchCommunities();
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || t.error);
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  // 加入社区
  const handleJoinCommunity = async (communityId: number) => {
    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/social/communities/${communityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success(t.joinSuccess);
        fetchCommunities();
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || t.error);
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  // 创建帖子
  const handleCreatePost = async () => {
    if (!selectedCommunity) return;

    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('請填寫完整內容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/social/communities/${selectedCommunity.id}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: postTitle,
          content: postContent,
        }),
      });

      if (response.ok) {
        toast.success(t.postSuccess);
        setShowPostForm(false);
        setPostTitle('');
        setPostContent('');
        fetchPosts(selectedCommunity.id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || t.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题和创建按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.communities}</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>{t.createCommunity}</span>
        </button>
      </div>

      {/* 创建社区表单 */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t.createCommunity}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.communityName}
              </label>
              <input
                type="text"
                value={communityName}
                onChange={(e) => setCommunityName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="輸入社區名稱"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.communityDescription}
              </label>
              <textarea
                value={communityDescription}
                onChange={(e) => setCommunityDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="描述社區主題和規則"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                {t.isPublic}
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleCreateCommunity}
                disabled={loading || !communityName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '創建中...' : t.create}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setCommunityName('');
                  setCommunityDescription('');
                  setIsPublic(true);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 社区列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">{t.noCommunities}</p>
          </div>
        ) : (
          communities.map((community) => (
            <div key={community.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{community.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{community.member_count} {t.memberCount}</span>
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(community.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedCommunity(community);
                    fetchPosts(community.id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                >
                  {t.posts}
                </button>
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                >
                  {t.join}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 社区帖子 */}
      {selectedCommunity && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{selectedCommunity.name} - {t.latestPosts}</h3>
            <button
              onClick={() => setShowPostForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              <span>{t.createPost}</span>
            </button>
          </div>

          {/* 创建帖子表单 */}
          {showPostForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h4 className="text-lg font-semibold mb-4">{t.createPost}</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.postTitle}
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="輸入帖子標題"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.postContent}
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="寫下你的想法..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreatePost}
                    disabled={loading || !postTitle.trim() || !postContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? '發布中...' : t.submit}
                  </button>
                  <button
                    onClick={() => {
                      setShowPostForm(false);
                      setPostTitle('');
                      setPostContent('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 帖子列表 */}
          {posts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t.noPosts}</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{post.title}</h4>
                      {post.is_pinned && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {t.pinned}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.user_display_name || post.user_email}</span>
                    {post.podcast_id && (
                      <span className="text-blue-600">相關播客 #{post.podcast_id}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
