'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Pause, Download, Share2, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PodcastGeneratorProps {
  selectedVoice: string;
}

export default function PodcastGenerator({ selectedVoice }: PodcastGeneratorProps) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [emotion, setEmotion] = useState('normal');
  const [speed, setSpeed] = useState(1.0);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('请输入播客内容');
      return;
    }

    setIsGenerating(true);
    try {
      // TODO: 调用后端API生成播客
      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: selectedVoice,
          emotion,
          speed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAudioUrl(data.audioUrl);
        toast.success('播客生成成功！');
      } else {
        toast.error('生成失败，请重试');
      }
    } catch (error) {
      toast.error('网络错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlay = () => {
    if (audioUrl) {
      setIsPlaying(!isPlaying);
      // TODO: 实现音频播放逻辑
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'longanai-podcast.mp3';
      link.click();
    }
  };

  const handleShare = () => {
    if (audioUrl) {
      navigator.share?.({
        title: '龙眼AI播客',
        text: '我用龙眼AI生成嘅粤语播客',
        url: audioUrl,
      }).catch(() => {
        // 如果不支持原生分享，复制链接
        navigator.clipboard.writeText(audioUrl);
        toast.success('链接已复制到剪贴板');
      });
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">播客内容生成</h3>
      
      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          播客内容
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入你嘅播客内容..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            情感强度
          </label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="normal">正常</option>
            <option value="happy">开心</option>
            <option value="sad">悲伤</option>
            <option value="excited">兴奋</option>
            <option value="calm">平静</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            播放速度
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 mt-1">{speed}x</div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
      >
        <Mic className="w-5 h-5" />
        <span>{isGenerating ? '生成中...' : '生成播客'}</span>
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t pt-4"
        >
          <h4 className="font-medium text-gray-900 mb-3">生成结果</h4>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlay}
              className="p-2 rounded-full bg-primary-100 hover:bg-primary-200"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-600" />
              ) : (
                <Play className="w-5 h-5 text-primary-600" />
              )}
            </button>
            
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                title="下载"
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                title="分享"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 