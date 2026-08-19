import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { Solicitud } from '@/types';

const VARIANTE_POR_ESTATUS: Record<Solicitud['estatus'], NonNullable<BadgeProps['variant']>> = {
  Iniciada: 'secondary',
  'Lista para pago': 'secondary',
  'Verificando identidad': 'warning',
  Pendiente: 'warning',
  Aprobado: 'good',
  Rechazado: 'critical',
  Cancelada: 'critical',
  'Preparando paquete': 'default',
  'Pendiente de envío': 'default',
  Enviado: 'default',
  Entregado: 'good'
};

export function EstadoBadge({ estatus }: { estatus: Solicitud['estatus'] }) {
  return <Badge variant={VARIANTE_POR_ESTATUS[estatus] ?? 'secondary'}>{estatus}</Badge>;
}
