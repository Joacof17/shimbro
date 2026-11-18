import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from '../components/ui';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { EJERCICIOS } from '../data/catalogo';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const OPCIONES = [
  {
    a: 'ComenzarRutina' as const,
    tag: '01',
    titulo: 'Entrenar',
    sub: 'Registrá el peso de hoy',
    destacado: true,
  },
  {
    a: 'ConfigurarRutina' as const,
    tag: '02',
    titulo: 'Configurar rutina',
    sub: 'Armá tus días y ejercicios',
  },
  {
    a: 'Personalizado' as const,
    tag: '03',
    titulo: 'Planes por objetivo',
    sub: 'Para un día extra de gimnasio',
  },
];

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { estado } = useStore();
  const totalRutinas = estado.rutinas.length;
  const { configurado, user, cerrarSesion } = useAuth();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2.5), paddingTop: insets.top + spacing(3.5), paddingBottom: spacing(6) }}
    >
      {/* Hero */}
      <Eyebrow>Registro de fuerza</Eyebrow>
      <Text style={{ ...type.display, fontSize: 46, marginTop: spacing(1), textTransform: 'uppercase' }}>Shimbro</Text>
      <View style={{ height: 4, width: 56, backgroundColor: colors.primary, marginTop: spacing(1.5) }} />
      <Txt style={{ color: colors.textMuted, fontSize: font.body, marginTop: spacing(1.75), lineHeight: 21 }}>
        Elegí el día, cargá la barra, anotá el número. La progresión se lleva sola.
      </Txt>

      {/* Cuenta (solo en web con sesión) */}
      {configurado && user ? (
        <View
          style={{
            marginTop: spacing(2.5),
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(1.75),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Eyebrow>Sesión iniciada</Eyebrow>
            <Txt style={{ color: colors.text, fontSize: font.small, marginTop: 3 }} numberOfLines={1}>
              {user.email}
            </Txt>
            <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: 3 }}>
              Tus datos se guardan en tu cuenta.
            </Txt>
          </View>
          <TouchableOpacity onPress={cerrarSesion} hitSlop={8} style={{ paddingLeft: spacing(1.5) }}>
            <Text style={{ color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Salir
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Acciones */}
      <View style={{ marginTop: spacing(4), gap: spacing(1.5) as any }}>
        {OPCIONES.map((o) => (
          <TouchableOpacity
            key={o.a}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(o.a as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: o.destacado ? colors.borderHi : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Filo ember solo en la acción principal */}
            <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: o.destacado ? colors.primary : 'transparent' }} />
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface2,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing(1.75),
                marginVertical: spacing(2),
              }}
            >
              <Text style={{ ...type.num, fontSize: font.body, color: o.destacado ? colors.primary : colors.textMuted }}>
                {o.tag}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing(1.75), paddingRight: spacing(1) }}>
              <Txt style={{ ...type.h3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.titulo}</Txt>
              <Txt style={{ color: colors.textMuted, marginTop: 3, fontSize: font.small }}>{o.sub}</Txt>
            </View>
            <Text style={{ color: colors.textFaint, fontSize: 24, marginRight: spacing(2) }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Marcador */}
      <View style={{ marginTop: spacing(4) }}>
        <Eyebrow>En la app</Eyebrow>
        <View style={{ marginTop: spacing(1.5), flexDirection: 'row', gap: spacing(1.5) as any }}>
          <Stat valor={EJERCICIOS.length} etiqueta="ejercicios" />
          <Stat valor={totalRutinas} etiqueta={totalRutinas === 1 ? 'rutina' : 'rutinas'} />
          <Stat valor={17} etiqueta="músculos" />
        </View>
      </View>

      <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(4), textAlign: 'center', letterSpacing: 0.3 }}>
        Catálogo en español · imágenes vía free-exercise-db
      </Txt>
    </ScrollView>
  );
}

function Stat({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing(1.75),
        paddingHorizontal: spacing(1.5),
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ ...type.num, fontSize: font.h2, color: colors.primary }}>{valor}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ ...type.eyebrow, fontSize: 10, letterSpacing: 0.8, marginTop: 5 }}
      >
        {etiqueta}
      </Text>
    </View>
  );
}
