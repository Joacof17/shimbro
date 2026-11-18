import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, font, type } from '../theme';
import { Txt, Boton, Eyebrow } from '../components/ui';
import { TarjetaRegistro, EntradaReg, entradaInicial } from '../components/RegistroEjercicio';
import { ModalAviso } from '../components/ModalAviso';
import { useStore } from '../store';
import { ejercicioPorId } from '../data/catalogo';
import { leerBorrador, guardarBorrador, limpiarBorrador } from '../sesionBorrador';

type Props = NativeStackScreenProps<RootStackParamList, 'DiaEntrenamiento'>;

export default function DiaEntrenamientoScreen({ route, navigation }: Props) {
  const { rutinaId, diaId } = route.params;
  const { estado, claveEjercicio, ultimoRegistro, registrar, completarSesion } = useStore();
  const rutina = estado.rutinas.find((r) => r.id === rutinaId);
  const dia = rutina?.dias.find((d) => d.id === diaId);

  const inicial = useMemo(() => {
    const m: Record<string, EntradaReg> = {};
    dia?.ejercicios.forEach((ej) => {
      const ult = ultimoRegistro(claveEjercicio(rutinaId, diaId, ej.uid));
      m[ej.uid] = entradaInicial(ult, ej.reps);
    });
    return m;
  }, [dia]);

  const [entradas, setEntradas] = useState<Record<string, EntradaReg>>(inicial);
  const [aviso, setAviso] = useState<string | null>(null);

  // Clave del borrador de esta sesión (día de esta rutina).
  const claveBorrador = `dia|${rutinaId}|${diaId}`;
  const borradorListo = useRef(false);

  // Al entrar: restaurar lo que haya quedado a medias.
  useEffect(() => {
    let vivo = true;
    leerBorrador<Record<string, EntradaReg>>(claveBorrador).then((d) => {
      if (vivo && d) setEntradas((prev) => ({ ...prev, ...d }));
      borradorListo.current = true;
    });
    return () => {
      vivo = false;
    };
  }, [claveBorrador]);

  // Al cambiar algo: guardar el borrador (recién después de intentar restaurar,
  // para no pisar lo guardado con los valores por defecto).
  useEffect(() => {
    if (borradorListo.current) guardarBorrador(claveBorrador, entradas);
  }, [entradas, claveBorrador]);

  if (!rutina || !dia) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Entrenamiento no encontrado.</Txt>
      </View>
    );
  }

  const set = (uid: string, patch: Partial<EntradaReg>) =>
    setEntradas((prev) => ({ ...prev, [uid]: { ...prev[uid], ...patch } }));

  const finalizar = () => {
    let registrados = 0;
    dia.ejercicios.forEach((ej) => {
      const e = entradas[ej.uid];
      const esCorporal = e?.equipo === 'peso corporal';
      const peso = parseFloat((e?.peso || '').replace(',', '.'));
      if (esCorporal || !isNaN(peso)) {
        registrar(claveEjercicio(rutinaId, diaId, ej.uid), {
          fecha: Date.now(),
          peso: esCorporal ? 0 : peso,
          equipo: e.equipo,
          reps: e.reps,
          series: ej.series,
        });
        registrados++;
      }
    });
    completarSesion(rutinaId, diaId);
    limpiarBorrador(claveBorrador);
    setAviso(
      registrados > 0
        ? `Guardaste el peso de ${registrados} ejercicio${registrados === 1 ? '' : 's'}.`
        : 'Marcado como completado.'
    );
  };

  if (dia.ejercicios.length === 0) {
    return (
      <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(2) }}>
        <Txt style={{ color: colors.textMuted, textAlign: 'center', marginTop: spacing(6) }}>
          Este día no tiene ejercicios. Agregá algunos desde “Configurar rutina”.
        </Txt>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(10) }}
      keyboardShouldPersistTaps="handled"
    >
      <Eyebrow>{rutina.nombre}</Eyebrow>
      <Text style={{ ...type.h2, textTransform: 'uppercase', marginTop: spacing(0.5) }}>{dia.nombre}</Text>
      <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(0.5), marginBottom: spacing(2.5) }}>
        Registrá el peso de hoy
      </Txt>

      {dia.ejercicios.map((ej) => {
        const cat = ej.ejercicioId ? ejercicioPorId(ej.ejercicioId) : undefined;
        return (
          <TarjetaRegistro
            key={ej.uid}
            ejercicioId={ej.ejercicioId}
            nombre={ej.nombre}
            series={ej.series}
            reps={ej.reps}
            ult={ultimoRegistro(claveEjercicio(rutinaId, diaId, ej.uid))}
            historial={estado.historial[claveEjercicio(rutinaId, diaId, ej.uid)]}
            entrada={entradas[ej.uid]}
            onChange={(patch) => set(ej.uid, patch)}
            onVerDetalle={cat ? () => navigation.navigate('EjercicioDetalle', { ejercicioId: cat.id }) : undefined}
          />
        );
      })}

      <Boton titulo="Finalizar día" onPress={finalizar} style={{ marginTop: spacing(1) }} />

      <ModalAviso
        visible={!!aviso}
        titulo="Día completado"
        mensaje={aviso || undefined}
        textoBoton="Ir al inicio"
        onAceptar={() => {
          setAviso(null);
          navigation.navigate('Home');
        }}
      />
    </ScrollView>
  );
}
