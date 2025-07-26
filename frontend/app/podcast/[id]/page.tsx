"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PodcastDetail {
  id: number;
  title: string;
  description: string;
  content: string;
  audioUrl: string;
  coverImageUrl: string;
  duration: string;
  createdAt: string;
  userEmail: string;
  userDisplayName?: string;  // 添加用户显示名称字段
  tags: string;
  isPublic: boolean;
}

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [podcast, setPodcast] = useState<PodcastDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/podcast/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.id) setPodcast(data);
        else setError("播客不存在或已被删除");
      })
      .catch(() => setError("加载失败，请重试"))
      .finally(() => setLoading(false));
  }, [params?.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("链接已复制到剪贴板");
  };

  if (loading) return <div className="text-center py-16">加载中...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!podcast) return null;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button onClick={() => router.back()} className="mb-4 text-blue-600 hover:underline">← 返回</button>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="mb-4">
          {podcast.coverImageUrl ? (
            <img src={podcast.coverImageUrl} alt="cover" className="w-full h-56 object-cover rounded-md" />
          ) : (
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-md text-5xl text-gray-300">🎧</div>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">{podcast.title}</h1>
        <div className="text-xs text-gray-500 mb-2">by {podcast.userDisplayName || podcast.userEmail} | {podcast.duration} | {podcast.createdAt.slice(0,10)}</div>
        <div className="mb-3 text-gray-700">{podcast.description}</div>
        <audio controls src={podcast.audioUrl} className="w-full my-4" />
        <div className="mb-3 text-sm text-gray-500">{podcast.content}</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {podcast.tags?.split(",").map(tag => tag && (
            <span key={tag} className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs">#{tag}</span>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">复制链接</button>
          <a href={podcast.audioUrl} download className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200 text-blue-700 text-sm">下载音频</a>
          <Link href="/explore" className="px-4 py-2 bg-gray-50 rounded hover:bg-gray-100 text-sm">返回广场</Link>
        </div>
      </div>
    </div>
  );
} 