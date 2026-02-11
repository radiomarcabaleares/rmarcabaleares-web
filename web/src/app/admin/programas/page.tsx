'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import ImageUploader from '@/components/admin/ImageUploader';
import type { Program } from '@/lib/supabase/types';
import { Plus, Trash2, Eye, EyeOff, X, Save, Loader2, Clock, Radio } from 'lucide-react';

function resolveLogoSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) return src;
  // Old DB values are bare filenames like "d-lokos.png" — resolve to static path
  return `/images/programas/${src}`;
}

const DAYS_OPTIONS = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'X', label: 'X' },
  { value: 'J', label: 'J' },
  { value: 'V', label: 'V' },
];

const DAY_LABELS: Record<string, string> = {
  L: 'Lun', M: 'Mar', X: 'Mie', J: 'Jue', V: 'Vie',
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface ProgramForm {
  name: string;
  slug: string;
  description: string;
  logo_path: string;
  days: string[];
  start_hour: number;
  end_hour: number;
  is_coming_soon: boolean;
}

const EMPTY_FORM: ProgramForm = {
  name: '',
  slug: '',
  description: '',
  logo_path: '',
  days: [],
  start_hour: 12,
  end_hour: 13,
  is_coming_soon: false,
};

export default function AdminProgramasPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProgramForm>(EMPTY_FORM);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/programs');
      const json = await res.json();
      if (res.ok && json.data) setPrograms(json.data as Program[]);
    } catch (err) {
      console.error('Error fetching programs:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (program: Program) => {
    setForm({
      name: program.name,
      slug: program.slug,
      description: program.description || '',
      logo_path: program.logo_path || '',
      days: program.days,
      start_hour: program.start_hour,
      end_hour: program.end_hour,
      is_coming_soon: program.is_coming_soon,
    });
    setEditingId(program.id);
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : generateSlug(name),
    }));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);

    try {
      if (editingId) {
        await fetch('/api/admin/programs', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            updates: {
              name: form.name,
              slug: form.slug,
              description: form.description || null,
              logo_path: form.logo_path || null,
              days: form.days,
              start_hour: form.start_hour,
              end_hour: form.end_hour,
              is_coming_soon: form.is_coming_soon,
            },
          }),
        });
      } else {
        await fetch('/api/admin/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            logo_path: form.logo_path || null,
            days: form.days,
            start_hour: form.start_hour,
            end_hour: form.end_hour,
            is_coming_soon: form.is_coming_soon,
          }),
        });
      }
    } catch (err) {
      console.error('Error saving program:', err);
    }

    setSaving(false);
    resetForm();
    fetchPrograms();
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch('/api/admin/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { is_active: !current } }),
      });
    } catch (err) {
      console.error('Error toggling program:', err);
    }
    fetchPrograms();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar programa "${name}"?`)) return;
    try {
      await fetch('/api/admin/programs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error('Error deleting program:', err);
    }
    fetchPrograms();
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-brand-dark">Programas</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Nuevo Programa
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-radio-blue/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-dark">
              {editingId ? 'Editar Programa' : 'Nuevo Programa'}
            </h2>
            <button onClick={resetForm} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: text fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                  placeholder="Nombre del programa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm text-gray-500"
                  placeholder="nombre-del-programa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm resize-none"
                  rows={3}
                  placeholder="Descripcion del programa (opcional)"
                />
              </div>
            </div>

            {/* Middle column: schedule */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dias de emision</label>
                <div className="flex gap-2">
                  {DAYS_OPTIONS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        form.days.includes(day.value)
                          ? 'bg-radio-blue text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                  <select
                    value={form.start_hour}
                    onChange={e => setForm(prev => ({ ...prev, start_hour: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                  >
                    {hourOptions.map(h => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                  <select
                    value={form.end_hour}
                    onChange={e => setForm(prev => ({ ...prev, end_hour: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                  >
                    {hourOptions.map(h => (
                      <option key={h} value={h}>{h.toString().padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_coming_soon}
                  onChange={e => setForm(prev => ({ ...prev, is_coming_soon: e.target.checked }))}
                  className="w-4 h-4 text-radio-blue border-gray-300 rounded focus:ring-radio-blue"
                />
                <span className="text-sm text-gray-700">Proximamente (no aparece en la parrilla)</span>
              </label>
            </div>

            {/* Right column: image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo / Imagen</label>
              <ImageUploader
                bucket="program-images"
                path={editingId || 'new'}
                currentUrl={resolveLogoSrc(form.logo_path)}
                onUpload={url => setForm(prev => ({ ...prev, logo_path: url }))}
                onRemove={() => setForm(prev => ({ ...prev, logo_path: '' }))}
                recommendedSize="200x200px (cuadrada)"
                previewRatio="1/1"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.slug}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-radio-blue text-white rounded-lg hover:bg-radio-blue-light disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      {/* Programs List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl">
          <Radio size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay programas todavia</p>
        </div>
      ) : (
        <div className="space-y-2">
          {programs.map(program => (
            <div
              key={program.id}
              className={`bg-white rounded-xl border p-4 flex items-center gap-4 ${
                program.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                {resolveLogoSrc(program.logo_path) ? (
                  <Image
                    src={resolveLogoSrc(program.logo_path)!}
                    alt={program.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 object-contain"
                  />
                ) : (
                  <Radio size={24} className="text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-brand-dark truncate">{program.name}</h3>
                  {program.is_coming_soon && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">
                      Proximamente
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {program.days.length > 0 && (
                    <span className="flex items-center gap-1">
                      {program.days.map(d => DAY_LABELS[d] || d).join(', ')}
                    </span>
                  )}
                  {!program.is_coming_soon && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {program.start_hour}:00 - {program.end_hour}:00
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(program.id, program.is_active)}
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    program.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {program.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                  {program.is_active ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => startEdit(program)}
                  className="text-xs text-radio-blue hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(program.id, program.name)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
