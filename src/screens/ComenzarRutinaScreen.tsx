import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Boton, Vacio, Chip, Eyebrow } from '../components/ui';
import { useStore } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'ComenzarRutina'>;

export default function ComenzarRutinaScreen({ navigation }: Props) {
  const { estado, setRutinaActiva, diasCompletadosEstaSemana } = useStore();
  const isFocused = useIsFocused();
  const [rutinaId, setRutinaId] = useState<string | null>(
    estado.rutinaActivaId || estado.rutinas[0]?.id || null
  );

  useEffect(() => {
    if (isFocused && !rutinaId && estado.rutinas[0]) setRutinaId(estado.rutinas[0].id);
  }, [isFocused, estado.rutinas]);

  if (estado.rutinas.length === 0) {
    return (
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(2) }}>
        <View style={{ marginTop: spacing(6) }}>
          <Vacio titulo="No tenés rutinas" sub="Primero configurá una rutina para poder entrenarla." />
        </View>
        <Boton titulo="Configurar rutina" onPress={() => navigation.navigate('ConfigurarRutina')} style={{ marginTop: spacing(2) }} />
      </ScrollView>
    );
  }

  const rutina = estado.rutinas.find((r) => r.id === rutinaId) || estado.rutinas[0];
  const completados = diasCompletadosEstaSemana(rutina.id);
  const sugeridoId = rutina.dias.find((d) => !completados.includes(d.id))?.id || rutina.dias[0]?.id;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}
    >
      {/* Selector de rutina si hay varias */}
      {estado.rutinas.length > 1 && (
        <>
          <Eyebrow style={{ marginBottom: spacing(1) }}>Rutina</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {estado.rutinas.map((r) => (
              <Chip
                key={r.id}
                texto={r.nombre}
                activo={r.id === rutina.id}
                onPress={() => {
                  setRutinaId(r.id);
                  setRutinaActiva(r.id);
                }}
              />
            ))}
          </View>
        </>
      )}

      {/* Medidor de carga semanal */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing(2),
          marginTop: spacing(1),
          marginBottom: spacing(2.5),
        }}
      >
        <Eyebrow>Esta semana</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing(0.75) }}>
          <Text style={{ ...type.num, fontSize: 40, lineHeight: 42, color: colors.text }}>{completados.length}</Text>
          <Text style={{ ...type.num, fontSize: font.h3, color: colors.textFaint, marginBottom: 5, marginLeft: 4 }}>
            / {rutina.dias.length}
          </Text>
          <Txt style={{ color: colors.textMuted, fontSize: font.small, marginBottom: 6, marginLeft: spacing(1) }}>
            días entrenados
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', marginTop: spacing(1.5), gap: 5 as any }}>
          {rutina.dias.map((d) => (
            <View
              key={d.id}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 2,
                backgroundColor: completados.includes(d.id) ? colors.primary : colors.surfaceHi,
              }}
            />
          ))}
        </View>
      </View>

      <Eyebrow style={{ marginBottom: spacing(1.25) }}>Elegí el día</Eyebrow>

      <View style={{ gap: spacing(1.25) as any }}>
        {rutina.dias.map((d, i) => {
          const hecho = completados.includes(d.id);
          const sugerido = d.id === sugeridoId && !hecho;
          return (
            <TouchableOpacity
              key={d.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('DiaEntrenamiento', { rutinaId: rutina.id, diaId: d.id })}
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.lg,
                borderWidth: 1,
                borderColor: sugerido ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: sugerido ? colors.primary : 'transparent' }} />
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.sm,
                  borderWidth: 1,
                  borderColor: hecho ? colors.success : colors.border,
                  backgroundColor: hecho ? colors.successDim : colors.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: spacing(1.5),
                  marginVertical: spacing(1.75),
                }}
              >
                {hecho ? (
                  <Text style={{ color: colors.success, fontSize: 20, fontWeight: '900' }}>✓</Text>
                ) : (
                  <Text style={{ ...type.num, fontSize: font.body, color: colors.textMuted }}>{i + 1}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: spacing(1.5) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Txt style={{ ...type.h3, textTransform: 'uppercase', marginRight: spacing(1) }}>{d.nombre}</Txt>
                  {sugerido && (
                    <View style={{ backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 7, paddingVertical: 2 }}>
                      <Text style={{ color: '#0B0C0F', fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.6 }}>SIGUIENTE</Text>
                    </View>
                  )}
                  {hecho && (
                    <Text style={{ color: colors.success, fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.8 }}>HECHO</Text>
                  )}
                </View>
                <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: 3 }}>
                  {d.ejercicios.length} {d.ejercicios.length === 1 ? 'ejercicio' : 'ejercicios'}
                </Txt>
              </View>
              <Text style={{ color: colors.textFaint, fontSize: 24, marginRight: spacing(2) }}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
