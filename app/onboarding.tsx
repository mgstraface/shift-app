import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { health, type HealthAvailability } from '@/health';
import { setOnboardingDone } from '@/shift/store';
import { Body, Button, Notice, Screen } from '@/ui/components';
import { colors, space, type } from '@/ui/theme';

export default function Onboarding() {
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    health.availability().then(setAvailability).catch(() => setAvailability('unsupported'));
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      await health.requestPermissions();
    } finally {
      setLoading(false);
      setOnboardingDone();
      router.replace('/');
    }
  };

  const skip = () => {
    setOnboardingDone();
    router.replace('/');
  };

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, justifyContent: 'center', gap: space(3) }}>
        <Text style={{ ...type.hero, color: colors.text, fontStyle: 'italic' }}>SHIFT</Text>
        <Text style={{ ...type.title, color: colors.accent }}>Cada jornada cuenta.</Text>
        <Body>
          Iniciá tu jornada al llegar y finalizala al irte. SHIFT suma tus pasos y la distancia recorrida en ese
          tiempo, usando los datos de {health.platformName}.
        </Body>
        <Body muted>
          Llevá el celular encima o usá tu reloj: si queda en el locker, SHIFT no puede contar tus pasos. No usamos
          GPS ni evaluamos tu trabajo. Tus datos son tuyos.
        </Body>

        {availability === 'not_installed' || availability === 'needs_update' ? (
          <Notice>
            {availability === 'not_installed'
              ? 'Para contar tus pasos necesitás Health Connect, la app de salud de Google.'
              : 'Necesitás actualizar Health Connect para que SHIFT pueda leer tus pasos.'}
          </Notice>
        ) : null}
        {availability === 'unsupported' ? (
          <Notice>Este dispositivo no tiene datos de salud disponibles. Vas a poder registrar la duración de tus jornadas.</Notice>
        ) : null}
      </View>

      <View style={{ gap: space(1.5) }}>
        {availability === 'not_installed' || availability === 'needs_update' ? (
          <Button
            title={availability === 'not_installed' ? 'Instalar Health Connect' : 'Actualizar Health Connect'}
            onPress={() => health.openInstall?.()}
          />
        ) : (
          <Button
            title={`Conectar con ${health.platformName}`}
            onPress={connect}
            loading={loading}
            disabled={availability !== 'available'}
          />
        )}
        <Button title="Ahora no" variant="secondary" onPress={skip} />
      </View>
    </Screen>
  );
}
