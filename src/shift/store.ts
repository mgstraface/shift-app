// Persistencia local. Usa el key-value de expo-sqlite (sincrónico), así la
// jornada activa sobrevive a que se cierre la app o se reinicie el celular.
// Cuando sumemos shift-api, estos datos se sincronizan con el servidor.
import Storage from 'expo-sqlite/kv-store';

import type { Shift } from './types';

const ACTIVE_KEY = 'shift.active.v1';
const LIST_KEY = 'shift.list.v1';
const ONBOARDING_KEY = 'onboarding.done.v1';

function read<T>(key: string, fallback: T): T {
  const raw = Storage.getItemSync(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getActiveShift(): Shift | null {
  return read<Shift | null>(ACTIVE_KEY, null);
}

export function setActiveShift(shift: Shift | null) {
  if (shift) Storage.setItemSync(ACTIVE_KEY, JSON.stringify(shift));
  else Storage.removeItemSync(ACTIVE_KEY);
}

export function listShifts(): Shift[] {
  return read<Shift[]>(LIST_KEY, []);
}

export function getShift(id: string): Shift | null {
  const active = getActiveShift();
  if (active?.id === id) return active;
  return listShifts().find((s) => s.id === id) ?? null;
}

export function saveShift(shift: Shift) {
  const others = listShifts().filter((s) => s.id !== shift.id);
  const next = [shift, ...others].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  Storage.setItemSync(LIST_KEY, JSON.stringify(next));
}

export function clearAllShifts() {
  Storage.removeItemSync(LIST_KEY);
  Storage.removeItemSync(ACTIVE_KEY);
}

export function isOnboardingDone() {
  return Storage.getItemSync(ONBOARDING_KEY) === '1';
}

export function setOnboardingDone() {
  Storage.setItemSync(ONBOARDING_KEY, '1');
}
