import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Boton, Eyebrow, Tarjeta, Vacio, Cargando } from '../components/ui';
import { useAuth } from '../auth';
import { misCrews, crearCrew, unirseACrew, Crew } from '../crews';

type Props = NativeStackScreenProps<RootStackParamList, 'Crews'>;

export default function CrewsScreen({ navigation }: Props) {
  const { apodo, guardarApodo } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [crews, setCrews] = useState<Crew[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState('');
  const [trabajando, setTrabajando] = useState(false);

  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');

  // Si no tenés apodo, se pide primero antes de sumarte a una crew.
  const [pidiendoApodo, setPidiendoApodo] = useState(false);
  const [apodoInput, setApodoInput] = useState('');
  const [pendiente, setPendiente] = useState<'unirse' | 'crear' | null>(null);

  const cargar = useCallback(async () => {
    try {
      setCrews(await misCrews());
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar las crews.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('focus', cargar);
    return unsub;
  }, [navigation, cargar]);

  // Puertas: si no hay apodo, pedirlo primero y continuar la acción al guardarlo.
  const pedirApodo = (accion: 'unirse' | 'crear') => {
    setApodoInput('');
    setPendiente(accion);
    setPidiendoApodo(true);
  };

  const intentarUnirse = () => {
    const cod = codigo.trim().toUpperCase();
    if (cod.length !== 6) {
      setError('El código tiene 6 caracteres.');
      return;
    }
    setError(null);
    if (!apodo) {
      pedirApodo('unirse');
      return;
    }
    unirse();
  };

  const intentarCrear = () => {
    if (!apodo) {
      pedirApodo('crear');
      return;
    }
    setCreando(true);
  };

  const confirmarApodo = async () => {
    await guardarApodo(apodoInput);
    setPidiendoApodo(false);
    const acc = pendiente;
    setPendiente(null);
    if (acc === 'unirse') unirse();
    else if (acc === 'crear') setCreando(true);
  };

  const unirse = async () => {
    const cod = codigo.trim().toUpperCase();
    if (cod.length !== 6) {
      setError('El código tiene 6 caracteres.');
      return;
    }
    setError(null);
    setTrabajando(true);
    try {
      const crew = await unirseACrew(cod);
      setCodigo('');
      await cargar();
      navigation.navigate('CrewDetalle', { crewId: crew.id });
    } catch (e: any) {
      setError(e?.message || 'No se pudo unir.');
    } finally {
      setTrabajando(false);
    }
  };

  const crear = async () => {
    setTrabajando(true);
    try {
      const crew = await crearCrew(nombre);
      setCreando(false);
      setNombre('');
      await cargar();
      navigation.navigate('CrewDetalle', { crewId: crew.id });
    } catch (e: any) {
      setError(e?.message || 'No se pudo crear.');
      setCreando(false);
    } finally {
      setTrabajando(false);
    }
  };

  if (cargando) return <Cargando texto="Cargando crews…" />;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}>
      {!apodo ? (
        <View style={{ backgroundColor: colors.surface2, borderRadius: radius.md, borderWidth: 1, borderColor: colors.warn, padding: spacing(1.5), marginBottom: spacing(2) }}>
          <Txt style={{ color: colors.warn, fontSize: font.small }}>
            Configurá tu apodo en Inicio para que tus compañeros te identifiquen (si no, aparecés como "Sin apodo").
          </Txt>
        </View>
      ) : null}

      {/* Unirse por código */}
      <Eyebrow>Unirse a una crew</Eyebrow>
      <View style={{ flexDirection: 'row', marginTop: spacing(1), gap: spacing(1) as any }}>
        <TextInput
          value={codigo}
          onChangeText={(t) => setCodigo(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
          placeholder="CÓDIGO"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="characters"
          autoCorrect={false}
          style={{
            flex: 1,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            color: colors.text,
            paddingHorizontal: spacing(1.5),
            paddingVertical: spacing(1.4),
            fontSize: font.h3,
            fontWeight: '900',
            letterSpacing: 4,
            fontVariant: ['tabular-nums'] as any,
          }}
        />
        <Boton titulo="Unirme" onPress={intentarUnirse} disabled={trabajando || codigo.length !== 6} />
      </View>

      <Boton titulo="Crear una crew" variante="secondary" onPress={intentarCrear} style={{ marginTop: spacing(1.5) }} />

      {error ? <Txt style={{ color: colors.danger, fontSize: font.small, marginTop: spacing(1.25) }}>{error}</Txt> : null}

      {/* Mis crews */}
      <View style={{ marginTop: spacing(3) }}>
        <Eyebrow>Mis crews</Eyebrow>
        {crews.length === 0 ? (
          <View style={{ marginTop: spacing(2) }}>
            <Vacio titulo="Todavía no estás en ninguna crew" sub="Creá una y compartí el código, o unite con el código de un amigo." />
          </View>
        ) : (
          <View style={{ marginTop: spacing(1.5), gap: spacing(1.25) as any }}>
            {crews.map((c) => (
              <Tarjeta key={c.id} onPress={() => navigation.navigate('CrewDetalle', { crewId: c.id })}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Txt style={{ ...type.h3, textTransform: 'uppercase' }}>{c.nombre || 'Crew'}</Txt>
                    <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: 3 }}>
                      Código <Text style={{ ...type.num, color: colors.primary, letterSpacing: 2 }}>{c.codigo}</Text>
                    </Txt>
                  </View>
                  <Text style={{ color: colors.textFaint, fontSize: 24 }}>›</Text>
                </View>
              </Tarjeta>
            ))}
          </View>
        )}
      </View>

      {/* Modal crear crew */}
      <Modal visible={creando} transparent animationType="fade" onRequestClose={() => setCreando(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderHi, padding: spacing(2) }}>
            <Eyebrow style={{ color: colors.primary }}>Nueva crew</Eyebrow>
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1), lineHeight: 19 }}>
              Ponele un nombre (opcional). Se genera un código de 6 caracteres para compartir.
            </Txt>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Los del gym"
              placeholderTextColor={colors.textFaint}
              maxLength={30}
              style={{
                marginTop: spacing(1.5),
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                color: colors.text,
                paddingHorizontal: spacing(1.5),
                paddingVertical: spacing(1.5),
                fontSize: font.body,
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: spacing(2), gap: spacing(1) as any }}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cancelar" variante="secondary" onPress={() => setCreando(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Crear" onPress={crear} disabled={trabajando} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: pedir apodo antes de sumarse a una crew */}
      <Modal visible={pidiendoApodo} transparent animationType="fade" onRequestClose={() => setPidiendoApodo(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderHi, padding: spacing(2) }}>
            <Eyebrow style={{ color: colors.primary }}>Primero, tu apodo</Eyebrow>
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1), lineHeight: 19 }}>
              Para sumarte a una crew necesitás un apodo: así te identifican tus compañeros (nunca ven tu email).
            </Txt>
            <TextInput
              value={apodoInput}
              onChangeText={setApodoInput}
              placeholder="Ej: Cyrus"
              placeholderTextColor={colors.textFaint}
              autoCapitalize="words"
              maxLength={24}
              style={{
                marginTop: spacing(1.5),
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                color: colors.text,
                paddingHorizontal: spacing(1.5),
                paddingVertical: spacing(1.5),
                fontSize: font.body,
              }}
            />
            <View style={{ flexDirection: 'row', marginTop: spacing(2), gap: spacing(1) as any }}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cancelar" variante="secondary" onPress={() => { setPidiendoApodo(false); setPendiente(null); }} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Continuar" onPress={confirmarApodo} disabled={!apodoInput.trim()} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
