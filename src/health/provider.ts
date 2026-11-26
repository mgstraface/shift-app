// Fallback para plataformas sin datos de salud (web). En iOS y Android Metro
// resuelve provider.ios.ts / provider.android.ts.
import type { HealthProvider } from './types';

export const healthProvider: HealthProvider = {
  platformName: 'No disponible',
  async availability() {
    return 'unsupported';
  },
  async requestPermissions() {
    return false;
  },
  async openSettings() {},
  async getMetrics() {
    return { steps: null, distanceMeters: null, sources: [] };
  },
  async diagnose() {
    return { platform: 'unsupported' };
  },
};
