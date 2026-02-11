'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { News, BentoSlot } from '@/lib/supabase/types';
import { BENTO_SLOTS, FUTBOL_SLOTS } from '@/lib/constants/brand';
import { X, Search, Loader2, LayoutGrid, Save, Pencil } from 'lucide-react';

const ALL_SLOT_INFO: Record<string, { width: number; height: number; label: string; aspect: string }> = {
  ...BENTO_SLOTS,
  ...FUTBOL_SLOTS,
};

type SlotMap = Record<string, News | null>;

export default function MaquetaPage() {
  const [slots, setSlots] = useState<SlotMap>({
    large: null,
    horizontal: null,
    small_1: null,
    small_2: null,
    futbol_1: null,
    futbol_2: null,
    futbol_3: null,
  });
  const [loading, setLoading] = useState(true);
  const [modalSlot, setModalSlot] = useState<BentoSlot | null>(null);
  const [availableNews, setAvailableNews] = useState<News[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assigning, setAssigning] = useState(false);

  // YouTube settings
  const [youtubeId, setYoutubeId] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [editingYoutube, setEditingYoutube] = useState(false);
  const [savingYoutube, setSavingYoutube] = useState(false);

  // Track which futbol slots are auto-filled (not manually assigned)
  const [autoFutbolSlots, setAutoFutbolSlots] = useState<Set<string>>(new Set());

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/admin/maqueta');
      const json = await res.json();
      const map: SlotMap = {
        large: null, horizontal: null, small_1: null, small_2: null,
        futbol_1: null, futbol_2: null, futbol_3: null,
      };
      if (res.ok && json.data) {
        (json.data as News[]).forEach(n => {
          if (n.bento_slot) map[n.bento_slot] = n;
        });
      }

      // If no futbol slots assigned, fetch latest from category as preview
      const hasFutbolAssigned = map.futbol_1 || map.futbol_2 || map.futbol_3;
      const autoSlots = new Set<string>();

      if (!hasFutbolAssigned) {
        try {
          const catRes = await fetch('/api/public/news?categorySlug=futbol-balear&limit=3');
          if (catRes.ok) {
            const { news: catNews } = await catRes.json();
            if (catNews && catNews.length > 0) {
              const slotKeys = ['futbol_1', 'futbol_2', 'futbol_3'];
              (catNews as News[]).forEach((n: News, i: number) => {
                if (i < 3) {
                  map[slotKeys[i]] = n;
                  autoSlots.add(slotKeys[i]);
                }
              });
            }
          }
        } catch {
          // Silently fail
        }
      }

      setAutoFutbolSlots(autoSlots);
      setSlots(map);
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
    setLoading(false);
  };

  const fetchYoutubeId = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=futbol_balear_youtube_id');
      const json = await res.json();
      if (res.ok && json.data?.value) {
        setYoutubeId(json.data.value);
        setYoutubeInput(json.data.value);
      }
    } catch (err) {
      console.error('Error fetching youtube id:', err);
    }
  };

  useEffect(() => {
    fetchSlots();
    fetchYoutubeId();
  }, []);

  const openModal = async (slot: BentoSlot) => {
    if (slot === 'large') return;
    setModalSlot(slot);
    setSearchQuery('');

    try {
      const res = await fetch('/api/admin/maqueta?available=true');
      const json = await res.json();
      if (res.ok && json.data) setAvailableNews(json.data as News[]);
    } catch (err) {
      console.error('Error fetching available news:', err);
    }
  };

  const assignNews = async (newsId: string) => {
    if (!modalSlot) return;
    setAssigning(true);

    try {
      await fetch('/api/admin/maqueta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign',
          newsId,
          slot: modalSlot,
          currentNewsId: slots[modalSlot]?.id || null,
        }),
      });
    } catch (err) {
      console.error('Error assigning news:', err);
    }

    setModalSlot(null);
    setAssigning(false);
    fetchSlots();
  };

  const unassignSlot = async (slot: BentoSlot) => {
    const news = slots[slot];
    if (!news) return;
    if (!confirm('Quitar esta noticia del slot?')) return;

    try {
      await fetch('/api/admin/maqueta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unassign',
          newsId: news.id,
          slot,
        }),
      });
    } catch (err) {
      console.error('Error unassigning slot:', err);
    }

    fetchSlots();
  };

  const saveYoutubeId = async () => {
    const input = youtubeInput.trim();
    if (!input) return;

    // Extract video ID from full URL or just use as-is
    let videoId = input;
    try {
      const url = new URL(input);
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || input;
      } else if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      }
    } catch {
      // Not a URL, assume it's a video ID already
    }

    setSavingYoutube(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'futbol_balear_youtube_id', value: videoId }),
      });
      setYoutubeId(videoId);
      setYoutubeInput(videoId);
      setEditingYoutube(false);
    } catch (err) {
      console.error('Error saving youtube id:', err);
    }
    setSavingYoutube(false);
  };

  const filteredNews = availableNews.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSlotLabel = (slot: string) => {
    return ALL_SLOT_INFO[slot]?.label || slot;
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
      <div className="flex items-center gap-3 mb-6">
        <LayoutGrid size={24} className="text-radio-blue" />
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Maqueta Visual</h1>
          <p className="text-sm text-gray-500">Asigna noticias a los slots destacados de la portada</p>
        </div>
      </div>

      {/* Bento Grid Preview - Noticias Destacadas */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-brand-dark mb-4">Noticias Destacadas</h2>
        <div className="grid gap-4 grid-cols-[9fr_4fr_4fr] grid-rows-[5fr_4fr] aspect-[17/9]">
          {/* Large slot - spans 2 rows on left */}
          <div className="[grid-area:1/1/3/2]">
            <SlotBlock
              slot="large"
              news={slots.large}
              info={BENTO_SLOTS.large}
              onClickSlot={() => {}}
              onUnassign={() => unassignSlot('large')}
              isLarge
            />
          </div>

          {/* Horizontal slot - top right, spans 2 cols */}
          <div className="[grid-area:1/2/2/4]">
            <SlotBlock
              slot="horizontal"
              news={slots.horizontal}
              info={BENTO_SLOTS.horizontal}
              onClickSlot={() => openModal('horizontal')}
              onUnassign={() => unassignSlot('horizontal')}
            />
          </div>

          {/* Small slot 1 */}
          <div>
            <SlotBlock
              slot="small_1"
              news={slots.small_1}
              info={BENTO_SLOTS.small_1}
              onClickSlot={() => openModal('small_1')}
              onUnassign={() => unassignSlot('small_1')}
            />
          </div>

          {/* Small slot 2 */}
          <div>
            <SlotBlock
              slot="small_2"
              news={slots.small_2}
              info={BENTO_SLOTS.small_2}
              onClickSlot={() => openModal('small_2')}
              onUnassign={() => unassignSlot('small_2')}
            />
          </div>
        </div>

        {/* Size guide */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tamanos recomendados de imagen</p>
          <div className="flex flex-wrap gap-4">
            {Object.entries(BENTO_SLOTS).map(([key, info]) => (
              <span key={key} className="text-xs text-gray-400">
                {info.label}: {info.width}x{info.height}px ({info.aspect})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Fútbol Balear Section - Interactive */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h2 className="text-lg font-bold text-brand-dark mb-4">Futbol Balear</h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* YouTube - live preview or edit */}
          <div className="md:w-3/5 shrink-0">
            {youtubeId && !editingYoutube ? (
              <div className="relative group">
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="Futbol Balear - YouTube"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
                <button
                  onClick={() => { setYoutubeInput(youtubeId); setEditingYoutube(true); }}
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil size={12} />
                  Cambiar video
                </button>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 p-4">
                <p className="text-sm font-semibold text-gray-500">Video YouTube</p>
                <p className="text-xs text-gray-400">Pega el link o ID del video</p>
                <div className="flex gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={e => setYoutubeInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... o ID"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none"
                  />
                  <button
                    onClick={saveYoutubeId}
                    disabled={savingYoutube || !youtubeInput.trim()}
                    className="flex items-center gap-1 px-3 py-2 bg-radio-blue text-white rounded-lg text-sm font-medium hover:bg-radio-blue-light disabled:opacity-50 transition-colors"
                  >
                    {savingYoutube ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Guardar
                  </button>
                </div>
                {editingYoutube && (
                  <button
                    onClick={() => setEditingYoutube(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3 Futbol Balear news slots */}
          <div className="flex-1 flex flex-col gap-2">
            {(['futbol_1', 'futbol_2', 'futbol_3'] as BentoSlot[]).map(slot => (
              <div key={slot} className="flex-1 min-h-[80px]">
                <SlotBlock
                  slot={slot}
                  news={slots[slot]}
                  info={FUTBOL_SLOTS[slot as keyof typeof FUTBOL_SLOTS]}
                  onClickSlot={() => openModal(slot)}
                  onUnassign={() => unassignSlot(slot)}
                  isAuto={autoFutbolSlots.has(slot)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for selecting news */}
      {modalSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-brand-dark">
                Asignar noticia a: {getSlotLabel(modalSlot)}
              </h2>
              <button
                onClick={() => setModalSlot(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar noticia..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-radio-blue focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredNews.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No hay noticias disponibles</p>
              ) : (
                filteredNews.map(news => (
                  <button
                    key={news.id}
                    onClick={() => assignNews(news.id)}
                    disabled={assigning}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                  >
                    {news.cover_image_url ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                        <Image src={news.cover_image_url} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-brand-dark truncate">{news.title}</p>
                      <p className="text-xs text-gray-400">
                        {news.category?.name}
                        {news.published_at && (
                          <> &middot; {new Date(news.published_at).toLocaleDateString('es-ES')}</>
                        )}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SlotBlock({
  slot,
  news,
  info,
  onClickSlot,
  onUnassign,
  isLarge = false,
  isAuto = false,
}: {
  slot: string;
  news: News | null;
  info: { width: number; height: number; label: string; aspect: string };
  onClickSlot: () => void;
  onUnassign: () => void;
  isLarge?: boolean;
  isAuto?: boolean;
}) {
  if (news) {
    return (
      <div className={`relative h-full rounded-xl overflow-hidden group border-2 ${isAuto ? 'border-blue-300' : 'border-gray-200'}`}>
        {news.cover_image_url ? (
          <Image src={news.cover_image_url} alt="" fill className="object-cover" sizes="400px" />
        ) : (
          <div className="absolute inset-0 bg-radio-blue" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col justify-end p-3">
          {isLarge && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              FAVORITO
            </span>
          )}
          {isAuto && (
            <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
              AUTO
            </span>
          )}
          <p className="text-white font-semibold text-sm line-clamp-2">{news.title}</p>
          <p className="text-white/60 text-xs mt-1">{info.label}</p>
        </div>
        {!isAuto && (
          <button
            onClick={onUnassign}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        )}
        {isAuto && (
          <button
            onClick={onClickSlot}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Fijar manualmente
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClickSlot}
      className={`w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 transition-colors ${
        isLarge
          ? 'cursor-default bg-yellow-50/50 border-yellow-200'
          : 'hover:border-radio-blue hover:bg-radio-blue/5 cursor-pointer'
      }`}
    >
      <p className="text-sm font-semibold text-gray-400">{info.label}</p>
      <p className="text-xs text-gray-300">{info.width}x{info.height}px ({info.aspect})</p>
      {isLarge ? (
        <p className="text-[10px] text-yellow-600 text-center px-4">
          Se asigna automaticamente al marcar una noticia como favorita
        </p>
      ) : (
        <p className="text-[10px] text-gray-300">Click para asignar</p>
      )}
    </button>
  );
}
