import { health, type ShiftMetrics } from '@/health';
import { newId } from '@/lib/id';

import { assessCompleteness } from './completeness';
import { cancelReminder, scheduleEndReminder } from './reminder';
import { getActiveShift, getShift, saveShift, setActiveShift } from './store';
import type { Shift } from './types';

export async function startShift(garmentId: string | null = null): Promise<Shift> {
  const existing = getActiveShift();
  if (existing) return existing;

  const now = new Date().toISOString();
  const shift: Shift = {
    id: newId(),
    status: 'active',
    startedAt: now,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    garmentId,
    steps: null,
    distanceMeters: null,
    sources: [],
    updatedAt: now,
  };
  // Guardamos antes de pedir el permiso de notificaciones: la jornada ya cuenta.
  setActiveShift(shift);
  const reminderId = await scheduleEndReminder();
  const withReminder = { ...shift, reminderId };
  setActiveShift(withReminder);
  return withReminder;
}

/** Métricas de la jornada activa desde el inicio hasta ahora (para la pantalla en curso). */
export async function getLiveMetrics(shift: Shift): Promise<ShiftMetrics> {
  try {
    return await health.getMetrics(new Date(shift.startedAt), new Date());
  } catch (e) {
    console.warn('[SHIFT] Error leyendo métricas de salud:', e);
    return { steps: null, distanceMeters: null, sources: [] };
  }
}

export async function endShift(endedAt: Date = new Date()): Promise<Shift | null> {
  const active = getActiveShift();
  if (!active) return null;

  const metrics = await getLiveMetrics(active);
  const now = new Date().toISOString();
  const durationMs = endedAt.getTime() - new Date(active.startedAt).getTime();
  const done: Shift = {
    ...active,
    status: 'completed',
    endedAt: endedAt.toISOString(),
    ...metrics,
    dataCompleteness: assessCompleteness(metrics.steps, durationMs),
    syncedAt: now,
    updatedAt: now,
  };
  saveShift(done);
  setActiveShift(null);
  await cancelReminder(active.reminderId);
  return done;
}

/** Vuelve a consultar el intervalo (el reloj puede sincronizar horas después). */
export async function resyncShift(id: string): Promise<Shift | null> {
  const shift = getShift(id);
  if (!shift || shift.status !== 'completed' || !shift.endedAt) return shift;

  const start = new Date(shift.startedAt);
  const end = new Date(shift.endedAt);
  let metrics: ShiftMetrics;
  try {
    metrics = await health.getMetrics(start, end);
  } catch {
    return shift;
  }
  // Nunca pisamos datos existentes con "sin datos".
  const steps = metrics.steps ?? shift.steps;
  const now = new Date().toISOString();
  const updated: Shift = {
    ...shift,
    steps,
    distanceMeters: metrics.distanceMeters ?? shift.distanceMeters,
    sources: Array.from(new Set([...shift.sources, ...metrics.sources])),
    dataCompleteness: assessCompleteness(steps, end.getTime() - start.getTime()),
    syncedAt: now,
    updatedAt: now,
  };
  saveShift(updated);
  return updated;
}

export function rateComfort(id: string, rating: number) {
  const shift = getShift(id);
  if (!shift || shift.status !== 'completed') return;
  saveShift({ ...shift, comfortRating: rating, updatedAt: new Date().toISOString() });
}
