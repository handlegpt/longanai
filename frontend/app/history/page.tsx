"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Download, Share2, Trash2 } from "lucide-react";

interface Podcast {
  id: number;
  title: string;
  audioUrl: string;
  duration?: string;
  createdAt?: string;
  coverImageUrl?: string;
  description?: string;
  tags?: string;
}

export default function HistoryPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 9;
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (!email) {
      setError("请先登录后查看历史记录。");
      return;
    }
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    fetch(`/api/podcast/user?user_email=${encodeURIComponent(userEmail)}&page=${page}&size=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setPodcasts(data.podcasts || []);
        setTotal(data.total || 0);
      })
      .catch(() => setError("加载失败，请重试"))
      .finally(() => setLoading(false));
  }, [userEmail, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个播客吗？")) return;
    try {
      const res = await fetch(`/api/podcast/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPodcasts(podcasts.filter(p => p.id !== id));
        setTotal(total - 1);
      } else {
        alert("删除失败");
      }
    } catch {
      alert("删除失败");
    }
  };

  const handleShare = async (audioUrl: string) => {
    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: "龙眼AI播客",
          text: "我用龙眼AI生成的粤语播客",
          url: window.location.origin + audioUrl,
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          throw new Error("分享数据不被支持");
        }
      } else {
        await navigator.clipboard.writeText(window.location.origin + audioUrl);
        alert("链接已复制到剪贴板");
      }
    } catch {
      alert("分享失败，请手动复制链接");
    }
  };

  if (error) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-red-500">{error}</div>;
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">我的播客历史</h1>
      {loading ? (
        <div className="text-center py-16 text-gray-400">加载中...</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">暂无历史记录</div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map(podcast => (
            <div key={podcast.id} className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 p-4 flex flex-col group">
              <div className="mb-3 relative">
                {podcast.coverImageUrl ? (
                  <img src={podcast.coverImageUrl} alt="cover" className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-lg text-4xl text-blue-300">🎧</div>
                )}
                <span className="absolute top-2 right-2 bg-white/80 text-xs text-gray-500 px-2 py-0.5 rounded shadow">{podcast.duration}</span>
              </div>
              <h2 className="font-bold text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">{podcast.title}</h2>
              <div className="text-xs text-gray-500 mb-2 truncate">{podcast.createdAt?.slice(0,10)}</div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description || "无简介"}</div>
              <audio controls src={podcast.audioUrl} className="w-full mt-auto rounded" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleShare(podcast.audioUrl)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="分享"><Share2 className="w-4 h-4 text-gray-600" /></button>
                <a href={podcast.audioUrl} download className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="下载"><Download className="w-4 h-4 text-gray-600" /></a>
                <button onClick={() => handleDelete(podcast.id)} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors" title="删除"><Trash2 className="w-4 h-4 text-red-600" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8 gap-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-secondary px-4 py-2 rounded disabled:opacity-50">上一页</button>
          <span className="text-gray-600">第 {page} 页 / 共 {totalPages} 页</span>
          <button disabled={page === totalPages || podcasts.length < pageSize} onClick={() => setPage(page + 1)} className="btn-secondary px-4 py-2 rounded disabled:opacity-50">下一页</button>
        </div>
        </>
      )}
    </div>
  );
} 