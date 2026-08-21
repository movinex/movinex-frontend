import { useCallback, useMemo, useRef, useState } from 'react';

export type Dir = 1 | -1;

export interface OpcionesOrden {
  /** Campo por el que se ordena al abrir la vista. */
  inicial: string;
  /** Dirección inicial: 1 asc, -1 desc. */
  dirInicial?: Dir;
  /**
   * Campos que al clickearlos por primera vez ordenan ASCENDENTE (nombres, modelos).
   * El resto — montos, fechas, contadores — arranca DESCENDENTE, que es lo que uno
   * quiere ver primero. Mismo criterio que `sortC` en autovia-dashboard.
   */
  texto?: string[];
}

/**
 * Orden por columna para las tablas de /sadmin. Volver a clickear la misma columna
 * invierte la dirección; clickear otra la resetea según `texto`.
 *
 * `accesores` mapea cada `campo` a la función que saca el valor comparable de la fila.
 */
export function useOrden<T>(
  accesores: Record<string, (fila: T) => string | number | null | undefined>,
  { inicial, dirInicial = -1, texto = [] }: OpcionesOrden
) {
  const [campo, setCampo] = useState(inicial);
  const [dir, setDir] = useState<Dir>(dirInicial);

  // Los sets se rearman en cada render si se pasan literales inline; el ref evita que
  // `alternar` cambie de identidad por eso.
  const textoRef = useRef(texto);
  textoRef.current = texto;

  const alternar = useCallback(
    (nuevo: string) => {
      if (nuevo === campo) {
        setDir((d) => (d * -1) as Dir);
        return;
      }
      setCampo(nuevo);
      setDir(textoRef.current.includes(nuevo) ? 1 : -1);
    },
    [campo]
  );

  const ordenar = useCallback(
    (filas: T[]): T[] => {
      const sacar = accesores[campo];
      if (!sacar) return filas;
      return [...filas].sort((a, b) => {
        const x = sacar(a);
        const y = sacar(b);
        // Los vacíos siempre al final, sin importar la dirección.
        const xVacio = x == null || x === '';
        const yVacio = y == null || y === '';
        if (xVacio && yVacio) return 0;
        if (xVacio) return 1;
        if (yVacio) return -1;
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
        return String(x).localeCompare(String(y), 'es-MX') * dir;
      });
    },
    [accesores, campo, dir]
  );

  return useMemo(() => ({ campo, dir, alternar, ordenar }), [campo, dir, alternar, ordenar]);
}
