'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HorizontalAd {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
}

export default function HorizontalBannerAd({ position }: { position: 'horizontal_1' | 'horizontal_2' }) {
  const [ad, setAd] = useState<HorizontalAd | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/public/ads?position=${position}`);
        if (res.ok) {
          const { ads } = await res.json();
          if (ads && ads.length > 0) setAd(ads[0]);
        }
      } catch {
        // Silently fail - no ad to show
      }
    };
    fetchAd();
  }, [position]);

  if (!ad) return null;

  const content = (
    <div className="relative w-full h-[90px] md:h-[100px] rounded-lg overflow-hidden shadow-sm border border-gray-200">
      <Image
        src={ad.image_url}
        alt={ad.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 970px"
      />
    </div>
  );

  if (ad.link_url) {
    return (
      <div className="py-2">
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      </div>
    );
  }

  return <div className="py-2">{content}</div>;
}
