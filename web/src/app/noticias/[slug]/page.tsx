'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CategoryBadge from '@/components/news/CategoryBadge';
import NewsCard from '@/components/news/NewsCard';
import LateralAds from '@/components/layout/LateralAds';
import type { News } from '@/lib/supabase/types';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<News | null>(null);
  const [related, setRelated] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const res = await fetch(`/api/public/news/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const { article: data, related: relatedData } = await res.json();
        setArticle(data as News);
        if (relatedData) setRelated(relatedData as News[]);
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <LateralAds>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-80 bg-gray-200 rounded-xl mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </LateralAds>
    );
  }

  if (!article) {
    return (
      <LateralAds>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Noticia no encontrada</h1>
          <Link href="/noticias" className="text-radio-blue hover:underline">
            Volver a noticias
          </Link>
        </div>
      </LateralAds>
    );
  }

  return (
    <LateralAds>
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/noticias"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-radio-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver a noticias
        </Link>

        {/* Category */}
        <div className="mb-3">
          <CategoryBadge category={article.category} size="md" />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          {article.author?.full_name && (
            <span className="flex items-center gap-2">
              {article.author.avatar_url ? (
                <Image
                  src={article.author.avatar_url}
                  alt={article.author.full_name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover w-6 h-6"
                />
              ) : (
                <User size={14} />
              )}
              {article.author.full_name}
            </span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(article.published_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Cover Image */}
        {article.cover_image_url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-gray-600 font-medium mb-8 leading-relaxed border-l-4 border-marca-red pl-4 italic">
            {article.excerpt}
          </p>
        )}

        {/* Separator */}
        <div className="w-16 h-0.5 bg-marca-red mb-8" />

        {/* Content */}
        <div
          className={`article-content ${article.has_drop_cap ? 'has-drop-cap' : ''}`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Additional Media */}
        {article.media && article.media.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Galeria</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {article.media.map(media => (
                <div key={media.id}>
                  {media.media_type === 'image' ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={media.url}
                        alt={media.alt_text || ''}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={media.url}
                        title={media.alt_text || 'Video'}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related News */}
      {related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">Noticias Relacionadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(item => (
              <div key={item.id} className="aspect-square">
                <NewsCard news={item} className="h-full" />
              </div>
            ))}
          </div>
        </section>
      )}
    </LateralAds>
  );
}
