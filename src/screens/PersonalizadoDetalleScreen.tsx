import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Boton, Eyebrow } from '../components/ui';
import { RUTINAS_PERSONALIZADAS } from '../data/personalizadas';
import { buscarEjercicios, primeraImagen } from '../data/catalogo';

type Props = NativeStackScreenProps<RootStackParamList, 'PersonalizadoDetalle'>;

export default function PersonalizadoDetalleScreen({ route, navigation }: Props) {
  const { rutinaId } = route.params;
  const rutina = RUTINAS_PERSONALIZADAS.find((r) => r.id === rutinaId);

  if (!rutina) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Plan no encontrado.</Txt>
      </View>
    );
  }

  // Resuelve cada ejercicio del plan a una coincidencia del catálogo (si existe).
  const items = rutina.ejercicios.map((ej) => {
    const match = ej.buscar ? buscarEjercicios(ej.buscar, 1)[0] : undefined;
    return { ej, cat: match };
  });

  const comenzarAhora = () => navigation.navigate('EntrenarPlan', { planId: rutina.id });

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(8) }}
    >
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(2),
          overflow: 'hidden',
        }}
      >
        <View style={{ height: 4, width: 56, backgroundColor: colors.primary, marginBottom: spacing(1.75) }} />
        <Eyebrow style={{ color: colors.primary }}>{rutina.objetivo}</Eyebrow>
        <Text style={{ ...type.display, fontSize: font.h1, textTransform: 'uppercase', marginTop: spacing(0.75) }}>
          {rutina.titulo}
        </Text>
        <Txt style={{ color: colors.textMuted, marginTop: spacing(1.25), fontSize: font.small, lineHeight: 21 }}>
          {rutina.descripcion}
        </Txt>
        <View style={{ flexDirection: 'row', marginTop: spacing(1.75), gap: spacing(1) as any }}>
          <Insignia texto={rutina.nivel} />
          <Insignia texto={rutina.frecuencia} />
        </View>
      </View>

      <View style={{ marginTop: spacing(3), marginBottom: spacing(1.5) }}>
        <Eyebrow>Ejercicios</Eyebrow>
        <View style={{ height: 2, width: 28, backgroundColor: colors.primary, marginTop: spacing(0.75) }} />
      </View>

      {items.map(({ ej, cat }, i) => {
        const img = primeraImagen(cat);
        return (
          <TouchableOpacity
            key={i}
            activeOpacity={cat ? 0.85 : 1}
            onPress={() => cat && navigation.navigate('EjercicioDetalle', { ejercicioId: cat.id })}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(1.5),
              marginBottom: spacing(1.5),
              flexDirection: 'row',
            }}
          >
            {img ? (
              <Image source={{ uri: img }} resizeMode="cover" style={{ width: 78, height: 52, borderRadius: radius.md, backgroundColor: colors.surface2 }} />
            ) : (
              <View style={{ width: 78, height: 52, borderRadius: radius.md, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }} />
            )}
            <View style={{ flex: 1, marginLeft: spacing(1.5) }}>
              <Txt style={{ fontWeight: '800', fontSize: font.body }}>{ej.nombre}</Txt>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Etiqueta texto={`${ej.series} series`} />
                <Etiqueta texto={`${ej.reps}`} />
              </View>
              <Txt style={{ color: colors.textMuted, fontSize: font.tiny, marginTop: 7, lineHeight: 16 }}>
                <Text style={{ color: colors.primary, fontWeight: '900' }}>· </Text>{ej.nota}
              </Txt>
            </View>
          </TouchableOpacity>
        );
      })}

      <Boton titulo="Comenzar ahora" onPress={comenzarAhora} style={{ marginTop: spacing(1) }} />
      <Txt style={{ color: colors.textFaint, fontSize: font.tiny, textAlign: 'center', marginTop: spacing(1.5), lineHeight: 16 }}>
        Un día extra, sin tocar tu rutina. Registrás los pesos y la próxima vez ves tus números como referencia.
      </Txt>
    </ScrollView>
  );
}

function Insignia({ texto }: { texto: string }) {
  return (
    <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: spacing(1.25), paddingVertical: 5 }}>
      <Text style={{ color: colors.text, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.3, textTransform: 'capitalize' }}>{texto}</Text>
    </View>
  );
}

function Etiqueta({ texto }: { texto: string }) {
  return (
    <View style={{ backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6 }}>
      <Text style={{ color: colors.textMuted, fontSize: font.tiny, fontWeight: '800' }}>{texto}</Text>
    </View>
  );
}
