import { Linking } from 'react-native';
import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
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
