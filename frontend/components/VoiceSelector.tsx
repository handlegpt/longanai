'use client';

import { motion } from 'framer-motion';
import { User, UserCheck, Users, Mic, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  translations: {
    title: string;
    youngLadyName: string;
    youngLadyDesc: string;
    youngManName: string;
    youngManDesc: string;
    grandmaName: string;
    grandmaDesc: string;
  };
  selectedLanguage?: string; // 添加语言参数
}

interface GoogleVoice {
  name: string;
  display_name: string;
  description: string;
  gender: string;
}

// 默认的Edge TTS音色
const edgeVoices = [
  {
    id: 'young-lady',
    nameKey: 'youngLadyName',
    descKey: 'youngLadyDesc',
    icon: User,
    color: 'bg-pink-500',
    type: 'edge'
  },
  {
    id: 'young-man',
    nameKey: 'youngManName',
    descKey: 'youngManDesc',
    icon: UserCheck,
    color: 'bg-blue-500',
    type: 'edge'
  },
  {
    id: 'grandma',
    nameKey: 'grandmaName',
    descKey: 'grandmaDesc',
    icon: Users,
    color: 'bg-purple-500',
    type: 'edge'
  },
];

export default function VoiceSelector({ selectedVoice, onVoiceChange, translations, selectedLanguage = 'cantonese' }: VoiceSelectorProps) {
  const [googleVoices, setGoogleVoices] = useState<GoogleVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [useGoogleTTS, setUseGoogleTTS] = useState(false);

  // 获取Google TTS音色
  useEffect(() => {
    const fetchGoogleVoices = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/tts/voices/${selectedLanguage}`);
        if (response.ok) {
          const data = await response.json();
          setGoogleVoices(data.voices || []);
        }
      } catch (error) {
        console.error('Failed to fetch Google voices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoogleVoices();
  }, [selectedLanguage]);

  // 合并所有音色，避免重复
  const allVoices = [
    ...edgeVoices,
    ...googleVoices
      .filter((voice, index) => {
        // 过滤掉与Edge TTS音色名称重复的Google TTS音色
        const edgeVoiceNames = edgeVoices.map(v => 
          translations[(v as any).nameKey as keyof typeof translations]
        );
        return !edgeVoiceNames.includes(voice.display_name);
      })
      .map((voice, index) => ({
        id: `google-${(voice as any).name}`,
        name: voice.display_name,
        description: (voice as any).description,
        icon: index % 2 === 0 ? Mic : Volume2,
        color: index % 2 === 0 ? 'bg-green-500' : 'bg-orange-500',
        type: 'google',
        googleVoice: voice
      }))
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{translations.title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseGoogleTTS(false)}
            className={`px-3 py-1 rounded text-sm ${
              !useGoogleTTS ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Edge TTS
          </button>
          <button
            onClick={() => setUseGoogleTTS(true)}
            className={`px-3 py-1 rounded text-sm ${
              useGoogleTTS ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            Google TTS
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allVoices
          .filter(voice => {
            if (useGoogleTTS) {
              return voice.type === 'google';
            } else {
              return voice.type === 'edge';
            }
          })
          .map((voice) => {
            const Icon = voice.icon;
            const isSelected = selectedVoice === voice.id;
            
            return (
              <motion.div
                key={voice.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onVoiceChange(voice.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${voice.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">
                        {voice.type === 'edge' 
                          ? translations[(voice as any).nameKey as keyof typeof translations]
                          : (voice as any).name
                        }
                      </h4>
                      <p className="text-sm text-gray-600">
                        {voice.type === 'edge'
                          ? translations[(voice as any).descKey as keyof typeof translations]
                          : (voice as any).description
                        }
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            );
          })}
      </div>
      
      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">加载音色中...</p>
        </div>
      )}
    </div>
  );
} 