'use client';

import { useEffect, useState } from 'react';
import NewsCard from '@/components/news/NewsCard';
import type { News } from '@/lib/supabase/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NewsGrid() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const res = await fetch(`/api/public/news?page=${page}&limit=${limit}`);
      if (res.ok) {
        const { news: data, total: count } = await res.json();
        if (data) setNews(data as News[]);
        if (count !== null) setTotal(count);
      }
      setLoading(false);
    };
    fetchNews();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  if (loading && news.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold text-brand-dark mb-6">Polideportivo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Polideportivo</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {news.map(item => (
          <div key={item.id} className="aspect-square">
            <NewsCard news={item} className="h-full" />
          </div>
        ))}
      </div>

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
    </section>
  );
}
