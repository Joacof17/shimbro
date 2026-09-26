import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from '../components/ui';
import { RUTINAS_PERSONALIZADAS } from '../data/personalizadas';

type Props = NativeStackScreenProps<RootStackParamList, 'Personalizado'>;

export default function PersonalizadoScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}
    >
      <Txt style={{ color: colors.textMuted, fontSize: font.body, marginBottom: spacing(2.5), lineHeight: 21 }}>
        ¿Ya cerraste tus días de rutina y querés entrenar algo extra? Elegí un plan por objetivo y empezá al toque.
      </Txt>

      <View style={{ gap: spacing(1.25) as any }}>
        {RUTINAS_PERSONALIZADAS.map((r) => (
          <TouchableOpacity
            key={r.id}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalizadoDetalle', { rutinaId: r.id })}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(2),
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.25)',
                backgroundColor: r.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing(1.75),
              }}
            >
              <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Txt style={{ ...type.h3, textTransform: 'uppercase' }}>{r.titulo}</Txt>
              <Eyebrow style={{ marginTop: 4, color: colors.primary }}>{r.objetivo}</Eyebrow>
              <Txt style={{ color: colors.textMuted, fontSize: font.tiny, marginTop: 6 }}>
                {r.ejercicios.length} ejercicios · {r.nivel} · {r.frecuencia}
              </Txt>
            </View>
            <Text style={{ color: colors.textFaint, fontSize: 24 }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
