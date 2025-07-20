'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Download, Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PodcastHistory {
  id: string;
  title: string;
  voice: string;
  duration: string;
  createdAt: string;
  audioUrl: string;
}

export default function HistoryPanel() {
  const [history, setHistory] = useState<PodcastHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 从API获取历史记录
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/podcast/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handlePlay = (audioUrl: string) => {
    // TODO: 实现音频播放逻辑
    toast.success('开始播放');
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    link.click();
    toast.success('开始下载');
  };

  const handleShare = (audioUrl: string) => {
    navigator.share?.({
      title: '龙眼AI播客',
      text: '我用龙眼AI生成嘅粤语播客',
      url: audioUrl,
    }).catch(() => {
      navigator.clipboard.writeText(audioUrl);
      toast.success('链接已复制到剪贴板');
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/podcast/history/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success('删除成功');
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('网络错误');
    }
  };

  const getVoiceName = (voice: string) => {
    const voiceMap: Record<string, string> = {
      'young-lady': '靓女',
      'young-man': '靓仔',
      'grandma': '阿嫲',
    };
    return voiceMap[voice] || voice;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">历史记录</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>共 {history.length} 个播客</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">暂无历史记录</p>
          <p className="text-sm text-gray-500 mt-2">生成嘅播客会显示喺呢度</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>主持人: {getVoiceName(item.voice)}</span>
                    <span>时长: {item.duration}</span>
                    <span>创建: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlay(item.audioUrl)}
                    className="p-2 rounded-full bg-primary-100 hover:bg-primary-200"
                    title="播放"
                  >
                    <Play className="w-4 h-4 text-primary-600" />
                  </button>
                  
                  <button
                    onClick={() => handleDownload(item.audioUrl, item.title)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    title="下载"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => handleShare(item.audioUrl)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    title="分享"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 