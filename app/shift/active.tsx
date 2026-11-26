import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { formatClock, formatKm, formatNumber, formatTime } from '@/lib/format';
import { useActiveShift, useNow } from '@/shift/hooks';
import { endShift } from '@/shift/service';
import { Body, Button, Card, Label, Screen, Stat } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function ActiveShift() {
  const { shift, metrics, refresh } = useActiveShift();
  const now = useNow(1000);
  const [ending, setEnding] = useState(false);

  if (!shift) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, justifyContent: 'center', gap: space(2) }}>
          <Body>No hay una jornada en curso.</Body>
          <Button title="Volver" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  const onEnd = () => {
    Alert.alert('¿Finalizar jornada?', 'Vamos a calcular tu resumen con los datos de esta jornada.', [
      { text: 'Seguir', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: async () => {
          setEnding(true);
          try {
            const done = await endShift();
            if (done) router.replace(`/shift/${done.id}`);
          } finally {
            setEnding(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, gap: space(4), justifyContent: 'center' }}>
        <View style={{ gap: space(1) }}>
          <Label>Jornada en curso · desde las {formatTime(shift.startedAt)}</Label>
          <Text style={{ ...type.hero, fontSize: 72, color: colors.text }}>
            {formatClock(now - new Date(shift.startedAt).getTime())}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: space(4) }}>
          <Stat label="Pasos" value={metrics?.steps == null ? null : formatNumber(metrics.steps)} />
          <Stat label="Distancia" value={metrics?.distanceMeters == null ? null : formatKm(metrics.distanceMeters)} />
        </View>

        <Card>
          <Body muted>
            Podés cerrar la app: la jornada sigue registrándose. Los pasos se actualizan cuando volvés a abrirla.
          </Body>
          <Button title="Actualizar ahora" variant="secondary" onPress={refresh} />
        </Card>
      </View>

      <View style={{ gap: space(1.5) }}>
        <Button title="Finalizar jornada" onPress={onEnd} loading={ending} />
        <Button title="Minimizar" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
