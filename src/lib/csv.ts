/**
 * Exportación a CSV para las listas de /sadmin. Port de autovia-dashboard
 * (public/index.html, `toCSV` / `descargar`).
 */

type Celda = string | number | null | undefined;

/** Arma un CSV con BOM para que Excel en español no rompa los acentos. */
export function toCSV(filas: Celda[][]): string {
  return filas
    .map((fila) =>
      fila
        .map((celda) => {
          const texto = celda == null ? '' : String(celda);
          // Comillas dobles escapadas, y se entrecomilla si hay separador o salto.
          return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
        })
        .join(',')
    )
    .join('\n');
}

export function descargar(texto: string, nombre: string, mime = 'text/csv'): void {
  // El BOM es lo que hace que Excel abra el archivo como UTF-8 y no como ANSI.
  const blob = new Blob(['﻿' + texto], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** `movinex_creditos_2026-08-20.csv` */
export function nombreArchivo(base: string): string {
  return `movinex_${base}_${new Date().toISOString().slice(0, 10)}.csv`;
}
