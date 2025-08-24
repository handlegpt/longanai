'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Share2, Heart, MessageCircle, Download, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PodcastInteraction from './social/PodcastInteraction';

interface PodcastPlayerProps {
  podcast: {
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
  };
  userEmail?: string;
  language: 'cantonese' | 'mandarin' | 'english';
  onClose?: () => void;
}

const translations = {
  cantonese: {
    play: '播放',
    pause: '暫停',
    mute: '靜音',
    unmute: '取消靜音',
    download: '下載',
    share: '分享',
    duration: '時長',
    by: 'by',
    created: '創建於',
    tags: '標籤',
    public: '公開',
    private: '私密',
    noDescription: '暫無描述',
    noTags: '暫無標籤',
    loading: '載入中...',
    error: '播放失敗',
    networkError: '網絡錯誤',
  },
  mandarin: {
    play: '播放',
    pause: '暂停',
    mute: '静音',
    unmute: '取消静音',
    download: '下载',
    share: '分享',
    duration: '时长',
    by: 'by',
    created: '创建于',
    tags: '标签',
    public: '公开',
    private: '私密',
    noDescription: '暂无描述',
    noTags: '暂无标签',
    loading: '加载中...',
    error: '播放失败',
    networkError: '网络错误',
  },
  english: {
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    download: 'Download',
    share: 'Share',
    duration: 'Duration',
    by: 'by',
    created: 'Created',
    tags: 'Tags',
    public: 'Public',
    private: 'Private',
    noDescription: 'No description',
    noTags: 'No tags',
    loading: 'Loading...',
    error: 'Playback failed',
    networkError: 'Network error',
  }
};

export default function PodcastPlayer({
  podcast,
  userEmail,
  language,
  onClose
}: PodcastPlayerProps) {
  const t = translations[language];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 播放/暂停
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // 静音/取消静音
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 音量控制
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 进度控制
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // 下载音频
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = podcast.audio_url;
    link.download = `${podcast.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('开始下载');
  };

  // 分享播客
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/podcast/${podcast.id}`;
    const shareText = `${podcast.title} - ${t.by} ${podcast.user_display_name || podcast.user_email.split('@')[0]}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: podcast.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // 回退到复制链接
      navigator.clipboard.writeText(shareUrl);
      toast.success('链接已复制到剪贴板');
    }
  };

  // 音频事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setError(t.error);
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [t.error]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 音频元素 */}
      <audio
        ref={audioRef}
        src={podcast.audio_url}
        preload="metadata"
        onError={() => setError(t.error)}
      />

      {/* 封面和基本信息 */}
      <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
        {podcast.cover_image_url ? (
          <img
            src={podcast.cover_image_url}
            alt={podcast.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl">🎙️</div>
          </div>
        )}
        
        {/* 播放状态覆盖层 */}
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <motion.button
            onClick={togglePlay}
            className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-100 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 text-gray-800" />
            ) : (
              <Play className="w-8 h-8 text-gray-800 ml-1" />
            )}
          </motion.button>
        </div>

        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
          >
            ×
          </button>
        )}
      </div>

      {/* 播客信息 */}
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{podcast.title}</h1>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <User className="w-4 h-4 mr-1" />
            <span>{t.by} {podcast.user_display_name || podcast.user_email.split('@')[0]}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>{podcast.duration}</span>
            <span className="mx-2">•</span>
            <span>{new Date(podcast.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              podcast.is_public 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {podcast.is_public ? t.public : t.private}
            </span>
          </div>
        </div>

        {/* 描述 */}
        {podcast.description && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
          </div>
        )}

        {/* 标签 */}
        {podcast.tags && (
          <div className="mb-4">
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

        {/* 播放控制 */}
        <div className="mb-6">
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title={t.download}
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title={t.share}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* 社交互动功能 */}
        {userEmail && (
          <div className="border-t pt-4">
            <PodcastInteraction
              podcastId={podcast.id}
              userEmail={userEmail}
              language={language}
            />
          </div>
        )}
      </div>

      {/* 自定义样式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
