'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import NewsCard from '@/components/news/NewsCard';
import LateralAds from '@/components/layout/LateralAds';
import type { News, Category } from '@/lib/supabase/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`/api/public/news?${params}`);
      if (res.ok) {
        const { news: data, total: count } = await res.json();
        if (data) setNews(data as News[]);
        if (count !== null) setTotal(count);
      }
      setLoading(false);
    };
    fetchNews();
  }, [page, selectedCategory]);

  const totalPages = Math.ceil(total / limit);

  return (
    <LateralAds>
      <div>
        <h1 className="text-3xl font-bold text-brand-dark mb-6">Noticias</h1>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setSelectedCategory(null); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !selectedCategory
                ? 'bg-radio-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No hay noticias disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {news.map(item => (
              <div key={item.id} className="aspect-square">
                <NewsCard news={item} className="h-full" />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-radio-blue text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-radio-blue-light transition-colors text-sm font-medium"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Pagina {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-radio-blue text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-radio-blue-light transition-colors text-sm font-medium"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </LateralAds>
  );
}
