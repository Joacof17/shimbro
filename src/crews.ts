// Acceso a datos de Crews y perfil (apodo + resumen) sobre Supabase.
import { supabase } from './lib/supabase';
import type { ResumenItem } from './resumen';

export type Crew = {
  id: string;
  codigo: string;
  nombre: string | null;
  creado_por: string | null;
  created_at: string;
};

export type PerfilCrew = {
  user_id: string;
  apodo: string | null;
  resumen: ResumenItem[];
};

// ----- Perfil / apodo -----
export async function leerApodo(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('perfil').select('apodo').eq('user_id', userId).maybeSingle();
  return (data?.apodo as string | null) ?? null;
}

export async function guardarApodo(userId: string, apodo: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('perfil').upsert({ user_id: userId, apodo: apodo.trim() || null });
}

// Publica el resumen compartible (se llama al sincronizar el estado).
export async function publicarResumen(userId: string, resumen: ResumenItem[]): Promise<void> {
  if (!supabase) return;
  await supabase.from('perfil').upsert({ user_id: userId, resumen });
}

// ----- Crews -----
export async function crearCrew(nombre: string): Promise<Crew> {
  if (!supabase) throw new Error('No disponible');
  const { data, error } = await supabase.rpc('crear_crew', { p_nombre: nombre });
  if (error) throw new Error(error.message);
  return data as Crew;
}

export async function unirseACrew(codigo: string): Promise<Crew> {
  if (!supabase) throw new Error('No disponible');
  const { data, error } = await supabase.rpc('unirse_a_crew', { p_codigo: codigo });
  if (error) throw new Error(/inv[áa]lid/i.test(error.message) ? 'Código inválido' : error.message);
  return data as Crew;
}

export async function getCrew(crewId: string): Promise<Crew | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('crews').select('*').eq('id', crewId).maybeSingle();
  return (data as Crew) ?? null;
}

export async function misCrews(): Promise<Crew[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('crews').select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as Crew[]) || [];
}

export async function salirDeCrew(crewId: string, userId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('crew_miembros').delete().eq('crew_id', crewId).eq('user_id', userId);
}

// Trae perfiles (apodo + resumen) de todos los miembros de una crew.
export async function perfilesDeCrew(crewId: string): Promise<PerfilCrew[]> {
  if (!supabase) return [];
  const { data: miembros, error: e1 } = await supabase
    .from('crew_miembros')
    .select('user_id')
    .eq('crew_id', crewId);
  if (e1) throw new Error(e1.message);
  const ids = (miembros || []).map((m: any) => m.user_id);
  if (!ids.length) return [];
  const { data: perfiles, error: e2 } = await supabase
    .from('perfil')
    .select('user_id, apodo, resumen')
    .in('user_id', ids);
  if (e2) throw new Error(e2.message);
  // Asegurar una entrada por miembro aunque no tenga perfil todavía.
  const porId = new Map<string, PerfilCrew>();
  for (const p of (perfiles as any[]) || []) {
    porId.set(p.user_id, { user_id: p.user_id, apodo: p.apodo ?? null, resumen: (p.resumen as ResumenItem[]) || [] });
  }
  return ids.map((id) => porId.get(id) ?? { user_id: id, apodo: null, resumen: [] });
}

// ----- Tablero comparativo -----
export type FilaRanking = { apodo: string; userId: string; peso: number | null };
export type EjercicioTablero = { key: string; nombre: string; filas: FilaRanking[] };

const etiqueta = (p: PerfilCrew) => (p.apodo && p.apodo.trim() ? p.apodo.trim() : 'Sin apodo');

// Arma el tablero: ejercicios que tienen en su rutina 2+ miembros, rankeados por mejor peso.
export function construirTablero(perfiles: PerfilCrew[]): EjercicioTablero[] {
  const porKey = new Map<string, { nombre: string; filas: FilaRanking[] }>();
  for (const p of perfiles) {
    for (const item of p.resumen || []) {
      let g = porKey.get(item.key);
      if (!g) {
        g = { nombre: item.nombre, filas: [] };
        porKey.set(item.key, g);
      }
      g.filas.push({ apodo: etiqueta(p), userId: p.user_id, peso: item.mejorPeso });
    }
  }
  const salida: EjercicioTablero[] = [];
  for (const [key, g] of porKey) {
    if (g.filas.length < 2) continue; // solo ejercicios compartidos por 2+ miembros
    g.filas.sort((a, b) => {
      if (a.peso == null && b.peso == null) return 0;
      if (a.peso == null) return 1; // sin peso va al final
      if (b.peso == null) return -1;
      return b.peso - a.peso;
    });
    salida.push({ key, nombre: g.nombre, filas: g.filas });
  }
  // Ordenar el tablero por nombre de ejercicio.
  salida.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return salida;
}
