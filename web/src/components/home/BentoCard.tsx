import Link from 'next/link';
import Image from 'next/image';
import CategoryBadge from '@/components/news/CategoryBadge';
import type { News } from '@/lib/supabase/types';

interface BentoCardProps {
  news: News;
  variant: 'large' | 'horizontal' | 'small';
}

export default function BentoCard({ news, variant }: BentoCardProps) {
  return (
    <Link href={`/noticias/${news.slug}`} className="group block h-full">
      <article className="relative w-full h-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
        {/* Background Image */}
        {news.cover_image_url ? (
          <Image
            src={news.cover_image_url}
            alt={news.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes={
              variant === 'large'
                ? '(max-width: 768px) 100vw, 525px'
                : variant === 'horizontal'
                ? '(max-width: 768px) 100vw, 482px'
                : '(max-width: 768px) 100vw, 233px'
            }
            priority={variant === 'large'}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-radio-blue to-radio-blue-dark" />
        )}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/85 transition-all duration-300" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-5">
          <div className="mb-2">
            <CategoryBadge category={news.category} size={variant === 'small' ? 'sm' : 'md'} />
          </div>
          <h3
            className={`text-white font-bold leading-tight group-hover:underline decoration-marca-red ${
              variant === 'large'
                ? 'text-xl md:text-2xl line-clamp-4'
                : variant === 'horizontal'
                ? 'text-lg line-clamp-3'
                : 'text-sm line-clamp-3'
            }`}
          >
            {news.title}
          </h3>
          {variant !== 'small' && news.excerpt && (
            <p className="text-white/70 text-sm mt-2 line-clamp-2">{news.excerpt}</p>
          )}
          {news.author && (
            <div className="flex items-center gap-1.5 text-white/50 text-xs mt-2">
              {news.author.avatar_url && (
                <Image
                  src={news.author.avatar_url}
                  alt={news.author.full_name || ''}
                  width={16}
                  height={16}
                  className="rounded-full object-cover w-4 h-4"
                />
              )}
              <span>
                {news.author.full_name}
                {news.published_at && (
                  <> &middot; {new Date(news.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</>
                )}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
