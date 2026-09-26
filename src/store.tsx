import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  EstadoApp,
  Rutina,
  RegistroPeso,
  SesionCompletada,
  TipoEquipo,
} from './types';

const CLAVE = 'shimbro:estado:v1';

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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoApp>(ESTADO_INICIAL);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CLAVE);
        if (raw) setEstado({ ...ESTADO_INICIAL, ...JSON.parse(raw) });
      } catch (e) {
        console.warn('No se pudo cargar el estado', e);
      } finally {
        setCargado(true);
      }
    })();
  }, []);

  const persistir = useCallback((next: EstadoApp) => {
    setEstado(next);
    AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch((e) =>
      console.warn('No se pudo guardar', e)
    );
  }, []);

  const guardarRutina = useCallback(
    (r: Rutina) => {
      setEstado((prev) => {
        const existe = prev.rutinas.some((x) => x.id === r.id);
        const rutinas = existe
          ? prev.rutinas.map((x) => (x.id === r.id ? r : x))
          : [...prev.rutinas, r];
        const next = {
          ...prev,
          rutinas,
          rutinaActivaId: prev.rutinaActivaId || r.id,
        };
        AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const eliminarRutina = useCallback((id: string) => {
    setEstado((prev) => {
      const rutinas = prev.rutinas.filter((x) => x.id !== id);
      const next = {
        ...prev,
        rutinas,
        rutinaActivaId:
          prev.rutinaActivaId === id ? (rutinas[0]?.id ?? null) : prev.rutinaActivaId,
        sesiones: prev.sesiones.filter((s) => s.rutinaId !== id),
      };
      AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const setRutinaActiva = useCallback((id: string) => {
    setEstado((prev) => {
      const next = { ...prev, rutinaActivaId: id };
      AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

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

  const registrar = useCallback((clave: string, reg: RegistroPeso) => {
    setEstado((prev) => {
      const lista = prev.historial[clave] ? [...prev.historial[clave]] : [];
      lista.push(reg);
      const next = { ...prev, historial: { ...prev.historial, [clave]: lista } };
      AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const completarSesion = useCallback((rutinaId: string, diaId: string) => {
    setEstado((prev) => {
      const sesion: SesionCompletada = { rutinaId, diaId, fecha: Date.now() };
      const next = { ...prev, sesiones: [...prev.sesiones, sesion] };
      AsyncStorage.setItem(CLAVE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

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
