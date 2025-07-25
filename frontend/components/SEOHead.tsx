'use client';

import { useEffect } from 'react';

interface SEOHeadProps {
  structuredData?: any;
}

export default function SEOHead({ structuredData }: SEOHeadProps) {
  useEffect(() => {
    if (structuredData) {
      // 添加结构化数据到页面
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        // 清理
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [structuredData]);

  return null;
} 