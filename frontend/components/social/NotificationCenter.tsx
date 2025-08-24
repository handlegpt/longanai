'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationCenterProps {
  userEmail: string;
  language: 'cantonese' | 'mandarin' | 'english';
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  sender_email: string;
  sender_name: string;
  related_id: number;
  related_type: string;
  is_read: boolean;
  created_at: string;
}

const translations = {
  cantonese: {
    notifications: '通知',
    noNotifications: '暫無通知',
    markAllRead: '全部標記為已讀',
    deleteAll: '刪除所有通知',
    settings: '通知設置',
    follow: '關注',
    comment: '評論',
    like: '點讚',
    share: '分享',
    community: '社區',
    ago: '前',
    minutes: '分鐘',
    hours: '小時',
    days: '天',
    justNow: '剛剛',
    markRead: '標記已讀',
    delete: '刪除',
    close: '關閉',
  },
  mandarin: {
    notifications: '通知',
    noNotifications: '暂无通知',
    markAllRead: '全部标记为已读',
    deleteAll: '删除所有通知',
    settings: '通知设置',
    follow: '关注',
    comment: '评论',
    like: '点赞',
    share: '分享',
    community: '社区',
    ago: '前',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    justNow: '刚刚',
    markRead: '标记已读',
    delete: '删除',
    close: '关闭',
  },
  english: {
    notifications: 'Notifications',
    noNotifications: 'No notifications',
    markAllRead: 'Mark all as read',
    deleteAll: 'Delete all',
    settings: 'Settings',
    follow: 'Follow',
    comment: 'Comment',
    like: 'Like',
    share: 'Share',
    community: 'Community',
    ago: 'ago',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    justNow: 'just now',
    markRead: 'Mark as read',
    delete: 'Delete',
    close: 'Close',
  }
};

export default function NotificationCenter({
  userEmail,
  language,
  isOpen,
  onClose
}: NotificationCenterProps) {
  const t = translations[language];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 获取通知列表
  const fetchNotifications = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`/api/notifications?user_email=${userEmail}&size=50`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // 获取未读数量
  const fetchUnreadCount = async () => {
    if (!userEmail) return;
    
    try {
      const response = await fetch(`/api/notifications/unread-count?user_email=${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, userEmail]);

  // 定期刷新未读数量
  useEffect(() => {
    const interval = setInterval(() => {
      if (userEmail) {
        fetchUnreadCount();
      }
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, [userEmail]);

  // 标记通知为已读
  const markAsRead = async (notificationId: number) => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // 标记所有为已读
  const markAllAsRead = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success('所有通知已标记为已读');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除通知
  const deleteNotification = async (notificationId: number) => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        if (!notifications.find(n => n.id === notificationId)?.is_read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return t.justNow;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t.minutes} ${t.ago}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${t.hours} ${t.ago}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${t.days} ${t.ago}`;
    }
  };

  // 获取通知类型图标和颜色
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'follow':
        return { icon: '👤', color: 'bg-blue-100 text-blue-600' };
      case 'comment':
        return { icon: '💬', color: 'bg-green-100 text-green-600' };
      case 'like':
        return { icon: '❤️', color: 'bg-red-100 text-red-600' };
      case 'share':
        return { icon: '📤', color: 'bg-purple-100 text-purple-600' };
      case 'community':
        return { icon: '🏘️', color: 'bg-orange-100 text-orange-600' };
      default:
        return { icon: '🔔', color: 'bg-gray-100 text-gray-600' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* 通知面板 */}
      <div className="relative w-full max-w-md max-h-[80vh] bg-white rounded-t-lg sm:rounded-lg shadow-xl transform transition-all">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">{t.notifications}</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              disabled={loading || unreadCount === 0}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              title={t.markAllRead}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800"
              title={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p>{t.noNotifications}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      notification.is_read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* 通知图标 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${style.color}`}>
                        {style.icon}
                      </div>
                      
                      {/* 通知内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.is_read ? 'text-gray-900' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.content && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.content}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                          
                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={loading}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                title={t.markRead}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              disabled={loading}
                              className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                              title={t.delete}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
