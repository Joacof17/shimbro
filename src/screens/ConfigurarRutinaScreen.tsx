import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Boton, Tarjeta, Vacio, Eyebrow } from '../components/ui';
import { ModalTransferencia } from '../components/ModalTransferencia';
import { useStore } from '../store';
import { uid } from '../utils';
import type { Rutina } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigurarRutina'>;

export default function ConfigurarRutinaScreen({ navigation }: Props) {
  const { estado, guardarRutina, eliminarRutina } = useStore();
  const [exportando, setExportando] = useState<Rutina | null>(null);
  const [importando, setImportando] = useState(false);
  const [porBorrar, setPorBorrar] = useState<Rutina | null>(null);

  const crear = () => {
    const nueva: Rutina = {
      id: uid('rt_'),
      nombre: `Rutina ${estado.rutinas.length + 1}`,
      dias: [{ id: uid('d_'), nombre: 'Día 1', ejercicios: [] }],
      creadaEn: Date.now(),
    };
    guardarRutina(nueva);
    navigation.navigate('EditorRutina', { rutinaId: nueva.id });
  };

  const confirmarBorrar = (r: Rutina) => setPorBorrar(r);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(6) }}
    >
      <Boton titulo="Nueva rutina" onPress={crear} />
      <Boton
        titulo="Importar rutina"
        variante="secondary"
        onPress={() => setImportando(true)}
        style={{ marginTop: spacing(1.25) }}
      />

      {estado.rutinas.length === 0 ? (
        <View style={{ marginTop: spacing(6) }}>
          <Vacio
            titulo="Todavía no tenés rutinas"
            sub="Creá tu primera rutina, agregá días y llená cada uno con los ejercicios que quieras."
          />
        </View>
      ) : (
        <View style={{ marginTop: spacing(2.5), gap: spacing(1.5) as any }}>
          {estado.rutinas.map((r) => {
            const totalEj = r.dias.reduce((a, d) => a + d.ejercicios.length, 0);
            return (
              <Tarjeta key={r.id} onPress={() => navigation.navigate('EditorRutina', { rutinaId: r.id })}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Txt style={{ ...type.h3, textTransform: 'uppercase' }}>{r.nombre}</Txt>
                    <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: 4 }}>
                      <Text style={type.num}>{r.dias.length}</Text> {r.dias.length === 1 ? 'día' : 'días'}
                      {'   ·   '}
                      <Text style={type.num}>{totalEj}</Text> {totalEj === 1 ? 'ejercicio' : 'ejercicios'}
                    </Txt>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(1.25) }}>
                      {r.dias.map((d) => (
                        <View
                          key={d.id}
                          style={{
                            backgroundColor: colors.surface2,
                            borderWidth: 1,
                            borderColor: colors.border,
                            paddingVertical: 4,
                            paddingHorizontal: spacing(1),
                            borderRadius: radius.sm,
                            marginRight: 6,
                            marginBottom: 6,
                          }}
                        >
                          <Text style={{ color: colors.textMuted, fontSize: font.tiny, fontWeight: '700' }}>
                            {d.nombre} · {d.ejercicios.length}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => confirmarBorrar(r)} hitSlop={10} style={{ paddingLeft: spacing(1.5), paddingTop: 2 }}>
                    <Text style={{ color: colors.textFaint, fontSize: 20, fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => setExportando(r)}
                  disabled={totalEj === 0}
                  hitSlop={8}
                  style={{
                    marginTop: spacing(1.5),
                    paddingTop: spacing(1.25),
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: totalEj === 0 ? colors.textFaint : colors.primary,
                      fontSize: font.tiny,
                      fontWeight: '800',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    {totalEj === 0 ? 'Agregá ejercicios para compartir' : 'Compartir rutina ›'}
                  </Text>
                </TouchableOpacity>
              </Tarjeta>
            );
          })}
        </View>
      )}

      <ModalTransferencia
        visible={!!exportando}
        modo="export"
        rutina={exportando}
        onCerrar={() => setExportando(null)}
      />
      <ModalTransferencia
        visible={importando}
        modo="import"
        onCerrar={() => setImportando(false)}
        onImportado={(r) => {
          guardarRutina(r);
          setImportando(false);
          navigation.navigate('ConfigurarRutina');
        }}
      />

      {/* Confirmación de borrado (Alert.alert no funciona en web) */}
      <Modal visible={!!porBorrar} transparent animationType="fade" onRequestClose={() => setPorBorrar(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
          <View
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: colors.borderHi,
              padding: spacing(2),
            }}
          >
            <Eyebrow style={{ color: colors.danger }}>Eliminar rutina</Eyebrow>
            <Txt style={{ ...type.h3, marginTop: 6 }} numberOfLines={2}>
              {porBorrar?.nombre}
            </Txt>
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1), lineHeight: 20 }}>
              Se perderá su configuración. Esta acción no se puede deshacer.
            </Txt>
            <View style={{ flexDirection: 'row', marginTop: spacing(2.25), gap: spacing(1) as any }}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cancelar" variante="secondary" onPress={() => setPorBorrar(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Boton
                  titulo="Eliminar"
                  variante="danger"
                  onPress={() => {
                    if (porBorrar) eliminarRutina(porBorrar.id);
                    setPorBorrar(null);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
