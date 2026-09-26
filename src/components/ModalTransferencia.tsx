import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Animated, Easing } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow, Boton } from './ui';
import { exportarRutina, importarRutina, resumenImport, ResumenImport } from '../data/transfer';
import type { Rutina } from '../types';

type Fase = 'idle' | 'progreso' | 'listo' | 'error';

const PASOS_EXPORT = ['Serializando rutina…', 'Ofuscando datos…', 'Generando código…', 'Copiando al portapapeles…'];
const PASOS_IMPORT = ['Leyendo código…', 'Verificando integridad…', 'Reconstruyendo rutina…', 'Guardando…'];

// Modal de progreso para compartir (export) o importar una rutina.
export function ModalTransferencia({
  visible,
  modo,
  rutina,
  onCerrar,
  onImportado,
}: {
  visible: boolean;
  modo: 'export' | 'import';
  rutina?: Rutina | null;
  onCerrar: () => void;
  onImportado?: (r: Rutina) => void;
}) {
  const [fase, setFase] = useState<Fase>('idle');
  const [pasoTxt, setPasoTxt] = useState('');
  const [codigo, setCodigo] = useState(''); // export: resultado · import: input pegado
  const [error, setError] = useState('');
  const [resumen, setResumen] = useState<ResumenImport | null>(null);
  const [copiadoDeNuevo, setCopiadoDeNuevo] = useState(false);

  const progreso = useRef(new Animated.Value(0)).current;
  const timers = useRef<any[]>([]);
  const rutinaLista = useRef<Rutina | null>(null);

  const limpiarTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  // Reset al abrir/cerrar.
  useEffect(() => {
    if (!visible) {
      limpiarTimers();
      progreso.stopAnimation();
      return;
    }
    setFase('idle');
    setError('');
    setCopiadoDeNuevo(false);
    setResumen(null);
    progreso.setValue(0);
    if (modo === 'export') {
      setCodigo('');
      if (rutina) iniciarExport(rutina);
    } else {
      setCodigo('');
    }
    return () => limpiarTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Corre la barra + va cambiando el texto de paso; al terminar llama onFin.
  const correrProgreso = (pasos: string[], onFin: () => void) => {
    const dur = pasos.length * 340;
    setPasoTxt(pasos[0]);
    progreso.setValue(0);
    Animated.timing(progreso, {
      toValue: 1,
      duration: dur,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) onFin();
    });
    pasos.forEach((p, i) => {
      timers.current.push(setTimeout(() => setPasoTxt(p), i * 340));
    });
  };

  const iniciarExport = (r: Rutina) => {
    setFase('progreso');
    let code = '';
    try {
      code = exportarRutina(r);
    } catch {
      setError('No se pudo generar el código de la rutina.');
      setFase('error');
      return;
    }
    correrProgreso(PASOS_EXPORT, async () => {
      try {
        await Clipboard.setStringAsync(code);
      } catch {
        // aunque falle el copiado, mostramos el código para copiar a mano.
      }
      setCodigo(code);
      setFase('listo');
    });
  };

  const alPegar = (t: string) => {
    setCodigo(t);
    setError('');
    if (!t.trim()) {
      setResumen(null);
      return;
    }
    try {
      setResumen(resumenImport(t));
    } catch (e: any) {
      setResumen(null);
      setError(e?.message || 'El código no es válido.');
    }
  };

  const confirmarImport = () => {
    let r: Rutina;
    try {
      r = importarRutina(codigo);
    } catch (e: any) {
      setError(e?.message || 'El código no es válido.');
      return;
    }
    rutinaLista.current = r;
    setFase('progreso');
    correrProgreso(PASOS_IMPORT, () => {
      setFase('listo');
      timers.current.push(
        setTimeout(() => {
          if (rutinaLista.current && onImportado) onImportado(rutinaLista.current);
        }, 850)
      );
    });
  };

  const copiarDeNuevo = async () => {
    try {
      await Clipboard.setStringAsync(codigo);
      setCopiadoDeNuevo(true);
      timers.current.push(setTimeout(() => setCopiadoDeNuevo(false), 1600));
    } catch {}
  };

  const anchoBarra = progreso.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
        <View
          style={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.borderHi,
            padding: spacing(2),
          }}
        >
          {/* Encabezado */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Eyebrow style={{ color: colors.primary }}>{modo === 'export' ? 'Compartir rutina' : 'Importar rutina'}</Eyebrow>
              {modo === 'export' && rutina ? (
                <Txt style={{ ...type.h3, marginTop: 4 }} numberOfLines={2}>
                  {rutina.nombre}
                </Txt>
              ) : (
                <Txt style={{ ...type.h3, marginTop: 4 }}>Pegá el código</Txt>
              )}
            </View>
            <TouchableOpacity onPress={onCerrar} hitSlop={12} style={{ paddingLeft: spacing(1.5) }}>
              <Text style={{ color: colors.textMuted, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ----- Cuerpo por fase ----- */}

          {/* IMPORT · idle: pegar código */}
          {modo === 'import' && fase === 'idle' ? (
            <View style={{ marginTop: spacing(2) }}>
              <TextInput
                value={codigo}
                onChangeText={alPegar}
                placeholder="SHMB1.…"
                placeholderTextColor={colors.textFaint}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  backgroundColor: colors.bg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  color: colors.text,
                  paddingHorizontal: spacing(1.5),
                  paddingVertical: spacing(1.5),
                  minHeight: 92,
                  fontSize: font.small,
                  fontVariant: ['tabular-nums'] as any,
                }}
              />
              {resumen ? (
                <View
                  style={{
                    marginTop: spacing(1.5),
                    backgroundColor: colors.bg,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing(1.5),
                  }}
                >
                  <Eyebrow style={{ fontSize: 10 }}>Se va a crear</Eyebrow>
                  <Txt style={{ ...type.h3, marginTop: 4 }} numberOfLines={2}>{resumen.nombre}</Txt>
                  <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: 4 }}>
                    <Text style={type.num}>{resumen.dias}</Text> {resumen.dias === 1 ? 'día' : 'días'}
                    {'   ·   '}
                    <Text style={type.num}>{resumen.ejercicios}</Text> {resumen.ejercicios === 1 ? 'ejercicio' : 'ejercicios'}
                  </Txt>
                </View>
              ) : null}
              {error ? <Txt style={{ color: colors.danger, fontSize: font.small, marginTop: spacing(1.25) }}>{error}</Txt> : null}
              <Boton
                titulo="Confirmar import"
                onPress={confirmarImport}
                disabled={!resumen}
                style={{ marginTop: spacing(1.75) }}
              />
            </View>
          ) : null}

          {/* progreso */}
          {fase === 'progreso' ? (
            <View style={{ marginTop: spacing(2.5), marginBottom: spacing(1) }}>
              <View style={{ height: 8, backgroundColor: colors.bg, borderRadius: 4, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
                <Animated.View style={{ height: '100%', width: anchoBarra, backgroundColor: colors.primary }} />
              </View>
              <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1.25) }}>{pasoTxt}</Txt>
            </View>
          ) : null}

          {/* listo */}
          {fase === 'listo' ? (
            <View style={{ marginTop: spacing(2.5) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.bg, fontWeight: '900', fontSize: 13 }}>✓</Text>
                </View>
                <Txt style={{ ...type.h3, marginLeft: spacing(1) }}>
                  {modo === 'export' ? 'Listo · código copiado' : 'Rutina importada'}
                </Txt>
              </View>

              {modo === 'export' ? (
                <>
                  <View
                    style={{
                      marginTop: spacing(1.75),
                      backgroundColor: colors.bg,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: spacing(1.5),
                    }}
                  >
                    <Txt selectable style={{ color: colors.textMuted, fontSize: font.tiny, fontVariant: ['tabular-nums'] as any }} numberOfLines={4}>
                      {codigo}
                    </Txt>
                  </View>
                  <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(1) }}>
                    Ya está en tu portapapeles. Compartilo y quien lo pegue en “Importar rutina” tendrá la misma rutina.
                  </Txt>
                  <View style={{ flexDirection: 'row', marginTop: spacing(1.75), gap: spacing(1) as any }}>
                    <View style={{ flex: 1 }}>
                      <Boton titulo={copiadoDeNuevo ? 'Copiado ✓' : 'Copiar'} variante="secondary" onPress={copiarDeNuevo} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Boton titulo="Cerrar" onPress={onCerrar} />
                    </View>
                  </View>
                </>
              ) : (
                <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1.5) }}>
                  Te llevamos a tus rutinas…
                </Txt>
              )}
            </View>
          ) : null}

          {/* error (export) */}
          {fase === 'error' ? (
            <View style={{ marginTop: spacing(2.5) }}>
              <Txt style={{ color: colors.danger, fontSize: font.small }}>{error}</Txt>
              <Boton titulo="Cerrar" variante="secondary" onPress={onCerrar} style={{ marginTop: spacing(1.75) }} />
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
