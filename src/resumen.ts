// Resumen compartible de un usuario para las Crews: por cada ejercicio que tiene en
// alguna rutina, su mejor peso (máximo histórico). Es lo ÚNICO que ven los compañeros
// de crew — no se expone el historial ni la rutina completa.
import type { EstadoApp } from './types';

export type ResumenItem = {
  key: string; // identidad del ejercicio para comparar entre usuarios
  nombre: string; // nombre para mostrar
  mejorPeso: number | null; // kg máximos registrados (null si nunca cargó peso)
  equipo: string | null;
};

const norm = (s: string) => s.trim().toLowerCase();

// Identidad estable: ejercicios de catálogo por id, libres por nombre normalizado.
export function claveEjercicioResumen(ejercicioId: string | null, nombre: string): string {
  return ejercicioId ? `cat:${ejercicioId}` : `libre:${norm(nombre)}`;
}

export function computarResumen(estado: EstadoApp): ResumenItem[] {
  const map = new Map<string, ResumenItem>();
  for (const r of estado.rutinas) {
    for (const d of r.dias) {
      for (const ej of d.ejercicios) {
        const key = claveEjercicioResumen(ej.ejercicioId, ej.nombre);
        let item = map.get(key);
        if (!item) {
          item = { key, nombre: ej.nombre, mejorPeso: null, equipo: null };
          map.set(key, item);
        }
        const clave = `${r.id}|${d.id}|${ej.uid}`;
        for (const reg of estado.historial[clave] || []) {
          if (reg.equipo !== 'peso corporal' && Number.isFinite(reg.peso) && reg.peso > 0) {
            if (item.mejorPeso == null || reg.peso > item.mejorPeso) {
              item.mejorPeso = reg.peso;
              item.equipo = reg.equipo;
            }
          }
        }
      }
    }
  }
  return Array.from(map.values());
}
