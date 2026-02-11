'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Ad } from '@/lib/supabase/types';

function AdImage({ ad, width, height }: { ad: Ad; width: number; height: number }) {
  const img = (
    <Image
      src={ad.image_url}
      alt={ad.title}
      width={width}
      height={height}
      className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
    />
  );

  if (ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    );
  }
  return img;
}

function AdColumn({ ads, position }: { ads: Ad[]; position: 'left' | 'right' }) {
  const filtered = ads.filter(ad => ad.position === position || ad.position === 'both');

  if (filtered.length === 0) return <div className="w-[300px] shrink-0 hidden 2xl:block" />;

  return (
    <div className="w-[300px] shrink-0 hidden 2xl:block">
      <div className="sticky top-40 space-y-4">
        {filtered.map(ad => (
          <div key={ad.id}>
            <AdImage ad={ad} width={300} height={600} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileAdBanner({ ads }: { ads: Ad[] }) {
  if (ads.length === 0) return null;

  return (
    <div className="2xl:hidden mt-8">
      <div className="border-t border-gray-200 py-6">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center mb-4">
          Publicidad
        </p>
        <div className="flex justify-center gap-4">
          {ads.slice(0, 2).map(ad => (
            <div key={ad.id} className="shrink-0">
              <AdImage ad={ad} width={150} height={300} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LateralAds({ children }: { children: React.ReactNode }) {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (data) setAds(data as Ad[]);
    };
    fetchAds();
  }, []);

  return (
    <div className="flex justify-center gap-6 px-4 2xl:px-8">
      <AdColumn ads={ads} position="left" />
      <div className="flex-1 max-w-5xl min-w-0">
        {children}
        <MobileAdBanner ads={ads} />
      </div>
      <AdColumn ads={ads} position="right" />
    </div>
  );
}
