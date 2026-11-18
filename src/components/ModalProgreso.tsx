import React, { useMemo } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from './ui';
import { haceCuanto } from '../utils';
import type { RegistroPeso } from '../types';

// Modal con el progreso histórico de peso (kg) de un ejercicio, desde el primer log.
// Las sesiones de peso corporal (sin kg) se resumen aparte, porque no son comparables en el eje.

function fechaCorta(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

// Un segmento recto entre dos puntos, dibujado con una View rotada (sin dependencias de SVG).
function Segmento({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const th = 2.5;
  return (
    <View
      style={{
        position: 'absolute',
        left: midX - len / 2,
        top: midY - th / 2,
        width: len,
        height: th,
        borderRadius: th,
        backgroundColor: color,
        transform: [{ rotate: `${ang}rad` }],
      }}
    />
  );
}

export function ModalProgreso({
  visible,
  onClose,
  nombre,
  historial,
}: {
  visible: boolean;
  onClose: () => void;
  nombre: string;
  historial?: RegistroPeso[];
}) {
  const lista = historial || [];
  const conPeso = useMemo(
    () => lista.filter((r) => r.equipo !== 'peso corporal' && Number.isFinite(r.peso) && r.peso > 0),
    [lista]
  );
  const corporales = lista.filter((r) => r.equipo === 'peso corporal');

  const cardW = Math.min(Dimensions.get('window').width - spacing(4), 440);
  const innerW = cardW - spacing(4); // padding lateral de la card

  // Geometría del gráfico.
  const plotH = 168;
  const padTop = 16;
  const padBottom = 26;
  const usable = plotH - padTop - padBottom;
  const n = conPeso.length;
  const pesos = conPeso.map((r) => r.peso);
  const maxP = n ? Math.max(...pesos) : 0;
  const minP = n ? Math.min(...pesos) : 0;
  const rango = maxP - minP || 1;
  const gap = 48;
  const contentW = n > 1 ? Math.max(innerW, (n - 1) * gap + 24) : innerW;
  const xFor = (i: number) => (n > 1 ? 12 + (i * (contentW - 24)) / (n - 1) : contentW / 2);
  const yFor = (p: number) => padTop + (1 - (p - minP) / rango) * usable;

  const primero = conPeso[0];
  const ultimo = conPeso[n - 1];
  const delta = n > 1 ? ultimo.peso - primero.peso : 0;

  // Redondea a 2 decimales y saca ceros sobrantes (evita el 8.600000000001 de los floats).
  const kg = (v: number) => String(Math.round(v * 100) / 100);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
        <View
          style={{
            width: cardW,
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
              <Eyebrow style={{ color: colors.primary }}>Progreso histórico</Eyebrow>
              <Txt style={{ ...type.h3, marginTop: 4 }} numberOfLines={2}>
                {nombre}
              </Txt>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12} style={{ paddingLeft: spacing(1.5) }}>
              <Text style={{ color: colors.textMuted, fontSize: 20, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {n === 0 ? (
            <View style={{ marginTop: spacing(2.5), marginBottom: spacing(1) }}>
              <Txt style={{ color: colors.textMuted, fontSize: font.small, lineHeight: 20 }}>
                {corporales.length
                  ? `Registraste ${corporales.length} ${corporales.length === 1 ? 'sesión' : 'sesiones'} a peso corporal. El gráfico de kg aparece cuando cargás peso con mancuerna o barra.`
                  : 'Todavía no hay registros con peso para graficar.'}
              </Txt>
            </View>
          ) : (
            <>
              {/* Marcador */}
              <View style={{ flexDirection: 'row', marginTop: spacing(2), gap: spacing(1) as any }}>
                <Stat etiqueta="Máximo" valor={kg(maxP)} unidad="kg" acento />
                <Stat etiqueta="Actual" valor={kg(ultimo.peso)} unidad="kg" />
                <Stat
                  etiqueta="Progreso"
                  valor={`${delta > 0 ? '+' : ''}${kg(delta)}`}
                  unidad="kg"
                  color={delta > 0 ? colors.success : delta < 0 ? colors.danger : colors.textMuted}
                />
              </View>

              {/* Gráfico */}
              <View style={{ marginTop: spacing(2) }}>
                {n === 1 ? (
                  <Txt style={{ color: colors.textFaint, fontSize: font.small, marginBottom: spacing(1) }}>
                    Necesitás al menos 2 sesiones con peso para ver la curva.
                  </Txt>
                ) : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ width: contentW, height: plotH }}>
                    {/* Líneas guía max/min */}
                    <View style={{ position: 'absolute', left: 0, right: 0, top: yFor(maxP), height: 1, backgroundColor: colors.border }} />
                    <View style={{ position: 'absolute', left: 0, right: 0, top: yFor(minP), height: 1, backgroundColor: colors.border }} />

                    {/* Segmentos de la curva */}
                    {conPeso.slice(1).map((r, i) => (
                      <Segmento
                        key={`s${i}`}
                        x1={xFor(i)}
                        y1={yFor(conPeso[i].peso)}
                        x2={xFor(i + 1)}
                        y2={yFor(r.peso)}
                        color={colors.primary}
                      />
                    ))}

                    {/* Puntos */}
                    {conPeso.map((r, i) => {
                      const esUltimo = i === n - 1;
                      return (
                        <View
                          key={`p${i}`}
                          style={{
                            position: 'absolute',
                            left: xFor(i) - (esUltimo ? 6 : 4),
                            top: yFor(r.peso) - (esUltimo ? 6 : 4),
                            width: esUltimo ? 12 : 8,
                            height: esUltimo ? 12 : 8,
                            borderRadius: esUltimo ? 6 : 4,
                            backgroundColor: esUltimo ? colors.primary : colors.surface,
                            borderWidth: 2,
                            borderColor: colors.primary,
                          }}
                        />
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Eje X: primera y última fecha */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Txt style={{ color: colors.textFaint, fontSize: font.tiny }}>{fechaCorta(primero.fecha)}</Txt>
                  <Txt style={{ color: colors.textFaint, fontSize: font.tiny }}>
                    {n} {n === 1 ? 'sesión' : 'sesiones'} · {haceCuanto(ultimo.fecha)}
                  </Txt>
                  <Txt style={{ color: colors.textFaint, fontSize: font.tiny }}>{fechaCorta(ultimo.fecha)}</Txt>
                </View>
              </View>

              {corporales.length ? (
                <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(1.5) }}>
                  + {corporales.length} {corporales.length === 1 ? 'sesión' : 'sesiones'} a peso corporal (sin kg).
                </Txt>
              ) : null}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function Stat({
  etiqueta,
  valor,
  unidad,
  acento,
  color,
}: {
  etiqueta: string;
  valor: string;
  unidad: string;
  acento?: boolean;
  color?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing(1.25),
        paddingHorizontal: spacing(1.25),
      }}
    >
      <Eyebrow style={{ fontSize: 9 }}>{etiqueta}</Eyebrow>
      <Text style={{ marginTop: 4 }}>
        <Text style={{ ...type.num, fontSize: font.h3, color: color || (acento ? colors.primary : colors.text) }}>{valor}</Text>
        <Text style={{ ...type.num, fontSize: font.tiny, color: colors.textMuted }}> {unidad}</Text>
      </Text>
    </View>
  );
}
