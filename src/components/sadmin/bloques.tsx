import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Bloques de maquetación compartidos, portados de autovia-dashboard: el indicador
 * (`.kpi`), el encabezado de sección (`.sec-h`) y la tarjeta contenedora (`.card`).
 * Los tamaños viven en `sadmin.css`.
 */

/** Encabezado de sección: etiqueta chica en mayúsculas + regla + nota a la derecha. */
export function SecH({ titulo, nota }: { titulo: string; nota?: ReactNode }) {
  return (
    <div className="sec-h">
      <h2>{titulo}</h2>
      <div className="rule" />
      {nota && <span className="note">{nota}</span>}
    </div>
  );
}

/** Grilla de indicadores que se acomoda sola (mínimo 212 px por columna). */
export function Kpis({ children }: { children: ReactNode }) {
  return <div className="kpis">{children}</div>;
}

export function Kpi({
  label,
  valor,
  pie,
  tono
}: {
  label: ReactNode;
  valor: ReactNode;
  pie?: ReactNode;
  tono?: 'default' | 'warning' | 'critical';
}) {
  return (
    <div className={cn('kpi', tono === 'warning' && 'flag')}>
      <div className="lb">{label}</div>
      <div className={cn('vl', tono === 'critical' && 'bad')}>{valor}</div>
      {pie && <div className="ft">{pie}</div>}
    </div>
  );
}

/** Tarjeta con borde, radio y la sombra suave del sistema. */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-[var(--radius)] border bg-card shadow-[var(--sh)]', className)}>
      {children}
    </div>
  );
}

/** Encabezado interno de una tarjeta: título + descripción. */
export function PanelH({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <div className="px-[18px] pt-[15px]">
      <h3 className="text-[14px] font-[640] tracking-[-.15px]">{titulo}</h3>
      {descripcion && <p className="mt-0.5 text-[12px] leading-[1.45] text-muted-foreground">{descripcion}</p>}
    </div>
  );
}
