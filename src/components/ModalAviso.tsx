import React from 'react';
import { View, Text, Modal } from 'react-native';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow, Boton } from './ui';

// Modal simple de aviso/resultado (reemplaza Alert.alert, que no funciona en web).
// Un solo botón que ejecuta onAceptar.
export function ModalAviso({
  visible,
  titulo,
  mensaje,
  textoBoton = 'Aceptar',
  onAceptar,
}: {
  visible: boolean;
  titulo: string;
  mensaje?: string;
  textoBoton?: string;
  onAceptar: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAceptar}>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.bg, fontWeight: '900', fontSize: 13 }}>✓</Text>
            </View>
            <Eyebrow style={{ marginLeft: spacing(1), color: colors.success }}>{titulo}</Eyebrow>
          </View>
          {mensaje ? (
            <Txt style={{ color: colors.textMuted, fontSize: font.small, marginTop: spacing(1.5), lineHeight: 20 }}>{mensaje}</Txt>
          ) : null}
          <Boton titulo={textoBoton} onPress={onAceptar} style={{ marginTop: spacing(2) }} />
        </View>
      </View>
    </Modal>
  );
}
