import { YOUTUBE } from '@/lib/constants/youtube';
import LateralAds from '@/components/layout/LateralAds';
import { ExternalLink, Youtube } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TV',
  description: 'Emision en directo y emisiones pasadas de Radio Marca Baleares.',
};

async function isChannelLive(): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/channel/${YOUTUBE.channelId}/live`,
      {
        redirect: 'manual',
        next: { revalidate: 30 },
      }
    );
    const location = res.headers.get('location') || '';
    return location.includes('/watch?v=');
  } catch {
    return false;
  }
}

interface VideoEntry {
  id: string;
  title: string;
}

async function getChannelVideos(): Promise<VideoEntry[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE.channelId}`,
      { next: { revalidate: 300 } }
    );
    const xml = await res.text();

    const videos: VideoEntry[] = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let entry;
    while ((entry = entryRegex.exec(xml)) !== null) {
      const idMatch = entry[1].match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entry[1].match(/<title>([^<]+)<\/title>/);
      if (idMatch) {
        videos.push({
          id: idMatch[1],
          title: titleMatch?.[1] || 'Radio Marca Baleares',
        });
      }
    }
    return videos.slice(0, 6);
  } catch {
    return [];
  }
}

export default async function TVPage() {
  const [live, videos] = await Promise.all([
    isChannelLive(),
    getChannelVideos(),
  ]);

  return (
    <LateralAds>
      <div>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">TV</h1>
        <p className="text-gray-500 mb-8">Emision en directo y programas grabados</p>

        {/* Live Stream — only shown when actually broadcasting */}
        {live && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-marca-red px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                En Directo
              </span>
              <h2 className="text-xl font-bold text-brand-dark">Emision Actual</h2>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe
                src={`${YOUTUBE.liveStreamUrl}&autoplay=0`}
                title="Radio Marca Baleares - En Directo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </section>
        )}

        {/* Videos from channel */}
        {videos.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-brand-dark">Emisiones</h2>
              <a
                href={`${YOUTUBE.channelUrl}/streams`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-marca-red hover:text-marca-red-dark font-semibold transition-colors"
              >
                <Youtube size={16} />
                Ver todas en YouTube
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map(video => (
                <div key={video.id} className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </LateralAds>
  );
}
