import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from '../components/ui';
import { ejercicioPorId, urlImagen, etiquetaMusculo } from '../data/catalogo';

type Props = NativeStackScreenProps<RootStackParamList, 'EjercicioDetalle'>;

export default function EjercicioDetalleScreen({ route }: Props) {
  const { ejercicioId } = route.params;
  const ej = ejercicioPorId(ejercicioId);
  const [visorIndex, setVisorIndex] = useState<number | null>(null);

  if (!ej) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ color: colors.textMuted }}>Ejercicio no encontrado.</Txt>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: spacing(6) }}>
      <View style={{ padding: spacing(2) }}>
        <Text style={{ ...type.h2, textTransform: 'uppercase' }}>{ej.nombre}</Text>
        <Txt style={{ color: colors.textFaint, fontSize: font.small, marginTop: 3 }}>{ej.nombreOriginal}</Txt>

        {/* Chips de metadatos */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(1.75) }}>
          <Meta texto={ej.equipo} />
          <Meta texto={ej.nivel} />
          <Meta texto={ej.categoria} />
          {ej.fuerza ? <Meta texto={ej.fuerza} /> : null}
          {ej.mecanica ? <Meta texto={ej.mecanica} /> : null}
        </View>

        {/* Músculos */}
        <Seccion titulo="Músculos primarios" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {ej.musculosPrimariosClave.map((m) => (
            <Pill key={m} texto={etiquetaMusculo(m)} color={colors.primary} />
          ))}
          {ej.musculosPrimariosClave.length === 0 && <Txt style={{ color: colors.textFaint }}>—</Txt>}
        </View>

        {ej.musculosSecundarios.length > 0 && (
          <>
            <Seccion titulo="Músculos secundarios" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {ej.musculosSecundarios.map((m, i) => (
                <Pill key={i} texto={m} color={colors.textFaint} />
              ))}
            </View>
          </>
        )}

        {/* Instrucciones */}
        <Seccion titulo="Instrucciones" />
        {ej.instrucciones.map((paso, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: spacing(1.5) }}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing(1.25),
                marginTop: 1,
              }}
            >
              <Text style={{ ...type.num, color: colors.primary, fontSize: font.tiny }}>{i + 1}</Text>
            </View>
            <Txt style={{ flex: 1, color: colors.text, fontSize: font.body, lineHeight: 23 }}>{paso}</Txt>
          </View>
        ))}
        {ej.instrucciones.length === 0 && <Txt style={{ color: colors.textFaint }}>Sin instrucciones.</Txt>}

        {/* Referencia visual: tomas de inicio y fin, contenidas, al final */}
        {ej.imagenes.length > 0 && (
          <>
            <Seccion titulo="Referencia" />
            <View style={{ flexDirection: 'row', gap: spacing(1) as any }}>
              {ej.imagenes.slice(0, 2).map((img, i) => (
                <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => setVisorIndex(i)} style={{ flex: 1 }}>
                  <Image
                    source={{ uri: urlImagen(img) }}
                    style={{
                      width: '100%',
                      aspectRatio: 850 / 567,
                      borderRadius: radius.md,
                      backgroundColor: colors.surface2,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                    resizeMode="cover"
                  />
                  <Eyebrow style={{ fontSize: 10, marginTop: spacing(0.75), textAlign: 'center' }}>
                    {ej.imagenes.length > 1 ? (i === 0 ? 'Inicio' : 'Fin') : 'Posición'}
                  </Eyebrow>
                </TouchableOpacity>
              ))}
            </View>
            <Txt style={{ color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(1), textAlign: 'center' }}>
              Tocá una imagen para ampliarla
            </Txt>
          </>
        )}
      </View>

      {visorIndex !== null && (
        <VisorImagenes
          imagenes={ej.imagenes.map(urlImagen)}
          indiceInicial={visorIndex}
          onCerrar={() => setVisorIndex(null)}
        />
      )}
    </ScrollView>
  );
}

// Visor a pantalla completa con paginado horizontal (deslizar entre tomas).
function VisorImagenes({
  imagenes,
  indiceInicial,
  onCerrar,
}: {
  imagenes: string[];
  indiceInicial: number;
  onCerrar: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [ancho, setAncho] = useState(Dimensions.get('window').width);
  const [pagina, setPagina] = useState(indiceInicial);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCerrar} statusBarTranslucent>
      <View
        style={{ flex: 1, backgroundColor: '#000000F2' }}
        onLayout={(e) => setAncho(e.nativeEvent.layout.width)}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentOffset={{ x: indiceInicial * ancho, y: 0 }}
          onMomentumScrollEnd={(e) => setPagina(Math.round(e.nativeEvent.contentOffset.x / ancho))}
          style={{ flex: 1 }}
        >
          {imagenes.map((uri, i) => (
            <View key={i} style={{ width: ancho, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={{ uri }} style={{ width: ancho, height: '100%' }} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>

        {/* Etiqueta inicio/fin */}
        {imagenes.length > 1 && (
          <View style={{ position: 'absolute', bottom: insets.bottom + spacing(3), alignSelf: 'center', alignItems: 'center' }}>
            <Eyebrow style={{ color: '#fff' }}>{pagina === 0 ? 'Inicio' : 'Fin'}</Eyebrow>
            <View style={{ flexDirection: 'row', gap: 8 as any, marginTop: spacing(1) }}>
              {imagenes.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === pagina ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === pagina ? colors.primary : '#FFFFFF55',
                  }}
                />
              ))}
            </View>
          </View>
        )}

        {/* Cerrar */}
        <TouchableOpacity
          onPress={onCerrar}
          hitSlop={12}
          style={{
            position: 'absolute',
            top: insets.top + spacing(1),
            right: spacing(2),
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#FFFFFF1A',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginTop: -2 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function Seccion({ titulo }: { titulo: string }) {
  return (
    <View style={{ marginTop: spacing(3), marginBottom: spacing(1.25) }}>
      <Eyebrow>{titulo}</Eyebrow>
      <View style={{ height: 2, width: 28, backgroundColor: colors.primary, marginTop: spacing(0.75) }} />
    </View>
  );
}

function Meta({ texto }: { texto: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing(1.25),
        paddingVertical: 6,
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      <Text style={{ color: colors.text, fontSize: font.tiny, fontWeight: '800', textTransform: 'capitalize', letterSpacing: 0.2 }}>
        {texto}
      </Text>
    </View>
  );
}

function Pill({ texto, color }: { texto: string; color: string }) {
  return (
    <View style={{ backgroundColor: color + '22', borderRadius: radius.pill, paddingHorizontal: spacing(1.25), paddingVertical: 5, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ color, fontSize: font.small, fontWeight: '700', textTransform: 'capitalize' }}>{texto}</Text>
    </View>
  );
}
