import { Linking } from 'react-native';
import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

import type { HealthAvailability, HealthProvider, ShiftMetrics } from './types';

const PERMISSIONS = [
  { accessType: 'read', recordType: 'Steps' },
  { accessType: 'read', recordType: 'Distance' },
] as const;

const PLAY_STORE_HC = 'market://details?id=com.google.android.apps.healthdata';

let initialized = false;
async function ensureInit() {
  if (!initialized) initialized = await initialize();
  return initialized;
}

async function hasPermission(recordType: 'Steps' | 'Distance') {
  const granted = await getGrantedPermissions();
  return granted.some((p) => p.recordType === recordType && p.accessType === 'read');
}

export const healthProvider: HealthProvider = {
  platformName: 'Health Connect',

  async availability(): Promise<HealthAvailability> {
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) return 'available';
    if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) return 'needs_update';
    return 'not_installed';
  },

  async requestPermissions() {
    if (!(await ensureInit())) return false;
    const granted = await requestPermission([...PERMISSIONS]);
    return granted.some((p) => p.recordType === 'Steps');
  },

  async openSettings() {
    openHealthConnectSettings();
  },

  async openInstall() {
    await Linking.openURL(PLAY_STORE_HC);
  },

  async diagnose() {
    const out: Record<string, unknown> = { platform: 'android' };
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
    try {
      out.sdkStatus = await getSdkStatus();
      out.initialized = await ensureInit();
      out.granted = await getGrantedPermissions();
    } catch (e) {
      out.setupError = String(e);
      return out;
    }
    try {
      out.stepsAggregate24h = await aggregateRecord({ recordType: 'Steps', timeRangeFilter });
    } catch (e) {
      out.stepsAggregateError = String(e);
    }
    try {
      const raw = await readRecords('Steps', { timeRangeFilter });
      out.stepsRecords24h = raw.records.length;
      out.stepsOrigins = Array.from(new Set(raw.records.map((r) => r.metadata?.dataOrigin)));
    } catch (e) {
      out.stepsReadError = String(e);
    }
    return out;
  },

  // aggregateRecord ya elimina duplicados entre fuentes (celular, reloj, otras apps).
  async getMetrics(start, end): Promise<ShiftMetrics> {
    if (!(await ensureInit())) return { steps: null, distanceMeters: null, sources: [] };

    const timeRangeFilter = {
      operator: 'between' as const,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    const [stepsRes, distRes] = await Promise.all([
      (await hasPermission('Steps'))
        ? aggregateRecord({ recordType: 'Steps', timeRangeFilter })
        : Promise.resolve(null),
      (await hasPermission('Distance'))
        ? aggregateRecord({ recordType: 'Distance', timeRangeFilter })
        : Promise.resolve(null),
    ]);

    const origins = [...(stepsRes?.dataOrigins ?? []), ...(distRes?.dataOrigins ?? [])];
    const noStepData = !stepsRes || (stepsRes.dataOrigins?.length ?? 0) === 0;
    const noDistData = !distRes || (distRes.dataOrigins?.length ?? 0) === 0;

    return {
      steps: noStepData ? null : stepsRes.COUNT_TOTAL,
      distanceMeters: noDistData ? null : distRes.DISTANCE.inMeters,
      sources: Array.from(new Set(origins)),
    };
  },
};
