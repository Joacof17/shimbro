// Autenticación con Supabase (login con Google).
// Web: redirect OAuth. Nativo: navegador del sistema + deep link de vuelta a la app.
// Si Supabase no está configurado (sin env), queda inerte: user = null siempre.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigurado } from './lib/supabase';
import { leerApodo, guardarApodo as guardarApodoDB } from './crews';

// Requerido para cerrar la sesión del AuthSession en web (inerte en nativo).
WebBrowser.maybeCompleteAuthSession();

// URL de retorno. En nativo usa el scheme (shimbro://); en web, el origin.
const redirectTo =
  Platform.OS === 'web'
    ? (typeof window !== 'undefined' ? window.location.origin : undefined)
    : makeRedirectUri();

// Crea la sesión a partir de la URL con la que vuelve el navegador.
async function sesionDesdeUrl(url: string): Promise<string | null> {
  if (!supabase) return 'El login no está disponible.';
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) return errorCode;
  const { access_token, refresh_token, code } = params;
  if (access_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return error ? error.message : null;
  }
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? error.message : null;
  }
  return 'No se recibió la sesión.';
}

type Ctx = {
  configurado: boolean; // hay proyecto Supabase + estamos en web (login disponible)
  cargando: boolean; // resolviendo la sesión inicial
  user: User | null;
  apodo: string | null;
  guardarApodo: (nuevo: string) => Promise<void>;
  iniciarConGoogle: () => Promise<string | null>; // devuelve mensaje de error, o null si OK
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

// Login disponible siempre que haya proyecto Supabase (web y nativo).
const LOGIN_DISPONIBLE = supabaseConfigurado;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(!!supabase);
  const [apodo, setApodo] = useState<string | null>(null);

  const userId = session?.user?.id ?? null;

  // Cargar el apodo cuando hay (o cambia) usuario.
  useEffect(() => {
    if (!userId) {
      setApodo(null);
      return;
    }
    let vivo = true;
    leerApodo(userId).then((a) => {
      if (vivo) setApodo(a);
    });
    return () => {
      vivo = false;
    };
  }, [userId]);

  const guardarApodo = async (nuevo: string) => {
    if (!userId) return;
    await guardarApodoDB(userId, nuevo);
    setApodo(nuevo.trim() || null);
  };

  useEffect(() => {
    if (!supabase) {
      setCargando(false);
      return;
    }
    let vivo = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return;
      setSession(data.session ?? null);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      if (vivo) setSession(s ?? null);
    });
    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const iniciarConGoogle = async (): Promise<string | null> => {
    if (!supabase) return 'El login no está disponible acá.';

    // Web: redirige la propia pestaña y vuelve con la sesión en la URL.
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      return error ? error.message : null;
    }

    // Nativo: pedimos la URL de OAuth, abrimos el navegador del sistema y, al
    // volver por el deep link (shimbro://), armamos la sesión con los tokens.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) return error.message;
    if (!data?.url) return 'No se pudo iniciar el login.';

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type === 'success') return sesionDesdeUrl(res.url);
    return null; // el usuario cerró el navegador: sin error, sin sesión
  };

  const cerrarSesion = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        configurado: LOGIN_DISPONIBLE,
        cargando,
        user: session?.user ?? null,
        apodo,
        guardarApodo,
        iniciarConGoogle,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
