const LOCALE = 'es-AR';

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString(LOCALE);
}

export function formatKm(meters: number): string {
  return `${(meters / 1000).toLocaleString(LOCALE, { maximumFractionDigits: 1 })} km`;
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

/** Cronómetro hh:mm:ss para la jornada en curso. */
export function formatClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });
}
