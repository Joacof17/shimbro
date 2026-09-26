import React from 'react';
import {
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, font, type } from '../theme';

export function Txt(props: TextProps & { style?: any }) {
  return <Text {...props} style={[{ color: colors.text }, props.style]} />;
}

// Eyebrow: etiqueta estructural en versalitas tracked.
export function Eyebrow({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[type.eyebrow, style]}>{children}</Text>;
}

export function Tarjeta({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}) {
  const contenido = <View style={[styles.card, style]}>{children}</View>;
  if (onPress)
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        {contenido}
      </TouchableOpacity>
    );
  return contenido;
}

export function Boton({
  titulo,
  onPress,
  variante = 'primary',
  disabled,
  chico,
  style,
}: {
  titulo: string;
  onPress: () => void;
  variante?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  chico?: boolean;
  style?: ViewStyle;
}) {
  const fondo =
    variante === 'primary'
      ? colors.primary
      : variante === 'danger'
      ? colors.surface2
      : variante === 'secondary'
      ? colors.surface2
      : 'transparent';
  const borde =
    variante === 'ghost'
      ? colors.borderHi
      : variante === 'danger'
      ? colors.danger
      : variante === 'secondary'
      ? colors.border
      : 'transparent';
  const colorTexto =
    variante === 'primary'
      ? '#0B0C0F'
      : variante === 'danger'
      ? colors.danger
      : colors.text;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: fondo,
          borderColor: borde,
          borderWidth: variante === 'primary' ? 0 : 1,
          paddingVertical: chico ? spacing(1.1) : spacing(1.85),
          paddingHorizontal: spacing(2.5),
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.35 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: colorTexto,
          fontWeight: '900',
          fontSize: chico ? font.small : font.body,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

export function Chip({
  texto,
  activo,
  onPress,
  color,
}: {
  texto: string;
  activo?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={{
        backgroundColor: activo ? color || colors.primary : colors.surface2,
        borderWidth: 1,
        borderColor: activo ? color || colors.primary : colors.border,
        paddingVertical: spacing(0.85),
        paddingHorizontal: spacing(1.6),
        borderRadius: radius.sm,
        marginRight: spacing(1),
        marginBottom: spacing(1),
      }}
    >
      <Text
        style={{
          color: activo ? '#0B0C0F' : colors.textMuted,
          fontSize: font.small,
          fontWeight: '800',
          letterSpacing: 0.3,
        }}
      >
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

export function Cargando({ texto }: { texto?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.primary} size="large" />
      {texto ? <Txt style={{ color: colors.textMuted, marginTop: spacing(2) }}>{texto}</Txt> : null}
    </View>
  );
}

// Vacío: sin emoji gigante. Barra ember + eyebrow + titular pesado.
export function Vacio({ titulo, sub }: { emoji?: string; titulo: string; sub?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: spacing(3), paddingVertical: spacing(2) }}>
      <View style={{ width: 44, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginBottom: spacing(2.5) }} />
      <Text style={{ ...type.h2, textAlign: 'center' }}>{titulo}</Text>
      {sub ? (
        <Txt style={{ color: colors.textMuted, textAlign: 'center', marginTop: spacing(1.25), lineHeight: 21 }}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
});
