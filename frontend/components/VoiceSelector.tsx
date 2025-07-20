'use client';

import { motion } from 'framer-motion';
import { User, UserCheck, Users } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

const voices = [
  {
    id: 'young-lady',
    name: '靓女',
    description: '温柔亲切，适合生活分享同情感内容',
    icon: User,
    color: 'bg-pink-500',
  },
  {
    id: 'young-man',
    name: '靓仔',
    description: '活力四射，适合娱乐节目同新闻播报',
    icon: UserCheck,
    color: 'bg-blue-500',
  },
  {
    id: 'grandma',
    name: '阿嫲',
    description: '慈祥温暖，适合故事讲述同传统文化',
    icon: Users,
    color: 'bg-purple-500',
  },
];

export default function VoiceSelector({ selectedVoice, onVoiceChange }: VoiceSelectorProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择播客主持人</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {voices.map((voice) => {
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
                    <h4 className="font-medium text-gray-900">{voice.name}</h4>
                    <p className="text-sm text-gray-600">{voice.description}</p>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 