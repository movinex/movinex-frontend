import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Solicitud } from '@/types';

/**
 * Píldora con puntito de color, el patrón de estado de autovia-dashboard. Reemplaza al
 * `Badge` de shadcn en las listas: el tinte sólido (`--good-bg`) se lee mucho mejor sobre
 * el papel cálido que el fondo translúcido al 15% que se usaba antes.
 */
export type TonoPill = 'ok' | 'w' | 's' | 'c' | 'n' | 'i';

export function Pill({ tono = 'n', children, className }: { tono?: TonoPill; children: ReactNode; className?: string }) {
  return (
    <span className={cn('pill', tono, className)}>
      <i className="pd" />
      {children}
    </span>
  );
}

const TONO_POR_ESTATUS: Record<Solicitud['estatus'], TonoPill> = {
  Iniciada: 'n',
  'Lista para pago': 'n',
  'Verificando identidad': 'w',
  Pendiente: 'w',
  Aprobado: 'ok',
  Rechazado: 'c',
  Cancelada: 'c',
  'Preparando paquete': 'i',
  'Pendiente de envío': 'i',
  Enviado: 'i',
  Entregado: 'ok'
};

export function EstadoBadge({ estatus }: { estatus: Solicitud['estatus'] }) {
  return <Pill tono={TONO_POR_ESTATUS[estatus] ?? 'n'}>{estatus}</Pill>;
}
