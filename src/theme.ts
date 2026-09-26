// Sistema visual de Shimbro — "cuaderno de hierro".
// Grafito frío + un único acento ember (metal caliente) reservado al esfuerzo.
import { Platform, TextStyle } from 'react-native';

export const colors = {
  // Superficies: grafito frío, casi negro.
  bg: '#0B0C0F',
  surface: '#141619',
  surface2: '#1C1F24',
  surfaceHi: '#242830', // neutro presionado / activo sin acento
  border: '#2A2E35', // hairline
  borderHi: '#3A404A',

  // Acento único: ember (hierro caliente). Aparece solo sobre esfuerzo / lo siguiente.
  primary: '#EF562A',
  primaryDark: '#B23C1C',
  ember: '#EF562A',
  emberDim: '#7A2E17', // relleno tenue tras el acento
  accent: '#EF562A', // alias: la app no usa un segundo color decorativo

  // Texto.
  text: '#ECEEF1',
  textMuted: '#8C929C',
  textFaint: '#565C66',

  // Semánticos, apagados (no caramelo).
  success: '#5FA07C', // "hecho" — verde templado
  successDim: '#22362C',
  danger: '#C24A3A',
  warn: '#D2953B',

  chip: '#1C1F24',
};

export const spacing = (n: number) => n * 8;

// Menos redondeo: lectura más mecánica / industrial.
export const radius = { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 };

export const font = {
  h1: 32,
  h2: 23,
  h3: 17,
  body: 15,
  small: 13,
  tiny: 11,
};

// Familia mono para números (marcador). tabular-nums donde importa alinear.
export const numFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

// Presets tipográficos: la tipografía carga la personalidad.
export const type: Record<string, TextStyle> = {
  // Titular de pantalla: pesado, mayúsculas, tracking ajustado.
  display: { fontSize: font.h1, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: font.h2, fontWeight: '900', color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: font.h3, fontWeight: '800', color: colors.text, letterSpacing: 0.1 },
  body: { fontSize: font.body, fontWeight: '500', color: colors.text },
  muted: { fontSize: font.small, fontWeight: '500', color: colors.textMuted },
  // Eyebrow: dispositivo estructural. Versalitas tracked.
  eyebrow: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  // Número de marcador.
  num: { fontWeight: '900', color: colors.text, fontVariant: ['tabular-nums'] as any, letterSpacing: -0.5 },
};
