import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from './ui';
import { EQUIPOS } from '../store';
import { ejercicioPorId, primeraImagen } from '../data/catalogo';
import { haceCuanto } from '../utils';
import { ModalProgreso } from './ModalProgreso';
import type { TipoEquipo, RegistroPeso } from '../types';

export type EntradaReg = { peso: string; equipo: TipoEquipo; reps: string };

export function entradaInicial(ult?: RegistroPeso, repsConfig?: string): EntradaReg {
  return {
    peso: '',
    equipo: ult?.equipo || 'mancuerna',
    reps: repsConfig || ult?.reps || '',
  };
}

const EQUIPO_LABEL: Record<TipoEquipo, string> = {
  mancuerna: 'Mancuerna',
  barra: 'Barra',
  'peso corporal': 'Corporal',
};

// Tarjeta de registro de un ejercicio: última vez + selector de equipo + peso/reps.
// Compartida entre el Día de rutina y las sesiones extra de un plan.
export function TarjetaRegistro({
  ejercicioId,
  nombre,
  series,
  reps,
  ult,
  historial,
  entrada,
  onChange,
  onVerDetalle,
}: {
  ejercicioId: string | null;
  nombre: string;
  series: number;
  reps: string;
  ult?: RegistroPeso;
  historial?: RegistroPeso[];
  entrada: EntradaReg;
  onChange: (patch: Partial<EntradaReg>) => void;
  onVerDetalle?: () => void;
}) {
  const cat = ejercicioId ? ejercicioPorId(ejercicioId) : undefined;
  const img = primeraImagen(cat);
  const puedeDetalle = !!cat && !!onVerDetalle;
  const [verProgreso, setVerProgreso] = useState(false);
  const hayHistorial = !!historial && historial.length > 0;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing(1.75),
        marginBottom: spacing(1.5),
      }}
    >
      <TouchableOpacity
        disabled={!puedeDetalle}
        onPress={onVerDetalle}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {img ? (
          <Image source={{ uri: img }} resizeMode="cover" style={{ width: 72, height: 52, borderRadius: radius.sm, backgroundColor: colors.surface2 }} />
        ) : (
          <View style={{ width: 72, height: 52, borderRadius: radius.sm, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }} />
        )}
        <View style={{ flex: 1, marginLeft: spacing(1.25) }}>
          <Txt style={{ fontWeight: '800', fontSize: font.body, letterSpacing: 0.2 }} numberOfLines={2}>
            {nombre}
          </Txt>
          <Txt style={{ color: colors.textMuted, fontSize: font.tiny, marginTop: 3 }}>
            {series} × {reps || '—'}{puedeDetalle ? '   ·   ver técnica ›' : ''}
          </Txt>
        </View>
      </TouchableOpacity>

      {/* Última vez — marcador */}
      <View
        style={{
          marginTop: spacing(1.5),
          backgroundColor: colors.bg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing(1.5),
          paddingVertical: spacing(1.25),
        }}
      >
        <Eyebrow style={{ fontSize: 10 }}>Última vez</Eyebrow>
        {ult ? (
          ult.equipo === 'peso corporal' ? (
            <Txt style={{ color: colors.text, fontSize: font.small, marginTop: 4 }}>
              <Text style={{ ...type.num, fontSize: font.body }}>Corporal</Text>
              {ult.reps ? `  ·  ${ult.reps} reps` : ''}
              <Txt style={{ color: colors.textFaint }}>  ·  {haceCuanto(ult.fecha)}</Txt>
            </Txt>
          ) : (
            <Txt style={{ color: colors.text, fontSize: font.small, marginTop: 4 }}>
              <Text style={{ ...type.num, fontSize: font.h3, color: colors.primary }}>{ult.peso}</Text>
              <Text style={{ ...type.num, color: colors.textMuted }}> kg</Text>
              <Txt style={{ color: colors.textMuted }}>  ·  {ult.equipo}  ·  {haceCuanto(ult.fecha)}</Txt>
            </Txt>
          )
        ) : (
          <Txt style={{ color: colors.textFaint, fontSize: font.small, marginTop: 4 }}>Primera vez con este ejercicio</Txt>
        )}

        {hayHistorial ? (
          <TouchableOpacity onPress={() => setVerProgreso(true)} hitSlop={8} style={{ marginTop: spacing(1) }}>
            <Text style={{ color: colors.primary, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Ver progreso histórico ›
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ModalProgreso visible={verProgreso} onClose={() => setVerProgreso(false)} nombre={nombre} historial={historial} />

      {/* Selector de equipo — segmentado */}
      <View style={{ flexDirection: 'row', marginTop: spacing(1.5), gap: spacing(0.75) as any }}>
        {EQUIPOS.map((eq) => {
          const activo = entrada?.equipo === eq;
          return (
            <TouchableOpacity
              key={eq}
              onPress={() => onChange({ equipo: eq })}
              style={{
                flex: 1,
                paddingVertical: spacing(1.15),
                borderRadius: radius.sm,
                alignItems: 'center',
                backgroundColor: activo ? colors.primary : colors.surface2,
                borderWidth: 1,
                borderColor: activo ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  color: activo ? '#0B0C0F' : colors.textMuted,
                  fontSize: font.tiny,
                  fontWeight: '900',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {EQUIPO_LABEL[eq]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Peso y reps de hoy */}
      {entrada?.equipo === 'peso corporal' ? (
        <View style={{ flexDirection: 'row', marginTop: spacing(1.25), alignItems: 'flex-end' }}>
          <View
            style={{
              flex: 1,
              marginRight: spacing(1.25),
              backgroundColor: colors.surface2,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing(1.5),
              paddingVertical: spacing(1.5),
              justifyContent: 'center',
            }}
          >
            <Txt style={{ color: colors.textMuted, fontSize: font.small }}>Sin peso: tu propio cuerpo</Txt>
          </View>
          <View style={{ width: 96 }}>
            <Eyebrow style={{ fontSize: 10, marginBottom: 4 }}>Reps</Eyebrow>
            <TextInput
              value={entrada?.reps}
              onChangeText={(t) => onChange({ reps: t })}
              placeholder="8-12"
              placeholderTextColor={colors.textFaint}
              style={campoPeso}
            />
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', marginTop: spacing(1.25), alignItems: 'flex-end' }}>
          <View style={{ flex: 1, marginRight: spacing(1.25) }}>
            <Eyebrow style={{ fontSize: 10, marginBottom: 4 }}>Peso hoy · kg</Eyebrow>
            <TextInput
              value={entrada?.peso}
              onChangeText={(t) => onChange({ peso: t })}
              keyboardType="decimal-pad"
              placeholder={ult ? String(ult.peso) : '0'}
              placeholderTextColor={colors.textFaint}
              style={campoPeso}
            />
          </View>
          <View style={{ width: 96 }}>
            <Eyebrow style={{ fontSize: 10, marginBottom: 4 }}>Reps</Eyebrow>
            <TextInput
              value={entrada?.reps}
              onChangeText={(t) => onChange({ reps: t })}
              placeholder="8-12"
              placeholderTextColor={colors.textFaint}
              style={campoPeso}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const campoPeso = {
  backgroundColor: colors.bg,
  borderRadius: radius.md,
  borderWidth: 1,
  borderColor: colors.border,
  color: colors.text,
  paddingHorizontal: spacing(1.5),
  paddingVertical: spacing(1.25),
  fontSize: font.h2,
  fontWeight: '900' as const,
  fontVariant: ['tabular-nums'] as any,
  letterSpacing: -0.5,
};
