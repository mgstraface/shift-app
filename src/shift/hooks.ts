import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import type { ShiftMetrics } from '@/health';

import { getLiveMetrics } from './service';
import { getActiveShift, listShifts } from './store';
import type { Shift } from './types';

/** Reloj que se actualiza cada `ms` (para el cronómetro). */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/** Jornada activa + métricas en vivo, refrescadas al entrar a la pantalla y cada minuto. */
export function useActiveShift() {
  const [shift, setShift] = useState<Shift | null>(() => getActiveShift());
  const [metrics, setMetrics] = useState<ShiftMetrics | null>(null);

  const refresh = useCallback(async () => {
    const current = getActiveShift();
    setShift(current);
    if (current) setMetrics(await getLiveMetrics(current));
    else setMetrics(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const t = setInterval(refresh, 60_000);
      return () => clearInterval(t);
    }, [refresh]),
  );

  return { shift, metrics, refresh };
}

/** Historial local, recargado cada vez que la pantalla toma foco. */
export function useShiftList() {
  const [shifts, setShifts] = useState<Shift[]>(() => listShifts());
  useFocusEffect(
    useCallback(() => {
      setShifts(listShifts());
    }, []),
  );
  return shifts;
}
