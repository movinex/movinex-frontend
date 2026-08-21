export function formatoMoneda(valor: number): string {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
}

/** Versión compacta para celdas angostas: $54K, $1.2M. Sin decimales bajo mil. */
export function formatoMonedaCorta(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `$${(valor / 1_000_000).toLocaleString('es-MX', { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `$${Math.round(valor / 1_000)}K`;
  return formatoMoneda(valor);
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
