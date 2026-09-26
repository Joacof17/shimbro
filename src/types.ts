// Tipos del dominio.

// Un ejercicio del catálogo (traducido).
export type Ejercicio = {
  id: string;
  nombre: string;
  nombreOriginal: string;
  fuerza: string | null;
  nivel: string;
  mecanica: string | null;
  equipo: string;
  equipoClave: string;
  musculosPrimarios: string[];
  musculosSecundarios: string[];
  musculosPrimariosClave: string[];
  instrucciones: string[];
  categoria: string;
  categoriaClave: string;
  imagenes: string[];
};

// Tipo de equipo que el usuario elige al ejecutar (los tres pedidos).
export type TipoEquipo = 'mancuerna' | 'barra' | 'peso corporal';

// Un ejercicio dentro de una rutina configurada.
export type EjercicioRutina = {
  uid: string; // id único dentro de la rutina
  ejercicioId: string | null; // id del catálogo, o null si es libre
  nombre: string; // nombre a mostrar
  esLibre: boolean; // ejercicio inventado por el usuario
  series: number;
  reps: string; // texto libre, ej "8-12"
  musculo?: string; // para agrupar/mostrar
};

// Un día de la rutina.
export type DiaRutina = {
  id: string;
  nombre: string;
  ejercicios: EjercicioRutina[];
};

// La rutina completa.
export type Rutina = {
  id: string;
  nombre: string;
  dias: DiaRutina[];
  creadaEn: number;
};

// Registro de una serie/ejercicio realizado.
export type RegistroPeso = {
  fecha: number; // timestamp
  peso: number;
  equipo: TipoEquipo;
  reps?: string;
  series?: number;
};

// Historial por ejercicio (clave: rutinaId + diaId + ejercicioUid).
export type HistorialEjercicio = {
  [claveEjercicio: string]: RegistroPeso[];
};

// Sesión completada (para marcar días hechos por semana).
export type SesionCompletada = {
  rutinaId: string;
  diaId: string;
  fecha: number;
};

export type EstadoApp = {
  rutinas: Rutina[];
  rutinaActivaId: string | null;
  historial: HistorialEjercicio;
  sesiones: SesionCompletada[];
};
