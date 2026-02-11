'use client';

import { useEffect, useState } from 'react';
import BentoCard from './BentoCard';
import type { News } from '@/lib/supabase/types';

export default function BentoGrid() {
  const [newsMap, setNewsMap] = useState<Record<string, News>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const res = await fetch('/api/public/news/featured');
      if (res.ok) {
        const { news: data } = await res.json();
        if (data) {
          const map: Record<string, News> = {};
          (data as News[]).forEach((n: News) => {
            if (n.bento_slot) map[n.bento_slot] = n;
          });
          setNewsMap(map);
        }
      }
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="grid gap-4 animate-pulse grid-cols-1 md:grid-cols-[9fr_4fr_4fr] md:grid-rows-[5fr_4fr] md:aspect-[17/9]">
          <div className="aspect-square md:aspect-auto md:[grid-area:1/1/3/2] bg-gray-200 rounded-xl" />
          <div className="aspect-[8/5] md:aspect-auto md:[grid-area:1/2/2/4] bg-gray-200 rounded-xl" />
          <div className="aspect-square md:aspect-auto bg-gray-200 rounded-xl" />
          <div className="aspect-square md:aspect-auto bg-gray-200 rounded-xl" />
        </div>
      </section>
    );
  }

  const hasContent = Object.keys(newsMap).length > 0;
  if (!hasContent) return null;

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-brand-dark mb-6">Noticias Destacadas</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-[9fr_4fr_4fr] md:grid-rows-[5fr_4fr] md:aspect-[17/9]">
        {/* Large slot - spans 2 rows on left */}
        <div className="aspect-square md:aspect-auto md:[grid-area:1/1/3/2]">
          {newsMap.large ? (
            <BentoCard news={newsMap.large} variant="large" />
          ) : (
            <EmptySlot />
          )}
        </div>

        {/* Horizontal slot - top right, spans 2 cols */}
        <div className="aspect-[8/5] md:aspect-auto md:[grid-area:1/2/2/4]">
          {newsMap.horizontal ? (
            <BentoCard news={newsMap.horizontal} variant="horizontal" />
          ) : (
            <EmptySlot />
          )}
        </div>

        {/* Small slot 1 */}
        <div className="aspect-square md:aspect-auto">
          {newsMap.small_1 ? (
            <BentoCard news={newsMap.small_1} variant="small" />
          ) : (
            <EmptySlot />
          )}
        </div>

        {/* Small slot 2 */}
        <div className="aspect-square md:aspect-auto">
          {newsMap.small_2 ? (
            <BentoCard news={newsMap.small_2} variant="small" />
          ) : (
            <EmptySlot />
          )}
        </div>
      </div>
    </section>
  );
}

function EmptySlot() {
  return (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-400 text-sm">Sin noticia asignada</p>
    </div>
  );
}
