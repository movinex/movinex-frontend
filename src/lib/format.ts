export function formatoMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

export function formatoMonedaCentavos(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export function formatoPorcentaje(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Convierte un <input type="date"> (YYYY-MM-DD) a Date a mediodía UTC, sin desfases. */
export function fechaDesdeInput(valor: string): Date {
  const [anio, mes, dia] = valor.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0));
}

/** Convierte una Date a formato para <input type="date">. */
export function fechaParaInput(valor: Date | string): string {
  return new Date(valor).toISOString().slice(0, 10);
}

export function formatoFecha(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatoFechaHora(fecha: string | Date): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
