import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { User } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '龙眼AI - 智能粤语播客生成平台',
  description: '用AI技术，一键生成地道嘅粤语播客内容',
  keywords: '粤语,播客,AI,语音生成,龙眼AI',
};

function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm z-20">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2 font-bold text-xl text-primary">
          <img src="/logo.png" alt="龙眼AI Logo" className="h-8 w-8" />
          <span>龙眼AI</span>
        </Link>
      </div>
      <div className="flex items-center space-x-6 text-base font-medium">
        <Link href="/" className="hover:text-primary transition">首页</Link>
        <Link href="/explore" className="hover:text-primary transition">探索</Link>
        <Link href="/history" className="hover:text-primary transition">历史</Link>
        <Link href="/login" className="flex items-center space-x-1 hover:text-primary transition">
          <User className="w-4 h-4" />
          <span>登录</span>
        </Link>
      </div>
    </nav>
  );
}

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
        <Navbar />
        <main className="pt-4">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
} 