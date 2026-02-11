'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Ad, AdPosition } from '@/lib/supabase/types';
import { Plus, Trash2, Eye, EyeOff, X, Save, Loader2 } from 'lucide-react';

export default function AdminAnunciosPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'both' as AdPosition,
  });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads');
      const json = await res.json();
      if (res.ok && json.data) setAds(json.data as Ad[]);
    } catch (err) {
      console.error('Error fetching ads:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const resetForm = () => {
    setForm({ title: '', image_url: '', link_url: '', position: 'both' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (ad: Ad) => {
    setForm({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      position: ad.position,
    });
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.image_url) return;
    setSaving(true);

    try {
      if (editingId) {
        await fetch('/api/admin/ads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              title: form.title,
              image_url: form.image_url,
              link_url: form.link_url || null,
              position: form.position,
            },
          }),
        });
      } else {
        await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            image_url: form.image_url,
            link_url: form.link_url || null,
            position: form.position,
          }),
        });
      }
    } catch (err) {
      console.error('Error saving ad:', err);
    }

    setSaving(false);
    resetForm();
    fetchAds();
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { is_active: !current } }),
      });
    } catch (err) {
      console.error('Error toggling ad:', err);
    }
    fetchAds();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Eliminar anuncio "${title}"?`)) return;
    try {
      await fetch('/api/admin/ads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Error deleting ad:', err);
    }
    fetchAds();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Anuncios</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Anuncio
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-radio-blue/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-dark">
              {editingId ? 'Editar Anuncio' : 'Nuevo Anuncio'}
            </h2>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre interno *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                  placeholder="Nombre del anuncio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de destino</label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={e => setForm(prev => ({ ...prev, link_url: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posicion</label>
                <select
                  value={form.position}
                  onChange={e => setForm(prev => ({ ...prev, position: e.target.value as AdPosition }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                >
                  <option value="both">Ambos laterales</option>
                  <option value="left">Solo izquierda</option>
                  <option value="right">Solo derecha</option>
                  <option value="horizontal_1">Banner horizontal 1 (debajo de Noticias Destacadas)</option>
                  <option value="horizontal_2">Banner horizontal 2 (debajo de Futbol Balear)</option>
                </select>
                {(form.position === 'horizontal_1' || form.position === 'horizontal_2') && (
                  <p className="text-xs text-gray-400 mt-1">Se muestra entre secciones de la portada (970x90px)</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen *</label>
              <ImageUploader
                bucket="ad-images"
                path={editingId || 'new'}
                currentUrl={form.image_url || null}
                onUpload={url => setForm(prev => ({ ...prev, image_url: url }))}
                onRemove={() => setForm(prev => ({ ...prev, image_url: '' }))}
                recommendedSize={form.position.startsWith('horizontal') ? '970x90px (Leaderboard)' : '300x600px (IAB Half Page)'}
                previewRatio={form.position.startsWith('horizontal') ? '970/90' : '300/600'}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.image_url}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      {/* Ads List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <p className="text-gray-500">No hay anuncios todavia</p>
        </div>
      ) : (
        <>
          {/* Lateral Ads */}
          {ads.filter(a => !a.position.startsWith('horizontal')).length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-brand-dark mb-3">Anuncios Laterales</h2>
              <p className="text-xs text-gray-400 mb-4">Se muestran a los lados del contenido principal (300x600px)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.filter(a => !a.position.startsWith('horizontal')).map(ad => (
                  <AdCard key={ad.id} ad={ad} onToggle={toggleActive} onEdit={startEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Horizontal Ads */}
          {ads.filter(a => a.position.startsWith('horizontal')).length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-brand-dark mb-3">Anuncios Horizontales</h2>
              <p className="text-xs text-gray-400 mb-4">Se muestran entre secciones de la portada (970x90px)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.filter(a => a.position.startsWith('horizontal')).map(ad => (
                  <AdCard key={ad.id} ad={ad} onToggle={toggleActive} onEdit={startEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Show empty state for horizontal if none exist */}
          {ads.filter(a => a.position.startsWith('horizontal')).length === 0 && (
            <div>
              <h2 className="text-lg font-bold text-brand-dark mb-3">Anuncios Horizontales</h2>
              <p className="text-xs text-gray-400 mb-4">Se muestran entre secciones de la portada (970x90px)</p>
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No hay anuncios horizontales</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AdCard({
  ad,
  onToggle,
  onEdit,
  onDelete,
}: {
  ad: Ad;
  onToggle: (id: string, current: boolean) => void;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string, title: string) => void;
}) {
  const posLabel =
    ad.position === 'both' ? 'Ambos laterales'
    : ad.position === 'left' ? 'Izquierda'
    : ad.position === 'right' ? 'Derecha'
    : ad.position === 'horizontal_1' ? 'Horizontal 1 (tras Destacadas)'
    : 'Horizontal 2 (tras Futbol Balear)';

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className={`relative bg-gray-100 ${ad.position.startsWith('horizontal') ? 'h-24' : 'h-40'}`}>
        <Image src={ad.image_url} alt={ad.title} fill className="object-contain" sizes="300px" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-brand-dark">{ad.title}</h3>
        <p className="text-xs text-gray-400 mt-1">Posicion: {posLabel}</p>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onToggle(ad.id, ad.is_active)}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              ad.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {ad.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
            {ad.is_active ? 'Activo' : 'Inactivo'}
          </button>
          <button
            onClick={() => onEdit(ad)}
            className="text-xs text-radio-blue hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(ad.id, ad.title)}
            className="p-1 text-gray-400 hover:text-red-500 ml-auto"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
