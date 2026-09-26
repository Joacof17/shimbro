import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Boton, Tarjeta, Eyebrow } from '../components/ui';
import { useStore } from '../store';
import { uid } from '../utils';
import type { Rutina, DiaRutina, EjercicioRutina } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditorRutina'>;
const MAX_DIAS = 6; // n < 7

export default function EditorRutinaScreen({ route, navigation }: Props) {
  const { rutinaId } = route.params;
  const { estado, guardarRutina } = useStore();
  const isFocused = useIsFocused();
  const rutina = estado.rutinas.find((r) => r.id === rutinaId);

  useEffect(() => {
    if (!rutina && isFocused) navigation.goBack();
  }, [rutina, isFocused]);

  if (!rutina) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  const actualizar = (patch: Partial<Rutina>) => guardarRutina({ ...rutina, ...patch });

  const actualizarDia = (diaId: string, patch: Partial<DiaRutina>) =>
    actualizar({ dias: rutina.dias.map((d) => (d.id === diaId ? { ...d, ...patch } : d)) });

  const agregarDia = () => {
    if (rutina.dias.length >= MAX_DIAS) {
      Alert.alert('Máximo alcanzado', 'Una rutina puede tener hasta 6 días (menos de 7).');
      return;
    }
    actualizar({
      dias: [...rutina.dias, { id: uid('d_'), nombre: `Día ${rutina.dias.length + 1}`, ejercicios: [] }],
    });
  };

  const borrarDia = (diaId: string) => {
    if (rutina.dias.length <= 1) {
      Alert.alert('No permitido', 'La rutina debe tener al menos un día.');
      return;
    }
    Alert.alert('Eliminar día', '¿Seguro que querés eliminar este día?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => actualizar({ dias: rutina.dias.filter((d) => d.id !== diaId) }),
      },
    ]);
  };

  const borrarEjercicio = (diaId: string, ejUid: string) => {
    const dia = rutina.dias.find((d) => d.id === diaId);
    if (!dia) return;
    actualizarDia(diaId, { ejercicios: dia.ejercicios.filter((e) => e.uid !== ejUid) });
  };

  const editarEjercicio = (diaId: string, ejUid: string, patch: Partial<EjercicioRutina>) => {
    const dia = rutina.dias.find((d) => d.id === diaId);
    if (!dia) return;
    actualizarDia(diaId, {
      ejercicios: dia.ejercicios.map((e) => (e.uid === ejUid ? { ...e, ...patch } : e)),
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(8) }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Nombre de la rutina */}
      <Eyebrow style={{ marginBottom: spacing(0.75) }}>Nombre de la rutina</Eyebrow>
      <TextInput
        value={rutina.nombre}
        onChangeText={(t) => actualizar({ nombre: t })}
        placeholder="Mi rutina"
        placeholderTextColor={colors.textFaint}
        style={inputGrande}
      />

      {rutina.dias.map((dia, i) => (
        <Tarjeta key={dia.id} style={{ marginTop: spacing(2) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(1) }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing(1.25),
              }}
            >
              <Text style={{ ...type.num, color: colors.primary, fontSize: font.body }}>{i + 1}</Text>
            </View>
            <TextInput
              value={dia.nombre}
              onChangeText={(t) => actualizarDia(dia.id, { nombre: t })}
              placeholder={`Día ${i + 1}`}
              placeholderTextColor={colors.textFaint}
              style={{ flex: 1, color: colors.text, fontSize: font.h3, fontWeight: '900', letterSpacing: 0.3 }}
            />
            <TouchableOpacity onPress={() => borrarDia(dia.id)} hitSlop={10} style={{ paddingHorizontal: 6 }}>
              <Text style={{ color: colors.textFaint, fontSize: 18, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {dia.ejercicios.length === 0 ? (
            <Txt style={{ color: colors.textFaint, fontSize: font.small, paddingVertical: spacing(1) }}>
              Sin ejercicios todavía.
            </Txt>
          ) : (
            dia.ejercicios.map((ej) => (
              <View
                key={ej.uid}
                style={{
                  backgroundColor: colors.surface2,
                  borderRadius: radius.md,
                  padding: spacing(1.25),
                  marginBottom: spacing(1),
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {ej.esLibre && (
                    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 5, paddingVertical: 1, marginRight: spacing(0.75) }}>
                      <Text style={{ color: colors.textFaint, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 }}>LIBRE</Text>
                    </View>
                  )}
                  <Txt style={{ flex: 1, fontWeight: '800', fontSize: font.body }} numberOfLines={2}>
                    {ej.nombre}
                  </Txt>
                  <TouchableOpacity onPress={() => borrarEjercicio(dia.id, ej.uid)} hitSlop={8} style={{ padding: 4 }}>
                    <Text style={{ color: colors.textFaint, fontSize: 18, fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', marginTop: spacing(1), alignItems: 'center' }}>
                  <MiniCampo
                    etiqueta="Series"
                    valor={String(ej.series)}
                    keyboard="number-pad"
                    ancho={64}
                    onChange={(t) => editarEjercicio(dia.id, ej.uid, { series: Math.max(1, parseInt(t || '0', 10) || 0) })}
                  />
                  <MiniCampo
                    etiqueta="Reps"
                    valor={ej.reps}
                    ancho={90}
                    onChange={(t) => editarEjercicio(dia.id, ej.uid, { reps: t })}
                  />
                  {ej.musculo ? (
                    <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginLeft: 'auto' }}>
                      {ej.musculo}
                    </Txt>
                  ) : null}
                </View>
              </View>
            ))
          )}

          <Boton
            titulo="Agregar ejercicios"
            variante="secondary"
            chico
            onPress={() => navigation.navigate('SelectorEjercicios', { rutinaId: rutina.id, diaId: dia.id })}
            style={{ marginTop: spacing(0.5) }}
          />
        </Tarjeta>
      ))}

      <Boton
        titulo={rutina.dias.length >= MAX_DIAS ? 'Máximo 6 días' : 'Agregar día'}
        variante="ghost"
        onPress={agregarDia}
        disabled={rutina.dias.length >= MAX_DIAS}
        style={{ marginTop: spacing(2) }}
      />

      <Boton
        titulo="Listo"
        onPress={() => navigation.navigate('Home')}
        style={{ marginTop: spacing(2) }}
      />
    </ScrollView>
  );
}

function MiniCampo({
  etiqueta,
  valor,
  onChange,
  ancho,
  keyboard,
}: {
  etiqueta: string;
  valor: string;
  onChange: (t: string) => void;
  ancho: number;
  keyboard?: 'number-pad' | 'default';
}) {
  return (
    <View style={{ marginRight: spacing(1.5) }}>
      <Eyebrow style={{ fontSize: 10, marginBottom: 3 }}>{etiqueta}</Eyebrow>
      <TextInput
        value={valor}
        onChangeText={onChange}
        keyboardType={keyboard || 'default'}
        style={{
          width: ancho,
          backgroundColor: colors.bg,
          borderRadius: radius.sm,
          borderWidth: 1,
          borderColor: colors.border,
          color: colors.text,
          paddingHorizontal: spacing(1),
          paddingVertical: spacing(0.85),
          fontSize: font.body,
          fontWeight: '900',
          fontVariant: ['tabular-nums'] as any,
        }}
      />
    </View>
  );
}

const inputGrande = {
  backgroundColor: colors.surface,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  color: colors.text,
  paddingHorizontal: spacing(1.5),
  paddingVertical: spacing(1.5),
  fontSize: font.h3,
  fontWeight: '700' as const,
};
