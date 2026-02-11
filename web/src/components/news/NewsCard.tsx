import Link from 'next/link';
import Image from 'next/image';
import CategoryBadge from './CategoryBadge';
import type { News } from '@/lib/supabase/types';

interface NewsCardProps {
  news: News;
  className?: string;
  compact?: boolean;
}

export default function NewsCard({ news, className = '', compact = false }: NewsCardProps) {
  const timeAgo = news.published_at
    ? getTimeAgo(new Date(news.published_at))
    : '';

  return (
    <Link href={`/noticias/${news.slug}`} className={`group block ${className}`}>
      <article className="relative w-full h-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
        {/* Background Image */}
        {news.cover_image_url ? (
          <Image
            src={news.cover_image_url}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        ) : (
          <div className="absolute inset-0 bg-radio-blue" />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className={`relative h-full flex flex-col justify-end ${compact ? 'p-3' : 'p-4'}`}>
          <div className={compact ? 'mb-1' : 'mb-2'}>
            <CategoryBadge category={news.category} size={compact ? 'sm' : 'md'} />
          </div>
          <h3 className={`text-white font-bold leading-tight group-hover:underline ${
            compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
          }`}>
            {news.title}
          </h3>
          {!compact && news.excerpt && (
            <p className="text-white/70 text-xs mt-1 line-clamp-2">{news.excerpt}</p>
          )}
          {(news.author?.full_name || timeAgo) && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-1">
              {!compact && news.author?.avatar_url && (
                <Image
                  src={news.author.avatar_url}
                  alt={news.author.full_name || ''}
                  width={16}
                  height={16}
                  className="rounded-full object-cover w-4 h-4"
                />
              )}
              <span className={compact ? 'truncate' : ''}>
                {news.author?.full_name}
                {news.author?.full_name && timeAgo && ' \u00b7 '}
                {timeAgo}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'hace 1 dia';
  if (diffDays < 30) return `hace ${diffDays} dias`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
