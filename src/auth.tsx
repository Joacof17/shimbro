// Autenticación con Supabase (login con Google en web).
// Si Supabase no está configurado (sin env), queda inerte: user = null siempre,
// y la app funciona 100% local como hasta ahora.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseConfigurado } from './lib/supabase';
import { leerApodo, guardarApodo as guardarApodoDB } from './crews';

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

// Login con Google solo tiene sentido en web (en nativo haría falta deep-linking).
const LOGIN_DISPONIBLE = supabaseConfigurado && Platform.OS === 'web';

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
    if (!supabase || Platform.OS !== 'web') return 'El login no está disponible acá.';
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return error ? error.message : null;
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
