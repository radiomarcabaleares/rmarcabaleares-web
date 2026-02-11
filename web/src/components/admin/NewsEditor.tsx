'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ImageUploader from './ImageUploader';
import RichTextEditor from './RichTextEditor';
import type { News, Category, BentoSlot, Profile } from '@/lib/supabase/types';
import { BENTO_SLOTS, FUTBOL_SLOTS } from '@/lib/constants/brand';
import { Save, ArrowLeft, Loader2, User, Type } from 'lucide-react';
import Link from 'next/link';

interface NewsEditorProps {
  newsId?: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function NewsEditor({ newsId }: NewsEditorProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!newsId);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image_url: '',
    category_id: '',
    is_published: false,
    is_favorite: false,
    has_drop_cap: false,
    bento_slot: '' as string,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        const json = await res.json();
        if (res.ok && json.data) setCategories(json.data as Category[]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!newsId) return;
    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/admin/news?id=${newsId}`);
        const json = await res.json();
        if (res.ok && json.data) {
          const n = json.data as News;
          if (n.author?.full_name) setAuthorName(n.author.full_name);
          setForm({
            title: n.title,
            slug: n.slug,
            excerpt: n.excerpt || '',
            content: n.content,
            cover_image_url: n.cover_image_url || '',
            category_id: n.category_id || '',
            is_published: n.is_published,
            is_favorite: n.is_favorite,
            has_drop_cap: n.has_drop_cap || false,
            bento_slot: n.bento_slot || '',
          });
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      }
      setLoading(false);
    };
    fetchNews();
  }, [newsId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm(prev => ({
      ...prev,
      title,
      slug: !newsId ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('El titulo y el contenido son obligatorios');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const newsData: any = {
        title: form.title,
        slug: form.slug || generateSlug(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image_url: form.cover_image_url || null,
        category_id: form.category_id || null,
        is_published: form.is_published,
        is_favorite: form.is_favorite,
        has_drop_cap: form.has_drop_cap,
        bento_slot: form.bento_slot || null,
        is_featured: !!form.bento_slot || form.is_favorite,
      };

      if (form.is_published && !newsId) {
        newsData.published_at = new Date().toISOString();
      }

      const res = await fetch('/api/admin/save-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, newsData }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Error al guardar');
      }

      router.push('/admin/noticias');
    } catch (err: any) {
      console.error('Error saving news:', err);
      setError(err.message || 'Error al guardar la noticia');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-radio-blue animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/noticias"
            className="p-2 text-gray-400 hover:text-radio-blue hover:bg-radio-blue/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-brand-dark">
            {newsId ? 'Editar Noticia' : 'Nueva Noticia'}
          </h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light disabled:opacity-50 transition-colors text-sm font-medium"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo *</label>
              <input
                type="text"
                value={form.title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none"
                placeholder="Titulo de la noticia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm text-gray-600"
                placeholder="slug-de-la-noticia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none resize-none"
                placeholder="Breve resumen de la noticia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
              <RichTextEditor
                content={form.content}
                onChange={(html) => setForm(prev => ({ ...prev, content: html }))}
                placeholder="Escribe el contenido de la noticia..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Author info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-brand-dark mb-3">Autor</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <User size={16} className="text-gray-400" />
              )}
              <span>{newsId ? (authorName || 'Desconocido') : (profile?.full_name || user?.email || 'Tu')}</span>
            </div>
            {!profile?.avatar_url && (
              <div className="mt-3 bg-blue-50 text-blue-700 text-xs px-3 py-2 rounded-lg">
                Tu foto de perfil aparecera junto a tus noticias.{' '}
                <Link href="/admin/perfil" className="font-semibold underline">
                  Sube una foto en tu perfil
                </Link>
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-brand-dark mb-3">Imagen de portada</h3>
            <ImageUploader
              bucket="news-images"
              path={newsId || 'new'}
              currentUrl={form.cover_image_url || null}
              onUpload={url => setForm(prev => ({ ...prev, cover_image_url: url }))}
              onRemove={() => setForm(prev => ({ ...prev, cover_image_url: '' }))}
              recommendedSize={
                form.bento_slot && form.bento_slot in BENTO_SLOTS
                  ? `${BENTO_SLOTS[form.bento_slot as keyof typeof BENTO_SLOTS].width}x${BENTO_SLOTS[form.bento_slot as keyof typeof BENTO_SLOTS].height}px (${BENTO_SLOTS[form.bento_slot as keyof typeof BENTO_SLOTS].label})`
                  : form.bento_slot && form.bento_slot in FUTBOL_SLOTS
                  ? `${FUTBOL_SLOTS[form.bento_slot as keyof typeof FUTBOL_SLOTS].width}x${FUTBOL_SLOTS[form.bento_slot as keyof typeof FUTBOL_SLOTS].height}px (${FUTBOL_SLOTS[form.bento_slot as keyof typeof FUTBOL_SLOTS].label})`
                  : form.is_favorite
                  ? `${BENTO_SLOTS.large.width}x${BENTO_SLOTS.large.height}px (Favorita)`
                  : '800x500px (general)'
              }
              previewRatio={
                form.bento_slot && form.bento_slot in BENTO_SLOTS
                  ? `${BENTO_SLOTS[form.bento_slot as keyof typeof BENTO_SLOTS].width}/${BENTO_SLOTS[form.bento_slot as keyof typeof BENTO_SLOTS].height}`
                  : form.bento_slot && form.bento_slot in FUTBOL_SLOTS
                  ? `${FUTBOL_SLOTS[form.bento_slot as keyof typeof FUTBOL_SLOTS].width}/${FUTBOL_SLOTS[form.bento_slot as keyof typeof FUTBOL_SLOTS].height}`
                  : form.is_favorite
                  ? `${BENTO_SLOTS.large.width}/${BENTO_SLOTS.large.height}`
                  : '800/500'
              }
            />
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-brand-dark">Configuracion</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.category_id}
                onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
              >
                <option value="">Sin categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posicion Bento</label>
              <select
                value={form.bento_slot}
                onChange={e => setForm(prev => ({ ...prev, bento_slot: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
              >
                <option value="">No asignada</option>
                <optgroup label="Noticias Destacadas">
                  {Object.entries(BENTO_SLOTS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label} ({info.width}x{info.height}px)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Futbol Balear">
                  {Object.entries(FUTBOL_SLOTS).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.label} ({info.width}x{info.height}px)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => setForm(prev => ({ ...prev, is_published: e.target.checked }))}
                className="w-4 h-4 text-radio-blue rounded border-gray-300 focus:ring-radio-blue"
              />
              <span className="text-sm font-medium text-gray-700">Publicada</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.has_drop_cap}
                onChange={e => setForm(prev => ({ ...prev, has_drop_cap: e.target.checked }))}
                className="w-4 h-4 text-marca-red rounded border-gray-300 focus:ring-marca-red"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Letra capital roja</span>
                <span className="text-marca-red font-bold text-xl leading-none font-serif">A</span>
              </div>
            </label>
            {form.has_drop_cap && (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                La primera letra del contenido se mostrara en grande y en rojo Marca al leer la noticia.
              </p>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_favorite}
                onChange={e => setForm(prev => ({ ...prev, is_favorite: e.target.checked }))}
                className="w-4 h-4 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Favorita (slot grande 1024x1024)
              </span>
            </label>
            {form.is_favorite && (
              <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                Al marcar como favorita, esta noticia ocupara el slot grande del bento en la portada. La favorita anterior sera reemplazada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
