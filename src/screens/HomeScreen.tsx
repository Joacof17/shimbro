import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow, Boton } from '../components/ui';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { EJERCICIOS } from '../data/catalogo';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Opcion = { a: keyof RootStackParamList; tag: string; titulo: string; sub: string; destacado?: boolean };

const OPCIONES: Opcion[] = [
  { a: 'ComenzarRutina', tag: '01', titulo: 'Entrenar', sub: 'Registrá el peso de hoy', destacado: true },
  { a: 'ConfigurarRutina', tag: '02', titulo: 'Configurar rutina', sub: 'Armá tus días y ejercicios' },
  { a: 'Personalizado', tag: '03', titulo: 'Planes por objetivo', sub: 'Para un día extra de gimnasio' },
];

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { estado } = useStore();
  const totalRutinas = estado.rutinas.length;
  const { configurado, user, apodo, guardarApodo, cerrarSesion } = useAuth();

  const [editandoApodo, setEditandoApodo] = useState(false);
  const [apodoInput, setApodoInput] = useState('');

  // --- Export temporal de datos locales (solo Android, para migración única) ---
  const [exportVisible, setExportVisible] = useState(false);
  const [exportData, setExportData] = useState('');
  const [exportCopiado, setExportCopiado] = useState(false);
  const abrirExport = async () => {
    const raw = (await AsyncStorage.getItem('shimbro:estado:v1').catch(() => null)) || '(vacío)';
    setExportData(raw);
    setExportCopiado(false);
    setExportVisible(true);
  };
  const copiarExport = async () => {
    try {
      await Clipboard.setStringAsync(exportData);
      setExportCopiado(true);
    } catch {}
  };

  const abrirApodo = () => {
    setApodoInput(apodo || '');
    setEditandoApodo(true);
  };
  const confirmarApodo = async () => {
    await guardarApodo(apodoInput);
    setEditandoApodo(false);
  };

  // Crews solo con sesión (web).
  const opciones: Opcion[] = configurado && user
    ? [...OPCIONES, { a: 'Crews', tag: '04', titulo: 'Crews', sub: 'Compará tu progreso con tu grupo' }]
    : OPCIONES;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2.5), paddingTop: insets.top + spacing(3.5), paddingBottom: spacing(6) }}
    >
      {/* Hero */}
      <Eyebrow>Registro de fuerza</Eyebrow>
      <Text style={{ ...type.display, fontSize: 46, marginTop: spacing(1), textTransform: 'uppercase' }}>Shimbro</Text>
      <View style={{ height: 4, width: 56, backgroundColor: colors.primary, marginTop: spacing(1.5) }} />
      <Txt style={{ color: colors.textMuted, fontSize: font.body, marginTop: spacing(1.75), lineHeight: 21 }}>
        Elegí el día, cargá la barra, anotá el número. La progresión se lleva sola.
      </Txt>

      {/* Cuenta (solo en web con sesión) */}
      {configurado && user ? (
        <View
          style={{
            marginTop: spacing(2.5),
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing(1.75),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            {apodo ? (
              <>
                <Eyebrow>Sesión iniciada</Eyebrow>
                <Txt style={{ color: colors.text, fontSize: font.h3, fontWeight: '800', marginTop: 3 }} numberOfLines={1}>
                  Bienvenido, {apodo}
                </Txt>
                <TouchableOpacity onPress={abrirApodo} hitSlop={6}>
                  <Text style={{ color: colors.primary, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 4 }}>
                    Editar apodo
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Eyebrow>Sesión iniciada</Eyebrow>
                <TouchableOpacity onPress={abrirApodo} hitSlop={6}>
                  <Text style={{ color: colors.primary, fontSize: font.h3, fontWeight: '800', marginTop: 3 }}>
                    Configurá tu apodo ›
                  </Text>
                </TouchableOpacity>
                <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: 3 }} numberOfLines={1}>
                  {user.email}
                </Txt>
              </>
            )}
          </View>
          <TouchableOpacity onPress={cerrarSesion} hitSlop={8} style={{ paddingLeft: spacing(1.5) }}>
            <Text style={{ color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Salir
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Acciones */}
      <View style={{ marginTop: spacing(4), gap: spacing(1.5) as any }}>
        {opciones.map((o) => (
          <TouchableOpacity
            key={o.a}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(o.a as any)}
            style={{
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: o.destacado ? colors.borderHi : colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Filo ember solo en la acción principal */}
            <View style={{ width: 4, alignSelf: 'stretch', backgroundColor: o.destacado ? colors.primary : 'transparent' }} />
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface2,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: spacing(1.75),
                marginVertical: spacing(2),
              }}
            >
              <Text style={{ ...type.num, fontSize: font.body, color: o.destacado ? colors.primary : colors.textMuted }}>
                {o.tag}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: spacing(1.75), paddingRight: spacing(1) }}>
              <Txt style={{ ...type.h3, textTransform: 'uppercase', letterSpacing: 0.4 }}>{o.titulo}</Txt>
              <Txt style={{ color: colors.textMuted, marginTop: 3, fontSize: font.small }}>{o.sub}</Txt>
            </View>
            <Text style={{ color: colors.textFaint, fontSize: 24, marginRight: spacing(2) }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Marcador */}
      <View style={{ marginTop: spacing(4) }}>
        <Eyebrow>En la app</Eyebrow>
        <View style={{ marginTop: spacing(1.5), flexDirection: 'row', gap: spacing(1.5) as any }}>
          <Stat valor={EJERCICIOS.length} etiqueta="ejercicios" />
          <Stat valor={totalRutinas} etiqueta={totalRutinas === 1 ? 'rutina' : 'rutinas'} />
          <Stat valor={17} etiqueta="músculos" />
        </View>
      </View>

      {/* Export temporal (solo Android) para migrar el progreso local a la cuenta */}
      {Platform.OS !== 'web' ? (
        <TouchableOpacity onPress={abrirExport} hitSlop={8} style={{ marginTop: spacing(3), alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted, fontSize: font.tiny, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Exportar mi progreso
          </Text>
        </TouchableOpacity>
      ) : null}

      <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(4), textAlign: 'center', letterSpacing: 0.3 }}>
        Catálogo en español · imágenes vía free-exercise-db
      </Txt>

      {/* Modal de export temporal */}
      <Modal visible={exportVisible} transparent animationType="fade" onRequestClose={() => setExportVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
          <View style={{ width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderHi, padding: spacing(2) }}>
            <Eyebrow style={{ color: colors.primary }}>Exportar progreso</Eyebrow>
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1), lineHeight: 19 }}>
              Copiá este texto y pegámelo en el chat para migrarlo a tu cuenta.
            </Txt>
            <ScrollView style={{ maxHeight: 220, marginTop: spacing(1.5), backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }}>
              <Text selectable style={{ color: colors.textMuted, fontSize: font.tiny, padding: spacing(1.25), fontVariant: ['tabular-nums'] as any }}>
                {exportData}
              </Text>
            </ScrollView>
            <View style={{ flexDirection: 'row', marginTop: spacing(1.75), gap: spacing(1) as any }}>
              <View style={{ flex: 1 }}>
                <Boton titulo={exportCopiado ? 'Copiado ✓' : 'Copiar'} variante="secondary" onPress={copiarExport} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cerrar" onPress={() => setExportVisible(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para configurar el apodo */}
      <Modal visible={editandoApodo} transparent animationType="fade" onRequestClose={() => setEditandoApodo(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
          <View style={{ width: '100%', maxWidth: 400, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderHi, padding: spacing(2) }}>
            <Eyebrow style={{ color: colors.primary }}>Tu apodo</Eyebrow>
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1), lineHeight: 19 }}>
              Así te van a ver tus compañeros de crew (nunca tu email).
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
                <Boton titulo="Cancelar" variante="secondary" onPress={() => setEditandoApodo(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Guardar" onPress={confirmarApodo} disabled={!apodoInput.trim()} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Stat({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingVertical: spacing(1.75),
        paddingHorizontal: spacing(1.5),
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ ...type.num, fontSize: font.h2, color: colors.primary }}>{valor}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ ...type.eyebrow, fontSize: 10, letterSpacing: 0.8, marginTop: 5 }}
      >
        {etiqueta}
      </Text>
    </View>
  );
}
