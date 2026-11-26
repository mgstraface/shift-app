import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatClock, formatDuration, formatKm, formatNumber } from '@/lib/format';
import { useActiveShift, useNow, useShiftList } from '@/shift/hooks';
import { startShift } from '@/shift/service';
import { Body, Button, Card, Label, Screen, Stat, Title } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

const WEEK_MS = 7 * 24 * 3600 * 1000;

export default function Home() {
  const { shift } = useActiveShift();
  const shifts = useShiftList();
  const now = useNow(1000);
  const [starting, setStarting] = useState(false);

  const week = useMemo(() => {
    const recent = shifts.filter((s) => Date.now() - new Date(s.startedAt).getTime() < WEEK_MS);
    const withSteps = recent.filter((s) => s.steps !== null);
    return {
      count: recent.length,
      steps: withSteps.length ? withSteps.reduce((a, s) => a + (s.steps ?? 0), 0) : null,
      meters: recent.some((s) => s.distanceMeters !== null)
        ? recent.reduce((a, s) => a + (s.distanceMeters ?? 0), 0)
        : null,
    };
  }, [shifts]);

  const last = shifts[0];

  const onStart = async () => {
    setStarting(true);
    try {
      await startShift(null); // semana 2: elegir el ambo antes de iniciar
      router.push('/shift/active');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Screen>
      <Title>Hola 👋</Title>

      {shift ? (
        <Pressable onPress={() => router.push('/shift/active')}>
          <Card style={{ borderWidth: 1, borderColor: colors.accent }}>
            <Label>Jornada en curso</Label>
            <Text style={{ ...type.hero, color: colors.text }}>
              {formatClock(now - new Date(shift.startedAt).getTime())}
            </Text>
            <Body muted>Tocá para ver tu jornada</Body>
          </Card>
        </Pressable>
      ) : (
        <Card>
          <Label>Ambo</Label>
          <Body muted>Sin ambo seleccionado (llega en la semana 2)</Body>
          <Button title="Iniciar jornada" onPress={onStart} loading={starting} />
        </Card>
      )}

      <Card>
        <Label>Últimos 7 días</Label>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Stat label="Jornadas" value={String(week.count)} />
          <Stat label="Pasos" value={week.steps === null ? null : formatNumber(week.steps)} />
          <Stat label="Distancia" value={week.meters === null ? null : formatKm(week.meters)} />
        </View>
      </Card>

      {last ? (
        <Pressable onPress={() => router.push(`/shift/${last.id}`)}>
          <Card>
            <Label>Última jornada</Label>
            <View style={{ flexDirection: 'row', gap: space(3) }}>
              <Stat label="Pasos" value={last.steps === null ? null : formatNumber(last.steps)} />
              <Stat
                label="Duración"
                value={last.endedAt ? formatDuration(new Date(last.endedAt).getTime() - new Date(last.startedAt).getTime()) : null}
              />
            </View>
          </Card>
        </Pressable>
      ) : null}
    </Screen>
  );
}
