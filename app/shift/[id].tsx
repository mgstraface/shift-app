import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { formatDay, formatDuration, formatKm, formatNumber, formatTime } from '@/lib/format';
import { rateComfort, resyncShift } from '@/shift/service';
import { getShift } from '@/shift/store';
import type { Shift } from '@/shift/types';
import { Body, Button, Card, Label, Notice, Screen, Stat, Title } from '@/ui/components';
import { colors, space } from '@/ui/theme';

export default function ShiftSummary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shift, setShift] = useState<Shift | null>(() => (id ? getShift(id) : null));
  const [syncing, setSyncing] = useState(false);

  if (!shift || !shift.endedAt) {
    return (
      <Screen>
        <Body>No encontramos esta jornada.</Body>
        <Button title="Volver" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const durationMs = new Date(shift.endedAt).getTime() - new Date(shift.startedAt).getTime();

  const onResync = async () => {
    setSyncing(true);
    try {
      setShift(await resyncShift(shift.id));
    } finally {
      setSyncing(false);
    }
  };

  const onRate = (n: number) => {
    rateComfort(shift.id, n);
    setShift({ ...shift, comfortRating: n });
  };

  return (
    <Screen>
      <View style={{ gap: space(0.5) }}>
        <Label>{formatDay(shift.startedAt)}</Label>
        <Title>
          {formatTime(shift.startedAt)} a {formatTime(shift.endedAt)}
        </Title>
      </View>

      <Stat size="hero" label="Pasos" value={shift.steps === null ? null : formatNumber(shift.steps)} />
      <View style={{ flexDirection: 'row', gap: space(4) }}>
        <Stat label="Distancia" value={shift.distanceMeters === null ? null : formatKm(shift.distanceMeters)} />
        <Stat label="Duración" value={formatDuration(durationMs)} />
      </View>

      {shift.dataCompleteness === 'none' ? (
        <Notice>
          No hay datos de pasos para esta jornada. Revisá que SHIFT tenga permiso en la app de salud y llevá el
          celular encima o usá tu reloj.
        </Notice>
      ) : null}
      {shift.dataCompleteness === 'partial' ? (
        <Notice>
          Registramos pocos pasos para la duración de la jornada. Es probable que el celular haya quedado lejos durante
          parte del turno.
        </Notice>
      ) : null}

      <Card>
        <Label>¿Cómo te sentiste con tu ambo?</Label>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = (shift.comfortRating ?? 0) >= n;
            return (
              <Pressable key={n} onPress={() => onRate(n)} hitSlop={8}>
                <Text style={{ fontSize: 32, color: active ? colors.accent : colors.border }}>★</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {shift.sources.length ? <Body muted>Datos de: {shift.sources.join(', ')}</Body> : null}

      <View style={{ gap: space(1.5) }}>
        <Button title="Compartir mi jornada (semana 2)" onPress={() => {}} disabled />
        <Button title="Actualizar datos" variant="secondary" onPress={onResync} loading={syncing} />
        <Button title="Listo" variant="secondary" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
