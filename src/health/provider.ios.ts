import { Linking } from 'react-native';
import {
  isHealthDataAvailable,
  queryStatisticsForQuantity,
  requestAuthorization,
} from '@kingstinct/react-native-healthkit';

import type { HealthProvider, ShiftMetrics } from './types';

const STEPS = 'HKQuantityTypeIdentifierStepCount' as const;
const DISTANCE = 'HKQuantityTypeIdentifierDistanceWalkingRunning' as const;

// Las estadísticas con 'cumulativeSum' son las que usa la app Salud:
// combinan iPhone y Apple Watch sin contar dos veces los mismos pasos.
async function sum(
  identifier: typeof STEPS | typeof DISTANCE,
  unit: 'count' | 'm',
  start: Date,
  end: Date,
): Promise<{ value: number | null; sources: string[] }> {
  const res = await queryStatisticsForQuantity(identifier, ['cumulativeSum'], {
    filter: { date: { startDate: start, endDate: end } },
    unit,
  });
  const sources = (res.sources ?? [])
    .map((s: { name?: string }) => s?.name)
    .filter((n): n is string => Boolean(n));
  const value = res.sumQuantity?.quantity;
  return { value: typeof value === 'number' ? value : null, sources };
}

export const healthProvider: HealthProvider = {
  platformName: 'Salud (Apple)',

  async availability() {
    const ok = await Promise.resolve(isHealthDataAvailable());
    return ok ? 'available' : 'unsupported';
  },

  async requestPermissions() {
    try {
      await requestAuthorization({ toRead: [STEPS, DISTANCE] });
      return true;
    } catch {
      return false;
    }
  },

  async openSettings() {
    // iOS no deja abrir directo los permisos de Salud de una app; abrimos la app Salud.
    const healthUrl = 'x-apple-health://';
    if (await Linking.canOpenURL(healthUrl)) {
      await Linking.openURL(healthUrl);
    } else {
      await Linking.openSettings();
    }
  },

  async diagnose() {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    try {
      const available = await Promise.resolve(isHealthDataAvailable());
      const metrics = await this.getMetrics(start, end);
      return { platform: 'ios', available, last24h: metrics };
    } catch (e) {
      return { platform: 'ios', error: String(e) };
    }
  },

  async getMetrics(start, end): Promise<ShiftMetrics> {
    const [steps, distance] = await Promise.all([
      sum(STEPS, 'count', start, end),
      sum(DISTANCE, 'm', start, end),
    ]);
    return {
      steps: steps.value === null ? null : Math.round(steps.value),
      distanceMeters: distance.value,
      sources: Array.from(new Set([...steps.sources, ...distance.sources])),
    };
  },
};
