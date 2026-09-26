import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from '../components/ui';
import { useStore } from '../store';
import { uid } from '../utils';
import {
  GRUPOS_MUSCULOS,
  ejerciciosPorMusculo,
  buscarEjercicios,
  conteoPorMusculo,
  primeraImagen,
  etiquetaMusculo,
} from '../data/catalogo';
import type { Ejercicio, EjercicioRutina } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SelectorEjercicios'>;
type Modo = 'musculo' | 'buscar';

export default function SelectorEjerciciosScreen({ route, navigation }: Props) {
  const { rutinaId, diaId } = route.params;
  const { estado, guardarRutina } = useStore();
  const rutina = estado.rutinas.find((r) => r.id === rutinaId);
  const dia = rutina?.dias.find((d) => d.id === diaId);

  const [modo, setModo] = useState<Modo>('musculo');
  const [musculoSel, setMusculoSel] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [nombreLibre, setNombreLibre] = useState('');
  const [agregados, setAgregados] = useState<number>(0);

  const conteos = useMemo(() => conteoPorMusculo(), []);
  const idsEnDia = useMemo(
    () => new Set((dia?.ejercicios || []).map((e) => e.ejercicioId).filter(Boolean) as string[]),
    [dia]
  );

  if (!rutina || !dia) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Día no encontrado.</Txt>
      </View>
    );
  }

  const agregar = (ej: Ejercicio) => {
    const nuevo: EjercicioRutina = {
      uid: uid('e_'),
      ejercicioId: ej.id,
      nombre: ej.nombre,
      esLibre: false,
      series: 3,
      reps: '8-12',
      musculo: ej.musculosPrimariosClave.map(etiquetaMusculo)[0],
    };
    guardarRutinaConEjercicio(nuevo);
  };

  const agregarLibre = () => {
    const nombre = nombreLibre.trim();
    if (!nombre) return;
    const nuevo: EjercicioRutina = {
      uid: uid('e_'),
      ejercicioId: null,
      nombre,
      esLibre: true,
      series: 3,
      reps: '8-12',
    };
    guardarRutinaConEjercicio(nuevo);
    setNombreLibre('');
  };

  const guardarRutinaConEjercicio = (nuevo: EjercicioRutina) => {
    const dias = rutina.dias.map((d) =>
      d.id === diaId ? { ...d, ejercicios: [...d.ejercicios, nuevo] } : d
    );
    guardarRutina({ ...rutina, dias });
    setAgregados((n) => n + 1);
  };

  const resultados = modo === 'buscar' ? buscarEjercicios(query) : musculoSel ? ejerciciosPorMusculo(musculoSel) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Encabezado con destino y modos */}
      <View style={{ padding: spacing(2), paddingBottom: spacing(1) }}>
        <Eyebrow>
          Agregando a {dia.nombre}
          {agregados > 0 ? `  ·  ${agregados} agregado${agregados === 1 ? '' : 's'}` : ''}
        </Eyebrow>

        <View style={{ flexDirection: 'row', marginTop: spacing(1.5), gap: spacing(1) as any }}>
          <TabBtn texto="Por músculo" activo={modo === 'musculo'} onPress={() => setModo('musculo')} />
          <TabBtn texto="Buscar" activo={modo === 'buscar'} onPress={() => setModo('buscar')} />
        </View>
      </View>

      {/* Ejercicio de texto libre */}
      <View style={{ paddingHorizontal: spacing(2), paddingBottom: spacing(1) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            paddingLeft: spacing(1.5),
          }}
        >
          <TextInput
            value={nombreLibre}
            onChangeText={setNombreLibre}
            placeholder="Inventar un ejercicio propio…"
            placeholderTextColor={colors.textFaint}
            style={{ flex: 1, color: colors.text, paddingVertical: spacing(1.5), fontSize: font.body }}
            onSubmitEditing={agregarLibre}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={agregarLibre}
            disabled={!nombreLibre.trim()}
            style={{
              backgroundColor: nombreLibre.trim() ? colors.primary : colors.surface2,
              paddingHorizontal: spacing(2),
              paddingVertical: spacing(1.5),
              borderTopRightRadius: radius.md,
              borderBottomRightRadius: radius.md,
            }}
          >
            <Text style={{ color: nombreLibre.trim() ? '#0B0C0F' : colors.textMuted, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', fontSize: font.small }}>
              Añadir
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido según modo */}
      {modo === 'buscar' ? (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: spacing(2), paddingVertical: spacing(1) }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar por nombre (ej: press, sentadilla)…"
              placeholderTextColor={colors.textFaint}
              autoFocus
              style={{
                backgroundColor: colors.surface,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                color: colors.text,
                paddingHorizontal: spacing(1.5),
                paddingVertical: spacing(1.5),
                fontSize: font.body,
              }}
            />
          </View>
          <ListaEjercicios
            datos={resultados}
            idsEnDia={idsEnDia}
            onAgregar={agregar}
            onDetalle={(e) => navigation.navigate('EjercicioDetalle', { ejercicioId: e.id })}
            vacio={query.trim() ? 'Sin resultados para esa búsqueda.' : 'Escribí para buscar ejercicios.'}
          />
        </View>
      ) : musculoSel ? (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => setMusculoSel(null)}
            style={{ paddingHorizontal: spacing(2), paddingVertical: spacing(1) }}
          >
            <Txt style={{ color: colors.primary, fontWeight: '700' }}>‹ Volver a músculos</Txt>
          </TouchableOpacity>
          <ListaEjercicios
            datos={resultados}
            idsEnDia={idsEnDia}
            onAgregar={agregar}
            onDetalle={(e) => navigation.navigate('EjercicioDetalle', { ejercicioId: e.id })}
            vacio="Sin ejercicios."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing(2), paddingTop: spacing(0.5) }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {GRUPOS_MUSCULOS.map((g) => (
              <TouchableOpacity
                key={g.clave}
                activeOpacity={0.85}
                onPress={() => setMusculoSel(g.clave)}
                style={{
                  width: '48.5%',
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: spacing(1.75),
                  marginBottom: spacing(1.5),
                }}
              >
                <Txt style={{ fontWeight: '900', fontSize: font.body, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                  {g.etiqueta}
                </Txt>
                <Text style={{ ...type.num, color: colors.primary, fontSize: font.h3, marginTop: spacing(1) }}>
                  {conteos[g.clave] || 0}
                </Text>
                <Eyebrow style={{ fontSize: 10, marginTop: 2 }}>ejercicios</Eyebrow>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function TabBtn({ texto, activo, onPress }: { texto: string; activo: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: spacing(1),
        paddingHorizontal: spacing(2),
        borderRadius: radius.sm,
        backgroundColor: activo ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: activo ? colors.primary : colors.border,
      }}
    >
      <Text
        style={{
          color: activo ? '#0B0C0F' : colors.textMuted,
          fontWeight: '900',
          fontSize: font.small,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

function ListaEjercicios({
  datos,
  idsEnDia,
  onAgregar,
  onDetalle,
  vacio,
}: {
  datos: Ejercicio[];
  idsEnDia: Set<string>;
  onAgregar: (e: Ejercicio) => void;
  onDetalle: (e: Ejercicio) => void;
  vacio: string;
}) {
  return (
    <FlatList
      data={datos}
      keyExtractor={(e) => e.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: spacing(2), paddingTop: spacing(0.5), paddingBottom: spacing(6) }}
      ListEmptyComponent={
        <Txt style={{ color: colors.textFaint, textAlign: 'center', marginTop: spacing(4) }}>{vacio}</Txt>
      }
      renderItem={({ item }) => {
        const img = primeraImagen(item);
        const yaEsta = idsEnDia.has(item.id);
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing(1),
              marginBottom: spacing(1),
            }}
          >
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => onDetalle(item)}>
              {img ? (
                <Image
                  source={{ uri: img }}
                  resizeMode="cover"
                  style={{ width: 66, height: 44, borderRadius: radius.sm, backgroundColor: colors.surface2 }}
                />
              ) : (
                <View
                  style={{
                    width: 66,
                    height: 44,
                    borderRadius: radius.sm,
                    backgroundColor: colors.surface2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                />
              )}
              <View style={{ flex: 1, marginLeft: spacing(1.25) }}>
                <Txt style={{ fontWeight: '800', fontSize: font.body }} numberOfLines={2}>
                  {item.nombre}
                </Txt>
                <Txt style={{ color: colors.textMuted, fontSize: font.tiny, marginTop: 3, textTransform: 'capitalize' }}>
                  {item.equipo} · {item.nivel}
                </Txt>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onAgregar(item)}
              style={{
                width: 40,
                height: 40,
                borderRadius: radius.sm,
                backgroundColor: yaEsta ? colors.successDim : colors.primary,
                borderWidth: 1,
                borderColor: yaEsta ? colors.success : colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing(1),
              }}
            >
              <Text style={{ color: yaEsta ? colors.success : '#0B0C0F', fontSize: yaEsta ? 18 : 24, fontWeight: '900', marginTop: -2 }}>
                {yaEsta ? '✓' : '＋'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}
