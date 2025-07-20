'use client';

import { motion } from 'framer-motion';
import { User, UserCheck, Users } from 'lucide-react';

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
}

const voices = [
  {
    id: 'young-lady',
    nameKey: 'youngLadyName',
    descKey: 'youngLadyDesc',
    icon: User,
    color: 'bg-pink-500',
  },
  {
    id: 'young-man',
    nameKey: 'youngManName',
    descKey: 'youngManDesc',
    icon: UserCheck,
    color: 'bg-blue-500',
  },
  {
    id: 'grandma',
    nameKey: 'grandmaName',
    descKey: 'grandmaDesc',
    icon: Users,
    color: 'bg-purple-500',
  },
];

export default function VoiceSelector({ selectedVoice, onVoiceChange, translations }: VoiceSelectorProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.title}</h3>
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
                    <h4 className="font-medium text-gray-900">{translations[voice.nameKey as keyof typeof translations]}</h4>
                    <p className="text-sm text-gray-600">{translations[voice.descKey as keyof typeof translations]}</p>
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