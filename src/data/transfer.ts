// Exportar / importar rutinas como un código compartible ("cifrado" sin clave).
//
// Formato del código:  SHMB1.<base64url>.<crc>
//   - payload = pseudo-JSON compacto con nombre, días y ejercicios (series/reps).
//   - se serializa, se ofusca con XOR de clave fija (no hace falta contraseña),
//     se codifica en base64url y se le agrega un checksum para detectar pegados rotos.
// Todo es local y determinístico: el mismo código siempre reconstruye la misma rutina.

import type { Rutina, DiaRutina, EjercicioRutina } from '../types';
import { uid } from '../utils';

const PREFIJO = 'SHMB1';
// Clave de ofuscación fija (no es seguridad real: solo evita que el código sea texto plano).
const CLAVE_XOR = 'shimbro-hierro-2026';

// ---- Pseudo-JSON compacto ----
type PItem = { n: string; c: string | null; s: number; r: string; m?: string; l?: 1 };
type PDia = { n: string; e: PItem[] };
type Payload = { v: 1; n: string; d: PDia[] };

// ---- UTF-8 <-> bytes (manual, sin depender de TextEncoder) ----
function utf8ABytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c >= 0xd800 && c <= 0xdbff) {
      const c2 = str.charCodeAt(++i);
      const cp = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
      out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return out;
}

function bytesAUtf8(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; ) {
    const b = bytes[i++];
    if (b < 0x80) out += String.fromCharCode(b);
    else if (b < 0xe0) {
      const b2 = bytes[i++];
      out += String.fromCharCode(((b & 0x1f) << 6) | (b2 & 0x3f));
    } else if (b < 0xf0) {
      const b2 = bytes[i++], b3 = bytes[i++];
      out += String.fromCharCode(((b & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
    } else {
      const b2 = bytes[i++], b3 = bytes[i++], b4 = bytes[i++];
      let cp = ((b & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
    }
  }
  return out;
}

// ---- base64url ----
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function bytesAB64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? '' : B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? '' : B64[b2 & 63];
  }
  return out;
}
function b64ABytes(s: string): number[] {
  const idx = (ch: string) => B64.indexOf(ch);
  const out: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    const c0 = idx(s[i]), c1 = idx(s[i + 1]);
    const c2 = i + 2 < s.length ? idx(s[i + 2]) : -1;
    const c3 = i + 3 < s.length ? idx(s[i + 3]) : -1;
    if (c0 < 0 || c1 < 0) throw new Error('base64 inválido');
    out.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) out.push(((c1 & 15) << 4) | (c2 >> 2));
    if (c3 >= 0) out.push(((c2 & 3) << 6) | c3);
  }
  return out;
}

// ---- XOR de clave repetida ----
function xor(bytes: number[]): number[] {
  const k = utf8ABytes(CLAVE_XOR);
  return bytes.map((b, i) => b ^ k[i % k.length]);
}

// ---- checksum simple (4 hex) ----
function crc(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i) * (i + 1)) & 0xffff;
  return h.toString(16).toUpperCase().padStart(4, '0');
}

// ---- API pública ----

export function exportarRutina(r: Rutina): string {
  const payload: Payload = {
    v: 1,
    n: r.nombre,
    d: r.dias.map((d) => ({
      n: d.nombre,
      e: d.ejercicios.map((ej) => {
        const it: PItem = { n: ej.nombre, c: ej.ejercicioId, s: ej.series, r: ej.reps };
        if (ej.musculo) it.m = ej.musculo;
        if (ej.esLibre) it.l = 1;
        return it;
      }),
    })),
  };
  const json = JSON.stringify(payload);
  const b64 = bytesAB64(xor(utf8ABytes(json)));
  return `${PREFIJO}.${b64}.${crc(b64)}`;
}

// Resumen liviano para la vista previa antes de confirmar el import.
export type ResumenImport = { nombre: string; dias: number; ejercicios: number };

function parsePayload(codigo: string): Payload {
  const limpio = codigo.trim().replace(/\s+/g, '');
  const partes = limpio.split('.');
  if (partes.length !== 3 || partes[0] !== PREFIJO) {
    throw new Error('El código no tiene el formato de Shimbro.');
  }
  const [, b64, chk] = partes;
  if (crc(b64) !== chk.toUpperCase()) {
    throw new Error('El código está incompleto o mal copiado.');
  }
  let payload: any;
  try {
    payload = JSON.parse(bytesAUtf8(xor(b64ABytes(b64))));
  } catch {
    throw new Error('No se pudo leer el código.');
  }
  if (!payload || payload.v !== 1 || typeof payload.n !== 'string' || !Array.isArray(payload.d)) {
    throw new Error('El código no es una rutina válida.');
  }
  return payload as Payload;
}

export function resumenImport(codigo: string): ResumenImport {
  const p = parsePayload(codigo);
  return {
    nombre: p.n,
    dias: p.d.length,
    ejercicios: p.d.reduce((a, d) => a + (Array.isArray(d.e) ? d.e.length : 0), 0),
  };
}

// Reconstruye una Rutina nueva (ids frescos) a partir del código.
export function importarRutina(codigo: string): Rutina {
  const p = parsePayload(codigo);
  const dias: DiaRutina[] = p.d.map((d, i) => ({
    id: uid('d_'),
    nombre: typeof d.n === 'string' && d.n ? d.n : `Día ${i + 1}`,
    ejercicios: (Array.isArray(d.e) ? d.e : []).map((it): EjercicioRutina => ({
      uid: uid('e_'),
      ejercicioId: typeof it.c === 'string' ? it.c : null,
      nombre: String(it.n ?? 'Ejercicio'),
      esLibre: it.l === 1,
      series: Number(it.s) > 0 ? Number(it.s) : 3,
      reps: String(it.r ?? ''),
      musculo: it.m,
    })),
  }));
  return {
    id: uid('rt_'),
    nombre: p.n || 'Rutina importada',
    dias: dias.length ? dias : [{ id: uid('d_'), nombre: 'Día 1', ejercicios: [] }],
    creadaEn: Date.now(),
  };
}
