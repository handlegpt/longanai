import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import { LanguageProvider } from '@/context/LanguageContext';
import DynamicTitle from '@/components/DynamicTitle';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '龍眼AI - 用 AI 講粵語，做你自己嘅 Podcast',
  description: '用AI技术，一键生成地道嘅粤语播客内容',
  keywords: '粤语,播客,AI,语音生成,龍眼AI,longan ai,longan podcast',
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 全局 polyfill for crypto.randomUUID */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== "undefined") {
              if (window.crypto && typeof window.crypto.randomUUID !== "function") {
                window.crypto.randomUUID = function() {
                  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    const v = c === "x" ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                };
              }
              if (!window.crypto) {
                window.crypto = {
                  randomUUID: function() {
                    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                      const r = Math.random() * 16 | 0;
                      const v = c === "x" ? r : (r & 0x3 | 0x8);
                      return v.toString(16);
                    });
                  }
                };
              }
            }
          `
        }} />
      </head>
      <body className={inter.className + " bg-gray-50 min-h-screen"}>
        <LanguageProvider>
          <DynamicTitle />
          <Navbar />
          <main className="pt-4">{children}</main>
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
} 