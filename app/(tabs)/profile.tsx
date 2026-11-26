import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { health, type HealthAvailability } from '@/health';
import { clearAllShifts } from '@/shift/store';
import { Body, Button, Card, Label, Screen, Title } from '@/ui/components';

const AVAILABILITY_TEXT: Record<HealthAvailability, string> = {
  available: 'Disponible',
  not_installed: 'Health Connect no está instalado',
  needs_update: 'Health Connect necesita una actualización',
  unsupported: 'No disponible en este dispositivo',
};

export default function Profile() {
  const [availability, setAvailability] = useState<HealthAvailability | null>(null);

  useFocusEffect(
    useCallback(() => {
      health.availability().then(setAvailability).catch(() => setAvailability('unsupported'));
    }, []),
  );

  const onClear = () => {
    Alert.alert('Borrar mis datos', 'Se borran todas las jornadas guardadas en este celular. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: clearAllShifts },
    ]);
  };

  return (
    <Screen>
      <Title>Perfil</Title>

      <Card>
        <Label>Datos de actividad</Label>
        <Body>
          {health.platformName}: {availability ? AVAILABILITY_TEXT[availability] : 'Revisando…'}
        </Body>
        <Button title="Volver a pedir permisos" variant="secondary" onPress={() => health.requestPermissions()} />
        <Button title="Abrir configuración de salud" variant="secondary" onPress={() => health.openSettings()} />
      </Card>

      <Card>
        <Label>Privacidad</Label>
        <Body muted>
          Los datos de salud se leen en tu celular y no se comparten con empleadores ni marcas. Vos decidís qué
          publicar.
        </Body>
        <Button title="Borrar mis datos" variant="danger" onPress={onClear} />
      </Card>
    </Screen>
  );
}
