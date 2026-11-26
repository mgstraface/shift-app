// Paleta provisoria (estética deportiva, alto contraste) hasta que Fran defina
// la identidad cromática. Cambiar acá impacta en toda la app.
export const colors = {
  bg: '#0B0B0D',
  surface: '#16161A',
  border: '#26262C',
  text: '#F4F4F5',
  textMuted: '#9A9AA3',
  accent: '#C8FF3D',
  accentText: '#0B0B0D',
  warning: '#FFB020',
  danger: '#FF5A5F',
};

export const space = (n: number) => n * 8;

export const type = {
  hero: { fontSize: 64, fontWeight: '800' as const, letterSpacing: -2 },
  stat: { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 24, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  // Sin letterSpacing: en Android recorta la última letra de algunos textos.
  label: { fontSize: 13, fontWeight: '600' as const },
};
