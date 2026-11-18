import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EstadoApp,
  Rutina,
  RegistroPeso,
  SesionCompletada,
  TipoEquipo,
} from './types';
import { supabase } from './lib/supabase';
import { useAuth } from './auth';
import { computarResumen } from './resumen';
import { publicarResumen } from './crews';

const CLAVE = 'shimbro:estado:v1'; // blob local anónimo (no se toca al loguearse)
const cacheUsuario = (uid: string) => `shimbro:estado:u:${uid}`; // caché offline del usuario

const ESTADO_INICIAL: EstadoApp = {
  rutinas: [],
  rutinaActivaId: null,
  historial: {},
  sesiones: [],
};

type Ctx = {
  cargado: boolean;
  estado: EstadoApp;
  guardarRutina: (r: Rutina) => void;
  eliminarRutina: (id: string) => void;
  setRutinaActiva: (id: string) => void;
  claveEjercicio: (rutinaId: string, diaId: string, ejUid: string) => string;
  ultimoRegistro: (clave: string) => RegistroPeso | undefined;
  registrar: (clave: string, reg: RegistroPeso) => void;
  completarSesion: (rutinaId: string, diaId: string) => void;
  diasCompletadosEstaSemana: (rutinaId: string) => string[];
};

const StoreContext = createContext<Ctx | null>(null);

// Lunes 00:00 de la semana actual.
export function inicioSemana(d = new Date()): number {
  const x = new Date(d);
  const dia = (x.getDay() + 6) % 7; // 0 = lunes
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - dia);
  return x.getTime();
}

function parse(raw: string | null): EstadoApp | null {
  if (!raw) return null;
  try {
    return { ...ESTADO_INICIAL, ...(JSON.parse(raw) as EstadoApp) };
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, cargando: authCargando } = useAuth();
  const userId = user?.id ?? null;

  const [estado, setEstado] = useState<EstadoApp>(ESTADO_INICIAL);
  const [cargado, setCargado] = useState(false);

  // userId actual accesible desde callbacks estables (sin recrearlos).
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Debounce de la escritura a la nube.
  const cloudTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendiente = useRef<EstadoApp | null>(null);

  const subirNube = useCallback((uid: string, next: EstadoApp) => {
    pendiente.current = next;
    if (cloudTimer.current) clearTimeout(cloudTimer.current);
    cloudTimer.current = setTimeout(() => {
      const e = pendiente.current;
      if (!e || !supabase) return;
      supabase
        .from('estado_usuario')
        .upsert({ user_id: uid, estado: e })
        .then(({ error }) => {
          if (error) console.warn('No se pudo sincronizar', error.message);
        });
      // Publicar el resumen compartible para las crews (mejor esfuerzo).
      publicarResumen(uid, computarResumen(e)).catch(() => {});
    }, 800);
  }, []);

  // Persiste según el modo actual: nube (+ caché local) si hay usuario, o local anónimo.
  const persistir = useCallback(
    (next: EstadoApp) => {
      const uid = userIdRef.current;
      if (uid && supabase) {
        AsyncStorage.setItem(cacheUsuario(uid), JSON.stringify(next)).catch(() => {});
        subirNube(uid, next);
      } else {
        AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
      }
    },
    [subirNube]
  );

  // Carga el dataset correcto cuando se resuelve la auth o cambia el usuario.
  useEffect(() => {
    if (authCargando) return; // esperar a que la sesión se resuelva
    let vivo = true;
    setCargado(false);
    (async () => {
      if (userId && supabase) {
        const { data, error } = await supabase
          .from('estado_usuario')
          .select('estado')
          .eq('user_id', userId)
          .maybeSingle();
        if (!vivo) return;
        if (data?.estado) {
          setEstado({ ...ESTADO_INICIAL, ...(data.estado as EstadoApp) });
        } else {
          // Sin fila todavía: usar caché local del usuario (si hay) y crear la fila.
          const cache = parse(await AsyncStorage.getItem(cacheUsuario(userId)).catch(() => null));
          const e = cache ?? ESTADO_INICIAL;
          if (!vivo) return;
          setEstado(e);
          if (!error) supabase.from('estado_usuario').upsert({ user_id: userId, estado: e }).then(() => {});
        }
      } else {
        const local = parse(await AsyncStorage.getItem(CLAVE).catch(() => null));
        if (!vivo) return;
        setEstado(local ?? ESTADO_INICIAL);
      }
      if (vivo) setCargado(true);
    })();
    return () => {
      vivo = false;
    };
  }, [userId, authCargando]);

  // Aplica una transformación al estado y lo persiste.
  const aplicar = useCallback(
    (fn: (prev: EstadoApp) => EstadoApp) => {
      setEstado((prev) => {
        const next = fn(prev);
        persistir(next);
        return next;
      });
    },
    [persistir]
  );

  const guardarRutina = useCallback(
    (r: Rutina) => {
      aplicar((prev) => {
        const existe = prev.rutinas.some((x) => x.id === r.id);
        const rutinas = existe
          ? prev.rutinas.map((x) => (x.id === r.id ? r : x))
          : [...prev.rutinas, r];
        return { ...prev, rutinas, rutinaActivaId: prev.rutinaActivaId || r.id };
      });
    },
    [aplicar]
  );

  const eliminarRutina = useCallback(
    (id: string) => {
      aplicar((prev) => {
        const rutinas = prev.rutinas.filter((x) => x.id !== id);
        return {
          ...prev,
          rutinas,
          rutinaActivaId:
            prev.rutinaActivaId === id ? (rutinas[0]?.id ?? null) : prev.rutinaActivaId,
          sesiones: prev.sesiones.filter((s) => s.rutinaId !== id),
        };
      });
    },
    [aplicar]
  );

  const setRutinaActiva = useCallback(
    (id: string) => {
      aplicar((prev) => ({ ...prev, rutinaActivaId: id }));
    },
    [aplicar]
  );

  const claveEjercicio = useCallback(
    (rutinaId: string, diaId: string, ejUid: string) => `${rutinaId}|${diaId}|${ejUid}`,
    []
  );

  const ultimoRegistro = useCallback(
    (clave: string) => {
      const lista = estado.historial[clave];
      if (!lista || !lista.length) return undefined;
      return lista[lista.length - 1];
    },
    [estado.historial]
  );

  const registrar = useCallback(
    (clave: string, reg: RegistroPeso) => {
      aplicar((prev) => {
        const lista = prev.historial[clave] ? [...prev.historial[clave], reg] : [reg];
        return { ...prev, historial: { ...prev.historial, [clave]: lista } };
      });
    },
    [aplicar]
  );

  const completarSesion = useCallback(
    (rutinaId: string, diaId: string) => {
      const sesion: SesionCompletada = { rutinaId, diaId, fecha: Date.now() };
      aplicar((prev) => ({ ...prev, sesiones: [...prev.sesiones, sesion] }));
    },
    [aplicar]
  );

  const diasCompletadosEstaSemana = useCallback(
    (rutinaId: string) => {
      const desde = inicioSemana();
      const ids = estado.sesiones
        .filter((s) => s.rutinaId === rutinaId && s.fecha >= desde)
        .map((s) => s.diaId);
      return Array.from(new Set(ids));
    },
    [estado.sesiones]
  );

  const value: Ctx = {
    cargado,
    estado,
    guardarRutina,
    eliminarRutina,
    setRutinaActiva,
    claveEjercicio,
    ultimoRegistro,
    registrar,
    completarSesion,
    diasCompletadosEstaSemana,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}

export const EQUIPOS: TipoEquipo[] = ['mancuerna', 'barra', 'peso corporal'];
