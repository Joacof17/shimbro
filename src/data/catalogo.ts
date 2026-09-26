import type { Ejercicio } from '../types';
import raw from '../../assets/data/exercises.es.json';

export const EJERCICIOS = raw as unknown as Ejercicio[];

// Índice por id para búsquedas rápidas.
const porId = new Map<string, Ejercicio>();
EJERCICIOS.forEach((e) => porId.set(e.id, e));
export const ejercicioPorId = (id: string) => porId.get(id);

// URL de imagen on-demand (CDN jsDelivr sobre el repo free-exercise-db).
const CDN = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
export const urlImagen = (rutaImagen: string) => CDN + rutaImagen;
export const primeraImagen = (e: Ejercicio | undefined) =>
  e && e.imagenes && e.imagenes.length ? urlImagen(e.imagenes[0]) : undefined;

// Grupos de músculos (clave en inglés -> etiqueta en español) con orden y emoji.
export const GRUPOS_MUSCULOS: { clave: string; etiqueta: string; emoji: string }[] = [
  { clave: 'chest', etiqueta: 'Pecho', emoji: '🎯' },
  { clave: 'lats', etiqueta: 'Dorsales', emoji: '🦅' },
  { clave: 'middle back', etiqueta: 'Espalda media', emoji: '🔩' },
  { clave: 'lower back', etiqueta: 'Espalda baja', emoji: '🧲' },
  { clave: 'traps', etiqueta: 'Trapecios', emoji: '⛰️' },
  { clave: 'shoulders', etiqueta: 'Hombros', emoji: '🪖' },
  { clave: 'biceps', etiqueta: 'Bíceps', emoji: '💪' },
  { clave: 'triceps', etiqueta: 'Tríceps', emoji: '🔱' },
  { clave: 'forearms', etiqueta: 'Antebrazos', emoji: '🦾' },
  { clave: 'abdominals', etiqueta: 'Abdominales', emoji: '🧱' },
  { clave: 'quadriceps', etiqueta: 'Cuádriceps', emoji: '🦵' },
  { clave: 'hamstrings', etiqueta: 'Isquiotibiales', emoji: '🍖' },
  { clave: 'glutes', etiqueta: 'Glúteos', emoji: '🍑' },
  { clave: 'calves', etiqueta: 'Gemelos', emoji: '🦶' },
  { clave: 'adductors', etiqueta: 'Aductores', emoji: '↔️' },
  { clave: 'abductors', etiqueta: 'Abductores', emoji: '↕️' },
  { clave: 'neck', etiqueta: 'Cuello', emoji: '🧣' },
];

export const etiquetaMusculo = (clave: string) =>
  GRUPOS_MUSCULOS.find((g) => g.clave === clave)?.etiqueta || clave;

// Ejercicios que trabajan un músculo como primario.
export function ejerciciosPorMusculo(claveMusculo: string): Ejercicio[] {
  return EJERCICIOS.filter((e) => e.musculosPrimariosClave.includes(claveMusculo)).sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
  );
}

// Conteo por músculo (para mostrar en las tarjetas).
export function conteoPorMusculo(): Record<string, number> {
  const c: Record<string, number> = {};
  EJERCICIOS.forEach((e) => e.musculosPrimariosClave.forEach((m) => (c[m] = (c[m] || 0) + 1)));
  return c;
}

// Normaliza texto para búsqueda (sin acentos, minúsculas).
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

// Búsqueda por nombre (español o original en inglés).
export function buscarEjercicios(query: string, limite = 60): Ejercicio[] {
  const q = norm(query.trim());
  if (!q) return [];
  const terms = q.split(/\s+/);
  const res = EJERCICIOS.filter((e) => {
    const hay = norm(e.nombre + ' ' + e.nombreOriginal);
    return terms.every((t) => hay.includes(t));
  });
  return res.slice(0, limite);
}
