'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Play, Pause, Download, Share2, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PodcastGeneratorProps {
  selectedVoice: string;
  translations: {
    title: string;
    contentLabel: string;
    contentPlaceholder: string;
    emotionLabel: string;
    speedLabel: string;
    normal: string;
    happy: string;
    sad: string;
    excited: string;
    calm: string;
    generateButton: string;
    generating: string;
    generateSuccess: string;
    generateFailed: string;
    networkError: string;
    contentRequired: string;
    generatedResult: string;
    download: string;
    share: string;
    shareTitle: string;
    shareText: string;
    linkCopied: string;
  };
}

export default function PodcastGenerator({ selectedVoice, translations }: PodcastGeneratorProps) {
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [emotion, setEmotion] = useState('normal');
  const [speed, setSpeed] = useState(1.0);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error(translations.contentRequired);
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
        toast.success(translations.generateSuccess);
      } else {
        toast.error(translations.generateFailed);
      }
    } catch (error) {
      toast.error(translations.networkError);
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
        title: translations.shareTitle,
        text: translations.shareText,
        url: audioUrl,
      }).catch(() => {
        // 如果不支持原生分享，复制链接
        navigator.clipboard.writeText(audioUrl);
        toast.success(translations.linkCopied);
      });
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.title}</h3>
      
      {/* Text Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.contentLabel}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={translations.contentPlaceholder}
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.emotionLabel}
          </label>
          <select
            value={emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="normal">{translations.normal}</option>
            <option value="happy">{translations.happy}</option>
            <option value="sad">{translations.sad}</option>
            <option value="excited">{translations.excited}</option>
            <option value="calm">{translations.calm}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {translations.speedLabel}
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
        <span>{isGenerating ? translations.generating : translations.generateButton}</span>
      </button>

      {/* Audio Player */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t pt-4"
        >
          <h4 className="font-medium text-gray-900 mb-3">{translations.generatedResult}</h4>
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
                title={translations.download}
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                title={translations.share}
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