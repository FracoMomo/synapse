import { useState, useMemo } from 'react';
import { MOCK_CALENDAR_EVENTS, CalendarEvent } from '../constants/mockData';

// ── Types ─────────────────────────────────────────────────────────────────

export interface WeekDay {
  date: Date;
  label: string;       // 'Mon', 'Tue', ...
  dayNum: number;      // 25, 26, 27, ...
  key: string;         // '2026-05-27' ISO date string
  isToday: boolean;
  dateOffset: number;  // 0 = today, 1 = tomorrow, -1 = yesterday
}

export type CalendarEventWithStatus = CalendarEvent & {
  isNow: boolean;
  isDue: boolean;
};

// ── Date helpers ──────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(d: Date): string {
  // Produces 'YYYY-MM-DD' in local time (not UTC)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildWeekDays(): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);

  // Find Monday of this week (ISO week: Mon = first day)
  const dow = today.getDay(); // 0 = Sun
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const key = toDateKey(d);
    const msOffset = d.getTime() - today.getTime();
    const dateOffset = Math.round(msOffset / (1000 * 60 * 60 * 24));
    return {
      date: d,
      label: DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      key,
      isToday: key === todayKey,
      dateOffset,
    };
  });
}

// ── isNow / isDue logic ───────────────────────────────────────────────────

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function computeIsNow(ev: CalendarEvent): boolean {
  if (ev.type === 'deadline') return false;
  if (ev.dateOffset !== 0) return false;
  if (!ev.endTime) return false;

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= timeToMins(ev.startTime) && nowMins < timeToMins(ev.endTime);
}

function computeIsDue(ev: CalendarEvent): boolean {
  // Mark today's deadlines as DUE; past deadlines are shown but not flagged
  return ev.type === 'deadline' && ev.dateOffset === 0;
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useCalendar() {
  // Build week days once per mount (stable across re-renders)
  const weekDays = useMemo(buildWeekDays, []);

  const todayKey = weekDays.find(d => d.isToday)?.key ?? weekDays[0].key;
  const [selectedKey, setSelectedKey] = useState<string>(todayKey);

  // MS Teams link state — will be driven by OAuth token in Phase 6
  const [isMsTeamsLinked, setIsMsTeamsLinked] = useState(false);

  const selectedDay = weekDays.find(d => d.key === selectedKey) ?? weekDays[0];

  const eventsForDay = useMemo((): CalendarEventWithStatus[] => {
    return MOCK_CALENDAR_EVENTS
      .filter(ev => ev.dateOffset === selectedDay.dateOffset)
      .map(ev => ({
        ...ev,
        isNow: computeIsNow(ev),
        isDue: computeIsDue(ev),
      }))
      .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Placeholder for MS Teams OAuth trigger.
   * In Phase 6: replace with expo-auth-session promptAsync()
   * and store the resulting access token.
   * See src/lib/msGraph.ts for the full integration blueprint.
   */
  const linkMsTeams = () => {
    // TODO Phase 6: trigger OAuth, fetch token, call fetchMsCalendarEvents,
    // merge results with synapse events, setIsMsTeamsLinked(true)
    console.log('[msGraph] OAuth pending — see src/lib/msGraph.ts setup checklist');
  };

  return {
    weekDays,
    selectedKey,
    selectedDay,
    setSelectedKey,
    eventsForDay,
    isMsTeamsLinked,
    linkMsTeams,
  };
}
