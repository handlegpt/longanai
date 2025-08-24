'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserFollowProps {
  currentUserEmail: string;
  targetUserEmail: string;
  language: 'cantonese' | 'mandarin' | 'english';
}

interface User {
  email: string;
  display_name: string;
  avatar_url?: string;
  followed_at: string;
}

const translations = {
  cantonese: {
    follow: '關注',
    unfollow: '取消關注',
    following: '關注中',
    followers: '粉絲',
    followingList: '關注列表',
    followersList: '粉絲列表',
    followSuccess: '關注成功！',
    unfollowSuccess: '取消關注成功！',
    error: '操作失敗，請重試',
    noFollowing: '暫無關注',
    noFollowers: '暫無粉絲',
    showFollowing: '查看關注',
    showFollowers: '查看粉絲',
  },
  mandarin: {
    follow: '关注',
    unfollow: '取消关注',
    following: '关注中',
    followers: '粉丝',
    followingList: '关注列表',
    followersList: '粉丝列表',
    followSuccess: '关注成功！',
    unfollowSuccess: '取消关注成功！',
    error: '操作失败，请重试',
    noFollowing: '暂无关注',
    noFollowers: '暂无粉丝',
    showFollowing: '查看关注',
    showFollowers: '查看粉丝',
  },
  english: {
    follow: 'Follow',
    unfollow: 'Unfollow',
    following: 'Following',
    followers: 'Followers',
    followingList: 'Following List',
    followersList: 'Followers List',
    followSuccess: 'Followed successfully!',
    unfollowSuccess: 'Unfollowed successfully!',
    error: 'Operation failed, please try again',
    noFollowing: 'No following yet',
    noFollowers: 'No followers yet',
    showFollowing: 'View Following',
    showFollowers: 'View Followers',
  }
};

export default function UserFollow({
  currentUserEmail,
  targetUserEmail,
  language
}: UserFollowProps) {
  const t = translations[language];
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [showFollowingList, setShowFollowingList] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 检查是否已关注
  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/social/following?user_email=${currentUserEmail}`);
      if (response.ok) {
        const data = await response.json();
        const isFollowingUser = data.following.some((user: User) => user.email === targetUserEmail);
        setIsFollowing(isFollowingUser);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  // 获取关注和粉丝数量
  const fetchFollowCounts = async () => {
    try {
      // 获取关注数量
      const followingResponse = await fetch(`/api/social/following?user_email=${targetUserEmail}`);
      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        setFollowingCount(followingData.following.length);
      }

      // 获取粉丝数量
      const followersResponse = await fetch(`/api/social/followers?user_email=${targetUserEmail}`);
      if (followersResponse.ok) {
        const followersData = await followersResponse.json();
        setFollowersCount(followersData.followers.length);
      }
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  };

  useEffect(() => {
    if (currentUserEmail && targetUserEmail) {
      checkFollowStatus();
      fetchFollowCounts();
    }
  }, [currentUserEmail, targetUserEmail]);

  // 关注/取消关注
  const handleFollow = async () => {
    if (!currentUserEmail) {
      toast.error('請先登入');
      return;
    }

    setLoading(true);
    try {
      const url = isFollowing 
        ? `/api/social/unfollow?following_email=${targetUserEmail}&user_email=${currentUserEmail}`
        : '/api/social/follow';
      
      const method = isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({
          following_email: targetUserEmail
        }) : undefined,
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        toast.success(isFollowing ? t.unfollowSuccess : t.followSuccess);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || t.error);
      }
    } catch (error) {
      console.error('Error handling follow:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  // 获取关注列表
  const fetchFollowingList = async () => {
    try {
      const response = await fetch(`/api/social/following?user_email=${targetUserEmail}`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following);
      }
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  };

  // 获取粉丝列表
  const fetchFollowersList = async () => {
    try {
      const response = await fetch(`/api/social/followers?user_email=${targetUserEmail}`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers);
      }
    } catch (error) {
      console.error('Error fetching followers list:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* 关注按钮 */}
      {currentUserEmail !== targetUserEmail && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isFollowing 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {isFollowing ? (
            <>
              <UserMinus className="w-5 h-5" />
              <span>{t.unfollow}</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>{t.follow}</span>
            </>
          )}
        </button>
      )}

      {/* 关注和粉丝统计 */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => {
            setShowFollowingList(!showFollowingList);
            if (!showFollowingList) {
              fetchFollowingList();
            }
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">{followingCount}</span>
          <span>{t.following}</span>
        </button>

        <button
          onClick={() => {
            setShowFollowersList(!showFollowersList);
            if (!showFollowersList) {
              fetchFollowersList();
            }
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">{followersCount}</span>
          <span>{t.followers}</span>
        </button>
      </div>

      {/* 关注列表 */}
      {showFollowingList && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t.followingList}</h3>
          {following.length === 0 ? (
            <p className="text-gray-500 text-center py-4">{t.noFollowing}</p>
          ) : (
            <div className="space-y-3">
              {following.map((user) => (
                <div key={user.email} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {user.display_name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.followed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 粉丝列表 */}
      {showFollowersList && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{t.followersList}</h3>
          {followers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">{t.noFollowers}</p>
          ) : (
            <div className="space-y-3">
              {followers.map((user) => (
                <div key={user.email} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.display_name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {user.display_name?.charAt(0) || user.email.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(user.followed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
