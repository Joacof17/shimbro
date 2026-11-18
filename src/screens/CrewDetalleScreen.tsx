import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow, Cargando } from '../components/ui';
import { useAuth } from '../auth';
import { getCrew, perfilesDeCrew, construirTablero, salirDeCrew, Crew, PerfilCrew, EjercicioTablero } from '../crews';

type Props = NativeStackScreenProps<RootStackParamList, 'CrewDetalle'>;

const etiqueta = (p: PerfilCrew) => (p.apodo && p.apodo.trim() ? p.apodo.trim() : 'Sin apodo');
const kg = (v: number | null) => (v == null ? '—' : String(Math.round(v * 100) / 100));

export default function CrewDetalleScreen({ route, navigation }: Props) {
  const { crewId } = route.params;
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [crew, setCrew] = useState<Crew | null>(null);
  const [perfiles, setPerfiles] = useState<PerfilCrew[]>([]);
  const [tablero, setTablero] = useState<EjercicioTablero[]>([]);
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(async () => {
    const [c, ps] = await Promise.all([getCrew(crewId), perfilesDeCrew(crewId)]);
    setCrew(c);
    setPerfiles(ps);
    setTablero(construirTablero(ps));
    setCargando(false);
  }, [crewId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const copiarCodigo = async () => {
    if (!crew) return;
    try {
      await Clipboard.setStringAsync(crew.codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {}
  };

  const salir = () => {
    if (!user) return;
    salirDeCrew(crewId, user.id).then(() => navigation.goBack());
  };

  if (cargando) return <Cargando texto="Cargando tablero…" />;
  if (!crew) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Crew no encontrada.</Txt>
      </View>
    );
  }

  const solos = perfiles.length < 2;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(8) }}>
      {/* Cabecera: nombre + código compartible */}
      <Eyebrow style={{ color: colors.primary }}>Crew</Eyebrow>
      <Text style={{ ...type.h2, textTransform: 'uppercase', marginTop: spacing(0.5) }}>{crew.nombre || 'Crew'}</Text>
      <TouchableOpacity
        onPress={copiarCodigo}
        activeOpacity={0.8}
        style={{
          marginTop: spacing(1.5),
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: spacing(1.75),
          paddingVertical: spacing(1.5),
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Eyebrow style={{ fontSize: 10 }}>Código de acceso</Eyebrow>
          <Text style={{ ...type.num, color: colors.primary, fontSize: font.h2, letterSpacing: 6, marginTop: 2 }}>{crew.codigo}</Text>
        </View>
        <Text style={{ color: copiado ? colors.success : colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          {copiado ? 'Copiado ✓' : 'Copiar'}
        </Text>
      </TouchableOpacity>
      <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(1) }}>
        {perfiles.length} {perfiles.length === 1 ? 'integrante' : 'integrantes'} · compartí el código para sumar gente
      </Txt>

      {/* Tablero comparativo */}
      <View style={{ marginTop: spacing(3) }}>
        <Eyebrow>Tablero</Eyebrow>
        {solos ? (
          <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1.5), lineHeight: 20 }}>
            El tablero aparece cuando hay 2 o más integrantes. Compartí el código de arriba.
          </Txt>
        ) : tablero.length === 0 ? (
          <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1.5), lineHeight: 20 }}>
            Todavía no hay ejercicios en común (que 2+ integrantes tengan en su rutina). Cuando los haya, se comparan acá.
          </Txt>
        ) : (
          <View style={{ marginTop: spacing(1.5), gap: spacing(1.5) as any }}>
            {tablero.map((ej) => (
              <View key={ej.key} style={{ backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing(1.75) }}>
                <Txt style={{ ...type.h3 }} numberOfLines={2}>{ej.nombre}</Txt>
                <View style={{ marginTop: spacing(1.25), gap: spacing(0.75) as any }}>
                  {ej.filas.map((f, i) => {
                    const lider = i === 0 && f.peso != null;
                    const esYo = f.userId === user?.id;
                    return (
                      <View key={f.userId} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ ...type.num, color: lider ? colors.primary : colors.textFaint, fontSize: font.body, width: 26 }}>{i + 1}</Text>
                        <Txt style={{ flex: 1, color: esYo ? colors.text : colors.textMuted, fontSize: font.small, fontWeight: esYo ? '800' : '500' }} numberOfLines={1}>
                          {f.apodo}{esYo ? ' (vos)' : ''}
                        </Txt>
                        <Text style={{ ...type.num, color: lider ? colors.primary : colors.text, fontSize: font.body }}>
                          {kg(f.peso)}<Text style={{ color: colors.textMuted, fontSize: font.tiny }}> kg</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Dashboards por integrante */}
      <View style={{ marginTop: spacing(3) }}>
        <Eyebrow>Por integrante</Eyebrow>
        {perfiles.map((p) => (
          <View key={p.user_id} style={{ marginTop: spacing(1.5) }}>
            <Txt style={{ ...type.h3, textTransform: 'uppercase' }}>
              Ejercicios de {etiqueta(p)}{p.user_id === user?.id ? ' (vos)' : ''}
            </Txt>
            {p.resumen.length === 0 ? (
              <Txt style={{ color: colors.textFaint, fontSize: font.small, marginTop: spacing(0.75) }}>
                Todavía no tiene ejercicios en rutina.
              </Txt>
            ) : (
              <View style={{ marginTop: spacing(1), backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                {p.resumen
                  .slice()
                  .sort((a, b) => a.nombre.localeCompare(b.nombre))
                  .map((it, i) => (
                    <View
                      key={it.key}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: spacing(1.5),
                        paddingVertical: spacing(1.25),
                        borderTopWidth: i === 0 ? 0 : 1,
                        borderTopColor: colors.border,
                      }}
                    >
                      <Txt style={{ flex: 1, color: colors.text, fontSize: font.small }} numberOfLines={1}>{it.nombre}</Txt>
                      <Text style={{ ...type.num, color: it.mejorPeso == null ? colors.textFaint : colors.text, fontSize: font.body }}>
                        {kg(it.mejorPeso)}<Text style={{ color: colors.textMuted, fontSize: font.tiny }}> kg</Text>
                      </Text>
                    </View>
                  ))}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Salir de la crew */}
      <TouchableOpacity onPress={salir} hitSlop={8} style={{ marginTop: spacing(4), alignItems: 'center' }}>
        <Text style={{ color: colors.danger, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Salir de la crew
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
