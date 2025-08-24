'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Mic, Home, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchComponentProps {
  language: 'cantonese' | 'mandarin' | 'english';
  onResultClick?: (result: any) => void;
}

interface SearchResult {
  type: 'user' | 'podcast' | 'community';
  id: number;
  title: string;
  description: string;
  user_email: string;
  user_display_name: string;
  created_at: string;
  score: number;
  duration?: string;
  language?: string;
  member_count?: number;
}

const translations = {
  cantonese: {
    searchPlaceholder: '搜索用戶、播客、社區...',
    searchUsers: '搜索用戶',
    searchPodcasts: '搜索播客',
    searchCommunities: '搜索社區',
    allResults: '全部結果',
    users: '用戶',
    podcasts: '播客',
    communities: '社區',
    noResults: '沒有找到相關結果',
    loading: '搜索中...',
    clear: '清除',
    filter: '篩選',
    duration: '時長',
    members: '成員',
    language: '語言',
    allLanguages: '所有語言',
    cantonese: '粵語',
    mandarin: '普通話',
    english: '英語',
  },
  mandarin: {
    searchPlaceholder: '搜索用户、播客、社区...',
    searchUsers: '搜索用户',
    searchPodcasts: '搜索播客',
    searchCommunities: '搜索社区',
    allResults: '全部结果',
    users: '用户',
    podcasts: '播客',
    communities: '社区',
    noResults: '没有找到相关结果',
    loading: '搜索中...',
    clear: '清除',
    filter: '筛选',
    duration: '时长',
    members: '成员',
    language: '语言',
    allLanguages: '所有语言',
    cantonese: '粤语',
    mandarin: '普通话',
    english: '英语',
  },
  english: {
    searchPlaceholder: 'Search users, podcasts, communities...',
    searchUsers: 'Search Users',
    searchPodcasts: 'Search Podcasts',
    searchCommunities: 'Search Communities',
    allResults: 'All Results',
    users: 'Users',
    podcasts: 'Podcasts',
    communities: 'Communities',
    noResults: 'No results found',
    loading: 'Searching...',
    clear: 'Clear',
    filter: 'Filter',
    duration: 'Duration',
    members: 'Members',
    language: 'Language',
    allLanguages: 'All Languages',
    cantonese: 'Cantonese',
    mandarin: 'Mandarin',
    english: 'English',
  }
};

export default function SearchComponent({
  language,
  onResultClick
}: SearchComponentProps) {
  const t = translations[language];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'user' | 'podcast' | 'community'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 防抖搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, selectedType, selectedLanguage]);

  // 点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 执行搜索
  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let url = `/api/search?q=${encodeURIComponent(query)}`;
      
      if (selectedType !== 'all') {
        url += `&type=${selectedType}`;
      }
      
      if (selectedLanguage !== 'all') {
        url += `&language=${selectedLanguage}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    }
    setShowResults(false);
  };

  // 获取结果图标
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'podcast':
        return <Mic className="w-4 h-4" />;
      case 'community':
        return <Home className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // 获取结果颜色
  const getResultColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 bg-blue-100';
      case 'podcast':
        return 'text-green-600 bg-green-100';
      case 'community':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* 搜索输入框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded ${
              showFilters ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="space-y-3">
              {/* 类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.filter}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: t.allResults },
                    { value: 'user', label: t.users },
                    { value: 'podcast', label: t.podcasts },
                    { value: 'community', label: t.communities }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value as any)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        selectedType === type.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 语言筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.language}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">{t.allLanguages}</option>
                  <option value="cantonese">{t.cantonese}</option>
                  <option value="mandarin">{t.mandarin}</option>
                  <option value="english">{t.english}</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索结果 */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                {t.loading}
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {t.noResults}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      {/* 结果图标 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getResultColor(result.type)}`}>
                        {getResultIcon(result.type)}
                      </div>
                      
                      {/* 结果内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(result.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {result.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{result.user_display_name || result.user_email.split('@')[0]}</span>
                          {result.duration && (
                            <span>{t.duration}: {result.duration}</span>
                          )}
                          {result.member_count && (
                            <span>{result.member_count} {t.members}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
