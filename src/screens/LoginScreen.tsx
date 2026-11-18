import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, type } from '../theme';
import { Txt, Eyebrow } from '../components/ui';
import { useAuth } from '../auth';

const LOGO = require('../../assets/android-icon-foreground.png');

// Muro de entrada: sin sesión no se usa la app (en web).
export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { iniciarConGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [entrando, setEntrando] = useState(false);

  const entrar = async () => {
    setError(null);
    setEntrando(true);
    const err = await iniciarConGoogle(); // en web redirige; si falla devuelve el motivo
    if (err) {
      setError(err);
      setEntrando(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Contenido centrado */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(3) }}>
        <View style={{ width: '100%', maxWidth: 360, alignItems: 'center' }}>
          <Image source={LOGO} resizeMode="contain" style={{ width: 128, height: 128, marginBottom: spacing(0.5) }} />

          <Eyebrow style={{ textAlign: 'center' }}>Registro de fuerza</Eyebrow>
          <Text style={{ ...type.display, fontSize: 46, marginTop: spacing(1), textTransform: 'uppercase', textAlign: 'center' }}>Shimbro</Text>
          <View style={{ height: 4, width: 56, backgroundColor: colors.primary, marginTop: spacing(1.5) }} />
          <Txt style={{ alignSelf: 'stretch', color: colors.textMuted, fontSize: font.body, marginTop: spacing(2), lineHeight: 21, textAlign: 'center' }}>
            Entrá para registrar tu fuerza y llevar tu progreso en cualquier dispositivo.
          </Txt>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={entrar}
            disabled={entrando}
            style={{
              alignSelf: 'stretch',
              marginTop: spacing(3.5),
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderHi,
              borderRadius: radius.md,
              paddingVertical: spacing(1.85),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: entrando ? 0.5 : 1,
            }}
          >
            <Text style={{ ...type.num, color: colors.primary, fontSize: font.h3, marginRight: 10 }}>G</Text>
            <Text style={{ color: colors.text, fontSize: font.body, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' }}>
              {entrando ? 'Abriendo…' : 'Entrar con Google'}
            </Text>
          </TouchableOpacity>

          {error ? (
            <Txt style={{ alignSelf: 'stretch', color: colors.danger, fontSize: font.small, marginTop: spacing(1.5), textAlign: 'center' }}>{error}</Txt>
          ) : null}

          <Txt style={{ alignSelf: 'stretch', color: colors.textFaint, fontSize: font.tiny, marginTop: spacing(3), lineHeight: 17, textAlign: 'center' }}>
            Usamos tu cuenta de Google solo para identificarte y guardar tus datos. Nada se comparte.
          </Txt>
        </View>
      </View>

      {/* Firma al pie */}
      <View style={{ alignItems: 'center', paddingBottom: spacing(2), paddingTop: spacing(1) }}>
        <Text
          style={{
            color: colors.textFaint,
            fontSize: font.tiny,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            fontWeight: '700',
          }}
        >
          Made by Cyrus Crow
        </Text>
      </View>
    </View>
  );
}
