'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { News } from '@/lib/supabase/types';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff } from 'lucide-react';

export default function AdminNoticiasPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/news');
      const json = await res.json();
      if (res.ok && json.data) setNews(json.data as News[]);
    } catch (err) {
      console.error('Error fetching news:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const togglePublished = async (id: string, current: boolean) => {
    await fetch('/api/admin/news', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        updates: {
          is_published: !current,
          published_at: !current ? new Date().toISOString() : null,
        },
      }),
    });
    fetchNews();
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    await fetch('/api/admin/news', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        updates: { is_favorite: !current },
      }),
    });
    fetchNews();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Eliminar "${title}"? Esta accion no se puede deshacer.`)) return;
    await fetch('/api/admin/news', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchNews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Noticias</h1>
        <Link
          href="/admin/noticias/nueva"
          className="flex items-center gap-2 px-4 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nueva Noticia
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <p className="text-gray-500">No hay noticias todavia</p>
          <Link href="/admin/noticias/nueva" className="text-radio-blue hover:underline text-sm mt-2 inline-block">
            Crear la primera noticia
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-[40%] text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Noticia</th>
                <th className="w-[12%] text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Autor</th>
                <th className="w-[12%] text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Categoria</th>
                <th className="w-[12%] text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="w-[10%] text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Favorito</th>
                <th className="w-[14%] text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {news.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 overflow-hidden">
                    <div className="flex items-center gap-3">
                      {item.cover_image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <Image src={item.cover_image_url} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-brand-dark truncate">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString('es-ES')
                            : 'Sin publicar'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{item.author?.full_name || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.category && (
                      <span
                        className="inline-block text-xs font-semibold text-white px-2 py-0.5 rounded"
                        style={{ backgroundColor: item.category.color }}
                      >
                        {item.category.name}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => togglePublished(item.id, item.is_published)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                        item.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.is_published ? 'Publicada' : 'Borrador'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <button
                      onClick={() => toggleFavorite(item.id, item.is_favorite)}
                      className="text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      {item.is_favorite ? (
                        <Star size={18} className="fill-yellow-500 text-yellow-500" />
                      ) : (
                        <StarOff size={18} />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/noticias/${item.id}`}
                        className="p-2 text-gray-400 hover:text-radio-blue hover:bg-radio-blue/5 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
