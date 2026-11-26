export type DataCompleteness = 'complete' | 'partial' | 'none';

export interface Shift {
  id: string;
  status: 'active' | 'completed';
  startedAt: string; // ISO
  endedAt?: string; // ISO
  timezone: string;
  garmentId: string | null;
  steps: number | null;
  distanceMeters: number | null;
  sources: string[];
  dataCompleteness?: DataCompleteness;
  comfortRating?: number | null; // 1 a 5
  notes?: string;
  reminderId?: string | null;
  syncedAt?: string; // última vez que se consultaron las métricas
  updatedAt: string;
}
