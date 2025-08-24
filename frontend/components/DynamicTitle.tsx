'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const titles = {
  cantonese: '龍眼AI - 用 AI 講粵語，做你自己嘅 Podcast',
  mandarin: '龍眼AI - 用 AI 讲粤语，做你自己的 Podcast',
  english: 'Longan AI - Generate Cantonese Podcasts with AI'
};

export default function DynamicTitle() {
  const { language } = useLanguage();

  useEffect(() => {
    const title = titles[language as keyof typeof titles] || titles.cantonese;
    document.title = title;
  }, [language]);

  return null;
}
