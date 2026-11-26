import { Body, Card, Label, Screen, Title } from '@/ui/components';

// Semana 2: escaneo del QR de trazabilidad, alta del ambo y estadísticas por prenda.
export default function Garments() {
  return (
    <Screen>
      <Title>Mis ambos</Title>
      <Card>
        <Label>Próximamente</Label>
        <Body>
          Vas a poder escanear el QR de tu ambo para sumarlo a SHIFT y ver cuántas jornadas, horas y kilómetros
          recorriste con cada uno.
        </Body>
      </Card>
    </Screen>
  );
}
