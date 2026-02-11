'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DAY_LABELS } from '@/lib/constants/programs';
import LateralAds from '@/components/layout/LateralAds';
import { Clock, Radio } from 'lucide-react';
import type { Program } from '@/lib/supabase/types';

const DAYS_ORDER = ['L', 'M', 'X', 'J', 'V'];

function resolveLogoSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://')) return src;
  return `/images/programas/${src}`;
}

export default function ProgramasPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await fetch('/api/public/programs');
        const json = await res.json();
        if (res.ok && json.data) setPrograms(json.data);
      } catch (err) {
        console.error('Error fetching programs:', err);
      }
      setLoading(false);
    };
    fetchPrograms();
  }, []);

  const activePrograms = programs.filter(p => !p.is_coming_soon);
  const comingSoon = programs.filter(p => p.is_coming_soon);

  if (loading) {
    return (
      <LateralAds>
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="h-[500px] bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </LateralAds>
    );
  }

  return (
    <LateralAds>
      <div>
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Programas</h1>
        <p className="text-gray-500 mb-8">Parrilla de programacion de Radio Marca Baleares</p>

        {/* Schedule Grid - hidden on mobile */}
        <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-5 bg-radio-blue text-white">
            {DAYS_ORDER.map(day => (
              <div key={day} className="py-3 text-center font-bold text-sm md:text-base">
                <span className="hidden md:inline">{DAY_LABELS[day]}</span>
                <span className="md:hidden">{day}</span>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-5 min-h-[500px]">
            {DAYS_ORDER.map(day => (
              <div key={day} className="border-r border-gray-100 last:border-r-0 p-2 space-y-2">
                {activePrograms
                  .filter(p => p.days.includes(day))
                  .sort((a, b) => a.start_hour - b.start_hour)
                  .map(program => (
                    <div
                      key={program.id}
                      className="bg-gradient-to-br from-radio-blue/5 to-marca-red/5 rounded-xl p-3 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col items-center gap-2">
                        {resolveLogoSrc(program.logo_path) ? (
                          <Image
                            src={resolveLogoSrc(program.logo_path)!}
                            alt={program.name}
                            width={80}
                            height={80}
                            className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Radio size={24} className="text-gray-300" />
                          </div>
                        )}
                        <h3 className="text-xs md:text-sm font-bold text-brand-dark text-center leading-tight">
                          {program.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{program.start_hour}:00 - {program.end_hour}:00</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Programs List (mobile) */}
        <div className="md:hidden space-y-3">
          {activePrograms.map(program => (
            <div
              key={program.id}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm"
            >
              {resolveLogoSrc(program.logo_path) ? (
                <Image
                  src={resolveLogoSrc(program.logo_path)!}
                  alt={program.name}
                  width={60}
                  height={60}
                  className="w-14 h-14 object-contain rounded-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Radio size={20} className="text-gray-300" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-brand-dark">{program.name}</h3>
                <p className="text-sm text-gray-500">
                  {program.days.map(d => DAY_LABELS[d]).join(', ')}
                </p>
                <p className="text-sm text-gray-500">
                  {program.start_hour}:00 - {program.end_hour}:00
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon */}
        {comingSoon.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-brand-dark mb-4">Proximamente</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {comingSoon.map(program => (
                <div
                  key={program.id}
                  className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center gap-3 overflow-hidden"
                >
                  {/* Coming Soon Banner */}
                  <div className="absolute top-3 right-[-30px] bg-marca-red text-white text-xs font-bold px-8 py-1 rotate-45 shadow-md">
                    PRONTO
                  </div>
                  {resolveLogoSrc(program.logo_path) ? (
                    <Image
                      src={resolveLogoSrc(program.logo_path)!}
                      alt={program.name}
                      width={100}
                      height={100}
                      className="w-24 h-24 object-contain rounded-xl opacity-60"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center opacity-60">
                      <Radio size={32} className="text-gray-300" />
                    </div>
                  )}
                  <h3 className="font-bold text-brand-dark text-lg">{program.name}</h3>
                  <span className="text-sm text-gray-400 italic">Proximamente</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </LateralAds>
  );
}
