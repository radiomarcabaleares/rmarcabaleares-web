'use client';

import { useEffect, useState } from 'react';
import NewsCard from '@/components/news/NewsCard';
import type { News } from '@/lib/supabase/types';

const FALLBACK_YOUTUBE_ID = 'OZLjUDXTVc4';

export default function FutbolBalearSection() {
  const [news, setNews] = useState<News[]>([]);
  const [youtubeId, setYoutubeId] = useState(FALLBACK_YOUTUBE_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch YouTube video ID and assigned news in parallel
      const [settingsRes, featuredRes] = await Promise.all([
        fetch('/api/public/settings?key=futbol_balear_youtube_id').catch(() => null),
        fetch('/api/public/news/featured').catch(() => null),
      ]);

      // YouTube ID
      if (settingsRes?.ok) {
        const { value } = await settingsRes.json();
        if (value) setYoutubeId(value);
      }

      // Try assigned slots first (futbol_1, futbol_2, futbol_3)
      let assignedNews: News[] = [];
      if (featuredRes?.ok) {
        const { data } = await featuredRes.json();
        if (data) {
          assignedNews = (data as News[])
            .filter(n => n.bento_slot?.startsWith('futbol_'))
            .sort((a, b) => (a.bento_slot || '').localeCompare(b.bento_slot || ''));
        }
      }

      if (assignedNews.length > 0) {
        setNews(assignedNews);
      } else {
        // Fallback: latest news from Fútbol Balear category
        const res = await fetch('/api/public/news?categorySlug=futbol-balear&limit=3');
        if (res.ok) {
          const { news: data } = await res.json();
          if (data) setNews(data as News[]);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Fútbol Balear</h2>

      <div className="flex flex-col md:flex-row gap-4">
        {/* YouTube Video — su altura manda */}
        <div className="md:w-3/5 shrink-0 aspect-video rounded-xl overflow-hidden shadow-md bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="Radio Marca Baleares - Fútbol Balear"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* 3 News Cards — misma altura total que el video */}
        <div className="flex-1 flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-xl animate-pulse" />
            ))
          ) : news.length > 0 ? (
            news.map(item => (
              <div key={item.id} className="flex-1 min-h-0 overflow-hidden rounded-xl">
                <NewsCard news={item} className="h-full" compact />
              </div>
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-100 rounded-xl">
              <p className="text-gray-400 text-sm">No hay noticias de Fútbol Balear</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
