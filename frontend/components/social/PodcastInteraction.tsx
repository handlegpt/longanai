'use client';

import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface PodcastInteractionProps {
  podcastId: number;
  userEmail: string;
  initialLikes?: number;
  initialComments?: number;
  language: 'cantonese' | 'mandarin' | 'english';
}

interface Comment {
  id: number;
  content: string;
  rating?: number;
  user_email: string;
  user_display_name: string;
  created_at: string;
}

const translations = {
  cantonese: {
    like: '讚好',
    unlike: '取消讚好',
    comment: '評論',
    share: '分享',
    rating: '評分',
    addComment: '添加評論',
    commentPlaceholder: '寫下你的評論...',
    ratingPlaceholder: '選擇評分 (可選)',
    submit: '提交',
    cancel: '取消',
    shareSuccess: '分享成功！',
    likeSuccess: '讚好成功！',
    unlikeSuccess: '取消讚好成功！',
    commentSuccess: '評論提交成功！',
    error: '操作失敗，請重試',
    likes: '讚好',
    comments: '評論',
    noComments: '暫無評論',
    averageRating: '平均評分',
    stars: '星',
  },
  mandarin: {
    like: '点赞',
    unlike: '取消点赞',
    comment: '评论',
    share: '分享',
    rating: '评分',
    addComment: '添加评论',
    commentPlaceholder: '写下你的评论...',
    ratingPlaceholder: '选择评分 (可选)',
    submit: '提交',
    cancel: '取消',
    shareSuccess: '分享成功！',
    likeSuccess: '点赞成功！',
    unlikeSuccess: '取消点赞成功！',
    commentSuccess: '评论提交成功！',
    error: '操作失败，请重试',
    likes: '点赞',
    comments: '评论',
    noComments: '暂无评论',
    averageRating: '平均评分',
    stars: '星',
  },
  english: {
    like: 'Like',
    unlike: 'Unlike',
    comment: 'Comment',
    share: 'Share',
    rating: 'Rating',
    addComment: 'Add Comment',
    commentPlaceholder: 'Write your comment...',
    ratingPlaceholder: 'Select rating (optional)',
    submit: 'Submit',
    cancel: 'Cancel',
    shareSuccess: 'Shared successfully!',
    likeSuccess: 'Liked successfully!',
    unlikeSuccess: 'Unliked successfully!',
    commentSuccess: 'Comment submitted successfully!',
    error: 'Operation failed, please try again',
    likes: 'likes',
    comments: 'comments',
    noComments: 'No comments yet',
    averageRating: 'Average Rating',
    stars: 'stars',
  }
};

export default function PodcastInteraction({
  podcastId,
  userEmail,
  initialLikes = 0,
  initialComments = 0,
  language
}: PodcastInteractionProps) {
  const t = translations[language];
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取评论
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/social/podcasts/${podcastId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // 获取点赞数
  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/social/podcasts/${podcastId}/likes`);
      if (response.ok) {
        const data = await response.json();
        setLikes(data.likes_count);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  useEffect(() => {
    fetchComments();
    fetchLikes();
  }, [podcastId]);

  // 点赞/取消点赞
  const handleLike = async () => {
    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    setLoading(true);
    try {
      const url = isLiked 
        ? `/api/social/podcasts/${podcastId}/unlike`
        : `/api/social/podcasts/${podcastId}/like`;
      
      const method = isLiked ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({}) : undefined,
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        toast.success(isLiked ? t.unlikeSuccess : t.likeSuccess);
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('請輸入評論內容');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/social/podcasts/${podcastId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          rating: rating
        }),
      });

      if (response.ok) {
        toast.success(t.commentSuccess);
        setCommentContent('');
        setRating(null);
        setShowCommentForm(false);
        fetchComments();
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  // 分享播客
  const handleShare = async (shareType: string) => {
    if (!userEmail) {
      toast.error('請先登入');
      return;
    }

    try {
      const response = await fetch(`/api/social/podcasts/${podcastId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          share_type: shareType
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 根据分享类型执行不同操作
        switch (shareType) {
          case 'link':
            navigator.clipboard.writeText(data.share_url);
            toast.success('分享連結已複製到剪貼板');
            break;
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=Check out this podcast!&url=${encodeURIComponent(data.share_url)}`);
            break;
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.share_url)}`);
            break;
          case 'wechat':
            // 微信分享需要特殊处理
            toast.success('請使用微信掃描二維碼分享');
            break;
          default:
            toast.success(t.shareSuccess);
        }
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      console.error('Error sharing podcast:', error);
      toast.error(t.error);
    }
  };

  // 计算平均评分
  const averageRating = comments.length > 0 
    ? comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / comments.filter(c => c.rating).length
    : 0;

  return (
    <div className="space-y-4">
      {/* 互动按钮 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isLiked 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t.addComment}</span>
          </button>
        </div>

        <div className="relative">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
            <span>{t.share}</span>
          </button>
          
          {/* 分享下拉菜单 */}
          <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
            <button
              onClick={() => handleShare('link')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
            >
              複製連結
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              分享到 Twitter
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              分享到 Facebook
            </button>
            <button
              onClick={() => handleShare('wechat')}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
            >
              分享到微信
            </button>
          </div>
        </div>
      </div>

      {/* 评论表单 */}
      {showCommentForm && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder={t.commentPlaceholder}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.rating}
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? null : star)}
                  className={`p-1 rounded ${
                    rating && rating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleSubmitComment}
              disabled={loading || !commentContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '提交中...' : t.submit}
            </button>
            <button
              onClick={() => {
                setShowCommentForm(false);
                setCommentContent('');
                setRating(null);
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      {showComments && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t.comments}</h3>
            {averageRating > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t.averageRating}:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
              </div>
            )}
          </div>

          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">{t.noComments}</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comment.user_display_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  {comment.rating && (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">{t.rating}:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= comment.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
