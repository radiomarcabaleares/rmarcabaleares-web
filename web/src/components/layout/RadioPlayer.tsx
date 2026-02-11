'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Radio } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';

const STREAM_BALEARES = '/stream/baleares';
const STREAM_MADRID = 'https://28513.live.streamtheworld.com/RADIOMARCA_NACIONAL.mp3';
const FALLBACK_CHECK_INTERVAL = 30000; // Comprobar si Baleares vuelve cada 30s

const WAVE_BAR_COUNT = 28;
const WAVE_DELAYS = Array.from({ length: WAVE_BAR_COUNT }, (_, i) =>
  `${(Math.sin(i * 0.7) * 0.3 + 0.1).toFixed(2)}s`
);

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [currentStream, setCurrentStream] = useState<'baleares' | 'madrid'>('baleares');
  const isPlayingRef = useRef(false);
  const intentionalStopRef = useRef(false);

  // Check if a stream is reachable
  const checkStream = useCallback((url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const test = new Audio();
      const timeout = setTimeout(() => {
        test.src = '';
        test.load();
        resolve(false);
      }, 5000);

      test.addEventListener('canplay', () => {
        clearTimeout(timeout);
        test.src = '';
        test.load();
        resolve(true);
      }, { once: true });

      test.addEventListener('error', () => {
        clearTimeout(timeout);
        test.src = '';
        test.load();
        resolve(false);
      }, { once: true });

      test.src = url;
      test.load();
    });
  }, []);

  // Switch stream without stopping playback feel
  const switchToStream = useCallback((stream: 'baleares' | 'madrid') => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = stream === 'baleares' ? STREAM_BALEARES : STREAM_MADRID;
    setCurrentStream(stream);
    if (isPlayingRef.current) {
      setIsLoading(true);
      audio.src = url;
      audio.load();
      audio.play().catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  }, []);

  // Periodically check if Baleares comes back when on Madrid fallback
  useEffect(() => {
    if (currentStream === 'madrid' && isPlaying) {
      fallbackCheckRef.current = setInterval(async () => {
        const available = await checkStream(STREAM_BALEARES);
        if (available) {
          switchToStream('baleares');
        }
      }, FALLBACK_CHECK_INTERVAL);
    }
    return () => {
      if (fallbackCheckRef.current) {
        clearInterval(fallbackCheckRef.current);
        fallbackCheckRef.current = null;
      }
    };
  }, [currentStream, isPlaying, checkStream, switchToStream]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('playing', () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsLoading(false);
    });
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    });
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('error', () => {
      // Ignore errors from intentional stop (pause button)
      if (intentionalStopRef.current) {
        intentionalStopRef.current = false;
        setIsLoading(false);
        return;
      }
      // If Baleares fails, try Madrid as fallback
      if (isPlayingRef.current || audio.src.includes('/stream/baleares')) {
        setCurrentStream('madrid');
        audio.src = STREAM_MADRID;
        audio.load();
        audio.play().catch(() => {
          setIsPlaying(false);
          isPlayingRef.current = false;
          setIsLoading(false);
        });
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsLoading(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingRef.current) {
      intentionalStopRef.current = true;
      audio.pause();
      audio.src = '';
      setIsPlaying(false);
      isPlayingRef.current = false;
      setIsLoading(false);
      setCurrentStream('baleares');
    } else {
      setIsLoading(true);
      // Try Baleares first, fallback to Madrid
      const balearesOk = await checkStream(STREAM_BALEARES);
      const url = balearesOk ? STREAM_BALEARES : STREAM_MADRID;
      setCurrentStream(balearesOk ? 'baleares' : 'madrid');
      audio.src = url;
      audio.load();
      audio.play().catch(() => {
        setIsLoading(false);
        setIsPlaying(false);
      });
    }
  }, [checkStream]);

  const toggleVolumePopup = useCallback(() => setShowVolume((v) => !v), []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glow effect above the bar */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Main player bar */}
      <div className="relative bg-gradient-to-r from-[#0A1929] via-[#132F52] to-[#0A1929] border-t border-white/10">
        {/* Animated accent glow behind play button */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full bg-marca-red/15 blur-3xl animate-pulse" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto flex items-center gap-3 md:gap-5 px-4 md:px-6 py-3">
          {/* Left: Logo + Live badge */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="relative w-16 h-16 md:w-18 md:h-18 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 overflow-hidden flex-shrink-0">
              <Image
                src={BRAND.logos.vertical}
                alt={BRAND.name}
                fill
                className="object-contain"
                sizes="72px"
              />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
              <span className="text-white font-bold text-sm uppercase tracking-wide">RADIO</span>
              <span className="text-marca-red font-bold text-sm uppercase tracking-wide">MARCA</span>
              <span className="text-white font-bold text-sm uppercase tracking-wide">BALEARES</span>
            </div>
          </div>

          {/* Center: Play button + wave visualization */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {/* Audio wave bars - left side */}
            <div className="hidden md:flex items-center gap-[2px] h-8">
              {WAVE_DELAYS.slice(0, WAVE_BAR_COUNT / 2).map((delay, i) => (
                <div
                  key={`l-${i}`}
                  className="w-[3px] rounded-full origin-bottom transition-all duration-300"
                  style={{
                    height: '100%',
                    background: isPlaying
                      ? `linear-gradient(to top, #E2001A, #FF6B7A)`
                      : 'rgba(255,255,255,0.15)',
                    animation: isPlaying
                      ? `playerWave 1.1s ease-in-out ${delay} infinite`
                      : 'none',
                    transform: isPlaying ? undefined : 'scaleY(0.2)',
                  }}
                />
              ))}
            </div>

            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-300 focus:outline-none"
              aria-label={isPlaying ? 'Pausar radio' : 'Reproducir radio'}
            >
              {/* Outer ring glow */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isPlaying
                  ? 'bg-marca-red shadow-[0_0_30px_rgba(226,0,26,0.5)]'
                  : 'bg-white/15 group-hover:bg-marca-red group-hover:shadow-[0_0_25px_rgba(226,0,26,0.4)]'
              }`} />

              {/* Pulsing ring when playing */}
              {isPlaying && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-marca-red/50 animate-ping" />
                  <div className="absolute -inset-1 rounded-full border border-marca-red/20 animate-pulse" />
                </>
              )}

              {/* Icon */}
              <div className="relative z-10">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={24} className="text-white fill-white" />
                ) : (
                  <Play size={24} className="text-white fill-white ml-1" />
                )}
              </div>
            </button>

            {/* Audio wave bars - right side */}
            <div className="hidden md:flex items-center gap-[2px] h-8">
              {WAVE_DELAYS.slice(WAVE_BAR_COUNT / 2).map((delay, i) => (
                <div
                  key={`r-${i}`}
                  className="w-[3px] rounded-full origin-bottom transition-all duration-300"
                  style={{
                    height: '100%',
                    background: isPlaying
                      ? `linear-gradient(to top, #E2001A, #FF6B7A)`
                      : 'rgba(255,255,255,0.15)',
                    animation: isPlaying
                      ? `playerWave 1.1s ease-in-out ${delay} infinite`
                      : 'none',
                    transform: isPlaying ? undefined : 'scaleY(0.2)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: Live badge + Volume */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Badge container - fixed width to prevent layout shift */}
            <div className="hidden sm:block relative w-[175px] h-7">
              {/* EN DIRECTO badge */}
              <div className={`absolute inset-0 inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full transition-opacity duration-300 ${
                isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${currentStream === 'baleares' ? 'bg-marca-red/20 border border-marca-red/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentStream === 'baleares' ? 'bg-marca-red' : 'bg-amber-500'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStream === 'baleares' ? 'bg-marca-red' : 'bg-amber-500'}`} />
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${currentStream === 'baleares' ? 'text-marca-red' : 'text-amber-500'}`}>
                  {currentStream === 'baleares' ? 'En Directo' : 'Marca Nacional'}
                </span>
              </div>

              {/* FM frequencies badge */}
              <div className={`absolute inset-0 inline-flex items-center justify-center gap-1.5 bg-white/10 border border-white/20 px-3 py-1 rounded-full transition-opacity duration-300 ${
                !isPlaying && !isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <Radio size={12} className="text-white/80" />
                <span className="text-white/80 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap">
                  91.6 | 102.1 | 98.7 FM
                </span>
              </div>
            </div>

            {/* Volume control */}
            <div
              className="relative"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              {/* Vertical volume slider - pops up */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 pb-2 transition-all duration-300 ${
                  showVolume ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                }`}
              >
                <div
                  className="bg-[#0A1929]/95 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-4 shadow-xl flex flex-col items-center gap-2"
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                    }}
                    className="w-1 h-24 rounded-full appearance-none cursor-pointer
                      bg-white/20 touch-none
                      [writing-mode:vertical-lr]
                      [direction:rtl]
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(255,255,255,0.4)]
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-white
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer"
                    aria-label="Volumen"
                  />
                  <span className="text-white/50 text-[10px] font-bold">{Math.round(volume * 100)}</span>
                </div>
              </div>

              <button
                onClick={toggleVolumePopup}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                aria-label="Volumen"
              >
                {volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
