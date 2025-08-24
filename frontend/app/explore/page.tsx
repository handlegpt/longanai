"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import toast from "react-hot-toast";

const languageOptions = [
  { id: "cantonese", name: "粤语", flag: "🇭🇰" },
  { id: "mandarin", name: "普通话", flag: "🇨🇳" },
  { id: "english", name: "English", flag: "🇺🇸" },
  { id: "all", name: "全部", flag: "🌍" }
];

// 根据当前语言显示对应的语言选项名称
const getLanguageOptions = (currentLang: string) => {
  const options = {
    cantonese: [
      { id: "cantonese", name: "粤语", flag: "🇭🇰" },
      { id: "mandarin", name: "普通话", flag: "🇨🇳" },
      { id: "english", name: "English", flag: "🇺🇸" },
      { id: "all", name: "全部", flag: "🌍" }
    ],
    mandarin: [
      { id: "cantonese", name: "粤语", flag: "🇭🇰" },
      { id: "mandarin", name: "普通话", flag: "🇨🇳" },
      { id: "english", name: "English", flag: "🇺🇸" },
      { id: "all", name: "全部", flag: "🌍" }
    ],
    english: [
      { id: "cantonese", name: "Cantonese", flag: "🇭🇰" },
      { id: "mandarin", name: "Mandarin", flag: "🇨🇳" },
      { id: "english", name: "English", flag: "🇺🇸" },
      { id: "all", name: "All", flag: "🌍" }
    ]
  };
  return options[currentLang as keyof typeof options] || options.cantonese;
};

const translations = {
  cantonese: {
    exploreTitle: "播客廣場 Explore",
    searchPlaceholder: "搜索播客標題...",
    tagPlaceholder: "標籤篩選...",
    noPodcast: "暫無公開播客",
    loading: "加載中...",
    detail: "詳情 & 播放頁",
    by: "作者",
    duration: "時長",
    prev: "上一頁",
    next: "下一頁",
    page: "第",
    page2: "頁",
    back: "返回",
    all: "全部",
    noDescription: "無簡介"
  },
  mandarin: {
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
    all: "全部",
    noDescription: "无简介"
  },
  english: {
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
    all: "All",
    noDescription: "No description"
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
  userDisplayName?: string;
  tags: string;
  like_count?: number;
  comment_count?: number;
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
  const [lang, setLang] = useState<string>(() => typeof window !== "undefined" ? localStorage.getItem("lang") || "cantonese" : "cantonese");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 根据选择的语言获取翻译
const getTranslation = (lang: string) => {
  if (lang === "english") {
    return translations.english;
  } else if (lang === "mandarin") {
    return translations.mandarin;
  } else {
    return translations.cantonese;
  }
};

const t = getTranslation(lang);

  useEffect(() => {
    // 获取用户邮箱
    const email = localStorage.getItem('userEmail');
    setUserEmail(email);
  }, []);

  useEffect(() => {
    fetchPodcasts();
    // eslint-disable-next-line
  }, [page, search, tag, lang]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      // 根据选择的语言映射到后端参数
  let languageParam = "";
  if (lang === "cantonese") {
    languageParam = "cantonese";
  } else if (lang === "mandarin") {
    languageParam = "mandarin";
  } else if (lang === "english") {
    languageParam = "english";
  } else if (lang === "all") {
    languageParam = ""; // 全部语言，不传参数
  } else {
  // 兼容旧逻辑
  languageParam = lang === "zh" ? "cantonese" : "english";
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    search,
    tag,
    ...(languageParam && { language: languageParam }), // 只有当languageParam不为空时才添加
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
        {getLanguageOptions(lang).map((option) => (
  <button
    key={option.id}
    onClick={() => setLang(option.id)}
    className={`px-3 py-1 rounded ${lang === option.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
  >
    {option.flag} {option.name}
  </button>
))}
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
              <div className="text-sm text-gray-700 mb-2 line-clamp-2">{podcast.description || t.noDescription}</div>
              
              {/* 用户信息 */}
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <User className="w-3 h-3 mr-1" />
                <span>{podcast.userDisplayName || podcast.userEmail.split('@')[0]}</span>
              </div>
              
              <audio controls src={podcast.audioUrl} className="w-full mt-auto rounded" />
              
              {/* 社交功能 */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    <span>{podcast.like_count || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    <span>{podcast.comment_count || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: podcast.title,
                          text: `${podcast.title} - ${podcast.userDisplayName || podcast.userEmail.split('@')[0]}`,
                          url: `${window.location.origin}/podcast/${podcast.id}`,
                        });
                      } else {
                        navigator.clipboard.writeText(`${window.location.origin}/podcast/${podcast.id}`);
                        toast.success('链接已复制到剪贴板');
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="分享"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
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