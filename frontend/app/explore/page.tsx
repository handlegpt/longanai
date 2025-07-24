"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const translations = {
  zh: {
    exploreTitle: "播客广场 Explore",
    searchPlaceholder: "搜索播客标题...",
    tagPlaceholder: "标签筛选...",
    noPodcast: "暂无公开播客",
    loading: "加载中...",
    detail: "详情 & 播放页",
    by: "作者",
    duration: "时长",
    prev: "上一页",
    next: "下一页",
    page: "第",
    page2: "页",
    back: "返回",
    all: "全部"
  },
  en: {
    exploreTitle: "Podcast Explore",
    searchPlaceholder: "Search podcast title...",
    tagPlaceholder: "Filter by tag...",
    noPodcast: "No public podcasts",
    loading: "Loading...",
    detail: "Detail & Play",
    by: "By",
    duration: "Duration",
    prev: "Prev",
    next: "Next",
    page: "Page",
    page2: "",
    back: "Back",
    all: "All"
  }
};

interface Podcast {
  id: number;
  title: string;
  description: string;
  audioUrl: string;
  coverImageUrl: string;
  duration: string;
  createdAt: string;
  userEmail: string;
  tags: string;
}

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow p-4 flex flex-col animate-pulse">
    <div className="mb-3 w-full h-40 bg-gray-100 rounded-md" />
    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
    <div className="h-8 bg-gray-100 rounded w-full mt-auto" />
    <div className="flex gap-2 mt-2">
      <div className="h-4 w-10 bg-gray-100 rounded" />
      <div className="h-4 w-10 bg-gray-100 rounded" />
    </div>
  </div>
);

export default function ExplorePage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [lang, setLang] = useState<string>(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "zh" : "zh");

  const t = translations[lang as "zh" | "en"];

  useEffect(() => {
    fetchPodcasts();
    // eslint-disable-next-line
  }, [page, search, tag]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(size),
        search,
        tag,
      });
      const res = await fetch(`/api/podcast/public?${params.toString()}`);
      const data = await res.json();
      setPodcasts(data.podcasts || []);
      setTotal(data.total || 0);
    } catch (e) {
      setPodcasts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / size);

  // 标签点击筛选
  const handleTagClick = (t: string) => {
    setTag(t);
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">{t.exploreTitle}</h1>
        <div className="flex gap-2">
          <button onClick={() => setLang("zh")} className={`px-3 py-1 rounded ${lang==="zh" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>中文</button>
          <button onClick={() => setLang("en")} className={`px-3 py-1 rounded ${lang==="en" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>EN</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:w-64 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-200"
        />
        <input
          type="text"
          placeholder={t.tagPlaceholder}
          value={tag}
          onChange={e => { setTag(e.target.value); setPage(1); }}
          className="w-full sm:w-48 px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-200"
        />
        {tag && (
          <button onClick={() => setTag("")} className="text-xs text-blue-600 underline ml-2">{t.all}</button>
        )}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t.noPodcast}</div>
      ) : (
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
              <div className="text-xs text-gray-500 mb-2 truncate">{t.by} {podcast.userEmail}</div>
              <div className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description || (lang==="zh" ? "无简介" : "No description")}</div>
              <audio controls src={podcast.audioUrl} className="w-full mt-auto rounded" />
              <div className="flex flex-wrap gap-2 mt-2">
                {podcast.tags?.split(",").map(tg => tg && (
                  <button key={tg} onClick={() => handleTagClick(tg)} className="bg-blue-50 hover:bg-blue-200 text-blue-600 px-2 py-0.5 rounded text-xs cursor-pointer transition-all">#{tg}</button>
                ))}
              </div>
              <Link href={`/podcast/${podcast.id}`} className="mt-3 text-blue-600 hover:underline text-sm">{t.detail}</Link>
            </div>
          ))}
        </div>
      )}
      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">{t.prev}</button>
          <span>{t.page} {page} / {totalPages} {t.page2}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-50">{t.next}</button>
        </div>
      )}
    </div>
  );
} 