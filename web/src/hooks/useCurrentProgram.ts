'use client';

import { useMemo } from 'react';
import { PROGRAMS_SCHEDULE, DAY_LABELS } from '@/lib/constants/programs';

const JS_DAY_TO_LETTER: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
};

const DAY_ORDER = ['L', 'M', 'X', 'J', 'V'];

export interface NextBroadcast {
  program: (typeof PROGRAMS_SCHEDULE)[number];
  dayLabel: string;
  isToday: boolean;
}

export function useCurrentProgram() {
  return useMemo(() => {
    const now = new Date();
    const spainTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const dayLetter = JS_DAY_TO_LETTER[spainTime.getDay()];
    const hour = spainTime.getHours();

    const activePrograms = PROGRAMS_SCHEDULE.filter(p => !p.isComingSoon);

    // Current program (if weekday and within hours)
    const currentProgram = dayLetter
      ? activePrograms.find(
          p => p.days.includes(dayLetter) && hour >= p.startHour && hour < p.endHour
        ) ?? null
      : null;

    // Next programs today
    const nextPrograms = dayLetter
      ? activePrograms
          .filter(p => p.days.includes(dayLetter) && p.startHour > hour)
          .sort((a, b) => a.startHour - b.startHour)
          .slice(0, 3)
      : [];

    // Find the very next broadcast (today or future day)
    let nextBroadcast: NextBroadcast | null = null;

    if (!currentProgram) {
      // Check remaining programs today first
      if (dayLetter && nextPrograms.length > 0) {
        nextBroadcast = {
          program: nextPrograms[0],
          dayLabel: 'Hoy',
          isToday: true,
        };
      } else {
        // Look ahead to next weekdays
        const currentDayIndex = dayLetter ? DAY_ORDER.indexOf(dayLetter) : -1;
        for (let offset = 1; offset <= 7; offset++) {
          const checkIndex = (currentDayIndex + offset) % 5;
          const checkDay = DAY_ORDER[checkIndex];
          const dayPrograms = activePrograms
            .filter(p => p.days.includes(checkDay))
            .sort((a, b) => a.startHour - b.startHour);
          if (dayPrograms.length > 0) {
            nextBroadcast = {
              program: dayPrograms[0],
              dayLabel: DAY_LABELS[checkDay] || checkDay,
              isToday: false,
            };
            break;
          }
        }
      }
    }

    return { currentProgram, nextPrograms, nextBroadcast };
  }, []);
}
