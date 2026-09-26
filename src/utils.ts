// Genera un id único simple (suficiente para uso local).
export function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  );
}

// Formatea una fecha relativa en español (ej: "hace 3 días").
export function haceCuanto(ts: number): string {
  const diff = Date.now() - ts;
  const dias = Math.floor(diff / 86400000);
  if (dias <= 0) {
    const horas = Math.floor(diff / 3600000);
    if (horas <= 0) return 'hoy';
    return `hace ${horas} h`;
  }
  if (dias === 1) return 'ayer';
  if (dias < 7) return `hace ${dias} días`;
  const semanas = Math.floor(dias / 7);
  if (semanas === 1) return 'hace 1 semana';
  if (semanas < 5) return `hace ${semanas} semanas`;
  const meses = Math.floor(dias / 30);
  return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
