import type { DataCompleteness } from './types';

// Umbral provisorio: una jornada de más de 2 h con menos de 200 pasos por hora
// casi seguro tuvo el celular lejos del cuerpo. Lo calibramos con la beta.
const MIN_HOURS_TO_JUDGE = 2;
const MIN_STEPS_PER_HOUR = 200;

export function assessCompleteness(steps: number | null, durationMs: number): DataCompleteness {
  if (steps === null) return 'none';
  const hours = durationMs / 3_600_000;
  if (hours >= MIN_HOURS_TO_JUDGE && steps / hours < MIN_STEPS_PER_HOUR) return 'partial';
  return 'complete';
}
