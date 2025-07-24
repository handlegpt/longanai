"use client";
import { useEffect, useState } from "react";
import { Download, Trash2, Lock, CheckCircle2, XCircle, User } from "lucide-react";

interface Podcast {
  id: number;
  title: string;
  audioUrl: string;
  duration?: string;
  createdAt?: string;
  coverImageUrl?: string;
  description?: string;
  tags?: string;
  is_public?: boolean;
  user_email?: string;
  review_status?: string;
}

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝"
};

export default function AdminPodcastsPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reviewFilter, setReviewFilter] = useState("");
  const pageSize = 12;

  // 权限校验
  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin");
    if (isAdmin !== "true") {
      alert("无权限访问后台");
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, search, userFilter, reviewFilter]);

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      size: String(pageSize),
      search,
      user: userFilter,
      review_status: reviewFilter
    });
    fetch(`/api/podcast/admin/list?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setPodcasts(data.podcasts || []);
        setTotal(data.total || 0);
        setSelectedIds([]);
      })
      .catch(() => setError("加载失败，请重试"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`确定要删除${ids.length > 1 ? "这些" : "这个"}播客吗？`)) return;
    try {
      for (const id of ids) {
        await fetch(`/api/podcast/history/${id}`, { method: "DELETE" });
      }
      setPodcasts(podcasts.filter(p => !ids.includes(p.id)));
      setTotal(total - ids.length);
      setSelectedIds([]);
    } catch {
      alert("删除失败");
    }
  };

  const handleUnpublish = async (ids: number[]) => {
    if (!confirm(`确定要下架${ids.length > 1 ? "这些" : "这个"}播客吗？`)) return;
    try {
      for (const id of ids) {
        await fetch(`/api/podcast/admin/unpublish/${id}`, { method: "POST" });
      }
      setPodcasts(podcasts.map(p => ids.includes(p.id) ? { ...p, is_public: false } : p));
      setSelectedIds([]);
    } catch {
      alert("下架失败");
    }
  };

  const handleReview = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/podcast/admin/review/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_status: status })
      });
      if (res.ok) {
        setPodcasts(podcasts.map(p => p.id === id ? { ...p, review_status: status } : p));
      } else {
        alert("审核失败");
      }
    } catch {
      alert("审核失败");
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const allSelected = podcasts.length > 0 && podcasts.every(p => selectedIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">后台播客管理</h1>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="搜索标题/描述/标签..."
          className="border px-3 py-2 rounded w-64"
        />
        <input
          type="text"
          value={userFilter}
          onChange={e => { setUserFilter(e.target.value); setPage(1); }}
          placeholder="按用户邮箱筛选"
          className="border px-3 py-2 rounded w-64"
        />
        <select value={reviewFilter} onChange={e => { setReviewFilter(e.target.value); setPage(1); }} className="border px-3 py-2 rounded">
          <option value="">全部审核状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </select>
        <span className="text-gray-500">共 {total} 条</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input type="checkbox" checked={allSelected} onChange={e => setSelectedIds(e.target.checked ? podcasts.map(p => p.id) : [])} />
        <span>全选</span>
        <button disabled={selectedIds.length === 0} onClick={() => handleDelete(selectedIds)} className="btn-secondary px-3 py-1 rounded disabled:opacity-50">批量删除</button>
        <button disabled={selectedIds.length === 0} onClick={() => handleUnpublish(selectedIds)} className="btn-secondary px-3 py-1 rounded disabled:opacity-50">批量下架</button>
      </div>
      {loading ? (
        <div className="text-center py-16 text-gray-400">加载中...</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">暂无播客</div>
      ) : (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map(podcast => (
            <div key={podcast.id} className={`bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 p-4 flex flex-col group border border-gray-100 ${selectedIds.includes(podcast.id) ? "ring-2 ring-primary-400" : ""}`}>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" checked={selectedIds.includes(podcast.id)} onChange={e => setSelectedIds(e.target.checked ? [...selectedIds, podcast.id] : selectedIds.filter(id => id !== podcast.id))} />
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500 truncate">{podcast.user_email}</span>
              </div>
              <div className="mb-3 relative">
                {podcast.coverImageUrl ? (
                  <img src={podcast.coverImageUrl} alt="cover" className="w-full h-40 object-cover rounded-lg group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-lg text-4xl text-blue-300">🎧</div>
                )}
                <span className="absolute top-2 right-2 bg-white/80 text-xs text-gray-500 px-2 py-0.5 rounded shadow">{podcast.duration}</span>
                {!podcast.is_public && (
                  <span className="absolute top-2 left-2 bg-red-100 text-red-600 px-2 py-0.5 rounded flex items-center gap-1 text-xs"><Lock className="w-3 h-3" />已下架</span>
                )}
              </div>
              <h2 className="font-bold text-lg mb-1 truncate group-hover:text-blue-600 transition-colors">{podcast.title}</h2>
              <div className="text-xs text-gray-500 mb-2 truncate">{podcast.createdAt?.slice(0,10)}</div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description || "无简介"}</div>
              <audio controls src={podcast.audioUrl} className="w-full mt-auto rounded" />
              <div className="flex gap-2 mt-3 flex-wrap items-center">
                <span className={`text-xs px-2 py-0.5 rounded ${podcast.review_status === "approved" ? "bg-green-100 text-green-600" : podcast.review_status === "rejected" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>{REVIEW_STATUS_LABELS[podcast.review_status || "pending"]}</span>
                <button onClick={() => handleReview(podcast.id, "approved") } className="p-1" title="通过"><CheckCircle2 className="w-4 h-4 text-green-600" /></button>
                <button onClick={() => handleReview(podcast.id, "rejected") } className="p-1" title="拒绝"><XCircle className="w-4 h-4 text-red-600" /></button>
                <button onClick={() => handleReview(podcast.id, "pending") } className="p-1" title="待审"><Lock className="w-4 h-4 text-yellow-600" /></button>
                <a href={podcast.audioUrl} download className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="下载"><Download className="w-4 h-4 text-gray-600" /></a>
                <button onClick={() => handleDelete([podcast.id])} className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors" title="删除"><Trash2 className="w-4 h-4 text-red-600" /></button>
                {podcast.is_public !== false && (
                  <button onClick={() => handleUnpublish([podcast.id])} className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors" title="下架"><Lock className="w-4 h-4 text-yellow-600" /></button>
                )}
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