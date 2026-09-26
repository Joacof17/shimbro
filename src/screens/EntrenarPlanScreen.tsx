import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, font, type } from '../theme';
import { Txt, Boton, Eyebrow } from '../components/ui';
import { TarjetaRegistro, EntradaReg, entradaInicial } from '../components/RegistroEjercicio';
import { ModalAviso } from '../components/ModalAviso';
import { useStore } from '../store';
import { RUTINAS_PERSONALIZADAS } from '../data/personalizadas';
import { buscarEjercicios } from '../data/catalogo';

type Props = NativeStackScreenProps<RootStackParamList, 'EntrenarPlan'>;

// Sesión extra a partir de un plan por objetivo: se registran los pesos
// (y se recuerda la "última vez" para la próxima), pero NO se crea una rutina
// ni cuenta en el progreso semanal.
export default function EntrenarPlanScreen({ route, navigation }: Props) {
  const { planId } = route.params;
  const { estado, ultimoRegistro, registrar } = useStore();
  const plan = RUTINAS_PERSONALIZADAS.find((r) => r.id === planId);

  // Resuelve cada ejercicio del plan a una coincidencia del catálogo (si existe).
  const items = useMemo(
    () =>
      (plan?.ejercicios || []).map((ej, i) => {
        const cat = ej.buscar ? buscarEjercicios(ej.buscar, 1)[0] : undefined;
        return {
          clave: `plan|${planId}|${i}`,
          nombre: ej.nombre,
          series: parseInt(ej.series, 10) || 3,
          reps: ej.reps,
          ejercicioId: cat?.id || null,
        };
      }),
    [plan, planId]
  );

  const inicial = useMemo(() => {
    const m: Record<string, EntradaReg> = {};
    items.forEach((it) => {
      m[it.clave] = entradaInicial(ultimoRegistro(it.clave), it.reps);
    });
    return m;
  }, [items]);

  const [entradas, setEntradas] = useState<Record<string, EntradaReg>>(inicial);
  const [aviso, setAviso] = useState<string | null>(null);

  if (!plan) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Plan no encontrado.</Txt>
      </View>
    );
  }

  const set = (clave: string, patch: Partial<EntradaReg>) =>
    setEntradas((prev) => ({ ...prev, [clave]: { ...prev[clave], ...patch } }));

  const finalizar = () => {
    let registrados = 0;
    items.forEach((it) => {
      const e = entradas[it.clave];
      const esCorporal = e?.equipo === 'peso corporal';
      const peso = parseFloat((e?.peso || '').replace(',', '.'));
      if (esCorporal || !isNaN(peso)) {
        registrar(it.clave, {
          fecha: Date.now(),
          peso: esCorporal ? 0 : peso,
          equipo: e.equipo,
          reps: e.reps,
          series: it.series,
        });
        registrados++;
      }
    });
    setAviso(
      registrados > 0
        ? `Guardaste el peso de ${registrados} ejercicio${registrados === 1 ? '' : 's'}. La próxima vez vas a ver estos números como referencia.`
        : 'Buen trabajo extra.'
    );
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(10) }}
      keyboardShouldPersistTaps="handled"
    >
      <Eyebrow style={{ color: colors.primary }}>Sesión extra · {plan.objetivo}</Eyebrow>
      <Text style={{ ...type.h2, textTransform: 'uppercase', marginTop: spacing(0.5) }}>{plan.titulo}</Text>
      <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(0.5), marginBottom: spacing(2.5) }}>
        Registrá lo que levantes hoy. No se guarda como rutina.
      </Txt>

      {items.map((it) => (
        <TarjetaRegistro
          key={it.clave}
          ejercicioId={it.ejercicioId}
          nombre={it.nombre}
          series={it.series}
          reps={it.reps}
          ult={ultimoRegistro(it.clave)}
          historial={estado.historial[it.clave]}
          entrada={entradas[it.clave]}
          onChange={(patch) => set(it.clave, patch)}
          onVerDetalle={it.ejercicioId ? () => navigation.navigate('EjercicioDetalle', { ejercicioId: it.ejercicioId! }) : undefined}
        />
      ))}

      <Boton titulo="Finalizar sesión" onPress={finalizar} style={{ marginTop: spacing(1) }} />

      <ModalAviso
        visible={!!aviso}
        titulo="Sesión extra completada"
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
