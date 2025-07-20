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

interface HistoryPanelProps {
  translations: {
    title: string;
    totalPodcasts: string;
    loading: string;
    noHistory: string;
    noHistorySubtitle: string;
    host: string;
    duration: string;
    created: string;
    play: string;
    download: string;
    share: string;
    delete: string;
    playSuccess: string;
    downloadSuccess: string;
    shareSuccess: string;
    deleteSuccess: string;
    deleteFailed: string;
    networkError: string;
    shareText: string;
    shareTitle: string;
    linkCopied: string;
  };
}

export default function HistoryPanel({ translations }: HistoryPanelProps) {
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
    toast.success(translations.playSuccess);
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    link.click();
    toast.success(translations.downloadSuccess);
  };

  const handleShare = (audioUrl: string) => {
    navigator.share?.({
      title: translations.shareTitle,
      text: translations.shareText,
      url: audioUrl,
    }).catch(() => {
      navigator.clipboard.writeText(audioUrl);
      toast.success(translations.linkCopied);
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/podcast/history/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        toast.success(translations.deleteSuccess);
      } else {
        toast.error(translations.deleteFailed);
      }
    } catch (error) {
      toast.error(translations.networkError);
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
          <span className="ml-3 text-gray-600">{translations.loading}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{translations.title}</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{translations.totalPodcasts.replace('{count}', history.length.toString())}</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{translations.noHistory}</p>
          <p className="text-sm text-gray-500 mt-2">{translations.noHistorySubtitle}</p>
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
                    <span>{translations.host}: {getVoiceName(item.voice)}</span>
                    <span>{translations.duration}: {item.duration}</span>
                    <span>{translations.created}: {new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlay(item.audioUrl)}
                    className="p-2 rounded-full bg-primary-100 hover:bg-primary-200"
                    title={translations.play}
                  >
                    <Play className="w-4 h-4 text-primary-600" />
                  </button>
                  
                  <button
                    onClick={() => handleDownload(item.audioUrl, item.title)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    title={translations.download}
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => handleShare(item.audioUrl)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                    title={translations.share}
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-full bg-red-100 hover:bg-red-200"
                    title={translations.delete}
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