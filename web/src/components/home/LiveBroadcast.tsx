'use client';

import Image from 'next/image';
import { useCurrentProgram } from '@/hooks/useCurrentProgram';
import { BRAND } from '@/lib/constants/brand';
import { Volume2, Calendar } from 'lucide-react';

const WAVE_DELAYS = [
  '0s', '0.1s', '0.15s', '0.25s', '0.05s',
  '0.3s', '0.2s', '0.12s', '0.28s', '0.08s',
  '0.22s', '0.18s', '0.35s', '0.14s', '0.26s',
];

export default function LiveBroadcast() {
  const { currentProgram, nextBroadcast } = useCurrentProgram();

  // What to display: current program, or next upcoming
  const program = currentProgram ?? nextBroadcast?.program ?? null;
  const isLive = !!currentProgram;

  if (!program) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl shadow-xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F2544] via-[#1B3C6E] to-[#0F2544]" />

      {/* Subtle accent */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(ellipse at 0% 50%, rgba(226, 0, 26, 0.5) 0%, transparent 50%)`,
      }} />

      {/* Content row */}
      <div className="relative z-10 flex items-center gap-4 md:gap-6 px-5 md:px-8 py-4 md:py-5">
        {/* Program logo — left */}
        <div className="shrink-0 relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 shadow-lg">
          <Image
            src={program.logoPath}
            alt={program.name}
            fill
            className="object-contain p-2"
            sizes="80px"
          />
        </div>

        {/* Center info */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          {isLive ? (
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-marca-red px-3 py-0.5 rounded-full text-white text-[11px] font-bold uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
                En Directo
              </span>
              {/* Audio wave — inline */}
              <div className="hidden sm:flex items-center gap-[2px] h-4 ml-1">
                {WAVE_DELAYS.map((delay, i) => (
                  <div
                    key={i}
                    className="w-[2px] h-full bg-marca-red/50 rounded-full origin-bottom"
                    style={{ animation: `audioWave 1.2s ease-in-out ${delay} infinite` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-white/80 text-[11px] font-bold uppercase tracking-wider">
                <Calendar size={11} />
                Proxima emision
              </span>
            </div>
          )}

          {/* Program name */}
          <h2 className="text-lg md:text-xl font-black text-white truncate">
            {program.name}
          </h2>

          {/* Schedule */}
          <p className="text-white/45 text-xs md:text-sm font-medium flex items-center gap-1.5">
            <Volume2 size={13} className="shrink-0" />
            {isLive ? (
              <span>{program.startHour}:00 - {program.endHour}:00h</span>
            ) : (
              <span>{nextBroadcast?.dayLabel} &middot; {program.startHour}:00 - {program.endHour}:00h</span>
            )}
          </p>
        </div>

        {/* Radio Marca logo — right */}
        <div className="shrink-0 hidden sm:block">
          <Image
            src={BRAND.logos.horizontal}
            alt={BRAND.name}
            width={140}
            height={35}
            className="h-7 md:h-9 w-auto brightness-0 invert"
          />
        </div>
      </div>
    </section>
  );
}
