import type { Metadata } from 'next';

export const seoConfig: Metadata = {
  title: {
    default: '龙眼AI - 智能粤语播客生成平台',
    template: '%s | 龙眼AI'
  },
  description: '用AI技术，一键生成地道嘅粤语播客内容。支持靓女、靓仔两种音色，情感调节，速度控制，让每个字都充满情感。',
  keywords: [
    '粤语播客',
    'AI语音生成',
    '龙眼AI',
    '广东话播客',
    '语音合成',
    '播客制作',
    'TTS技术',
    '粤语内容创作',
    '智能播客平台',
    '语音AI',
    'Cantonese podcast',
    'AI voice generation',
    'Longan AI',
    'Guangdong dialect',
    'Voice synthesis',
    'Podcast creation'
  ],
  authors: [{ name: '龙眼AI团队' }],
  creator: '龙眼AI',
  publisher: '龙眼AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://longan.ai'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/zh-CN',
      'zh-HK': '/zh-HK',
      'en-US': '/en-US',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://longan.ai',
    siteName: '龙眼AI',
    title: '龙眼AI - 智能粤语播客生成平台',
    description: '用AI技术，一键生成地道嘅粤语播客内容。支持靓女、靓仔两种音色，情感调节，速度控制。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '龙眼AI - 智能粤语播客生成平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '龙眼AI - 智能粤语播客生成平台',
    description: '用AI技术，一键生成地道嘅粤语播客内容',
    images: ['/og-image.png'],
    creator: '@longanai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'technology',
  classification: 'AI播客生成平台',
  other: {
    'baidu-site-verification': 'your-baidu-verification-code',
    'msvalidate.01': 'your-bing-verification-code',
  },
};

// 结构化数据
export const structuredData = {
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "龙眼AI",
    "alternateName": "Longan AI",
    "url": "https://longan.ai",
    "description": "智能粤语播客生成平台",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://longan.ai/explore?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "龙眼AI",
    "url": "https://longan.ai",
    "logo": "https://longan.ai/logo.png",
    "description": "智能粤语播客生成平台",
    "sameAs": [
      "https://twitter.com/longanai",
      "https://github.com/longanai"
    ]
  },
  product: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "龙眼AI播客生成器",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "description": "AI驱动的粤语播客生成平台",
    "url": "https://longan.ai",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
}; 