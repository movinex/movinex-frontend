import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Los tamaños (12.8px de tabla, 9x11 de celda, encabezado sticky en mayúsculas) viven en
 * `sadmin.css` como selectores de elemento, no acá — así las 4 tablas del panel heredan
 * la misma densidad sin repetir clases, y un `className` puntual las sigue pisando.
 */

/** Contenedor con scroll propio: el `thead` queda fijo y la página no crece. */
export function TableWrap({
  className,
  maxHeight = 'calc(100vh - 300px)',
  style,
  ...props
}: React.ComponentProps<'div'> & { maxHeight?: string }) {
  return <div className={cn('tw', className)} style={{ maxHeight, ...style }} {...props} />;
}

export function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return <table className={className} {...props} />;
}

export function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={className} {...props} />;
}

/** Fila de totales, pegada al fondo del `TableWrap`. */
export function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return <tfoot className={cn('tfoot', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr className={className} {...props} />;
}

export function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return <th className={className} {...props} />;
}

export function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={className} {...props} />;
}

/**
 * Encabezado ordenable. El triangulito es el `::after` de `.srt` en sadmin.css: `a`
 * ascendente, `d` descendente, sin clase = inactivo (triángulo tenue).
 */
export function SortHead({
  campo,
  activo,
  dir,
  onSort,
  num,
  className,
  children,
  ...props
  // `dir` choca con el atributo HTML homónimo (ltr/rtl), por eso se lo saca de la base.
}: Omit<React.ComponentProps<'th'>, 'onSelect' | 'dir'> & {
  campo: string;
  activo: string;
  dir: 1 | -1;
  onSort: (campo: string) => void;
  num?: boolean;
}) {
  const esActivo = activo === campo;
  return (
    <th
      className={cn('srt', num && 'num', esActivo && (dir > 0 ? 'a' : 'd'), className)}
      onClick={() => onSort(campo)}
      aria-sort={esActivo ? (dir > 0 ? 'ascending' : 'descending') : 'none'}
      {...props}
    >
      {children}
    </th>
  );
}
