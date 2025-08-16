'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'website' | 'organization' | 'product' | 'article';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // 添加结构化数据到页面
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      // 清理
      document.head.removeChild(script);
    };
  }, [data]);

  return null;
}

// 网站结构化数据
export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "龍眼AI",
  "alternateName": "Longan AI",
  "url": "https://longan.ai",
  "description": "智能粤语播客生成平台",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://longan.ai/explore?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

// 组织结构化数据
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "龍眼AI",
  "url": "https://longan.ai",
  "logo": "https://longan.ai/logo.png",
  "description": "智能粤语播客生成平台",
  "sameAs": [
    "https://twitter.com/longanai",
    "https://github.com/longanai"
  ]
};

// 产品结构化数据
export const productStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "龍眼AI播客生成器",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web Browser",
  "description": "AI驱动的粤语播客生成平台",
  "url": "https://longan.ai",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}; 