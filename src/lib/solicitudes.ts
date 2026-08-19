import type { Solicitud } from '@/types';

// Una solicitud sigue "en cobranza" mientras tenga el enganche pagado y no haya
// terminado de pagar sus semanas — sin importar en qué estatus de envío esté (el cobro
// semanal de Stripe corre en paralelo al envío/entrega, no depende de uno del otro).
export function enCobranza(s: Solicitud): boolean {
  return (
    s.pagoConfirmado === true &&
    s.estatus !== 'Cancelada' &&
    s.estatus !== 'Rechazado' &&
    (s.semanasPagadas ?? 0) < s.semanas
  );
}

export function estaAtrasada(s: Solicitud, hoy = new Date()): boolean {
  if (!enCobranza(s) || !s.proximoCobroSemanal) return false;
  return new Date(s.proximoCobroSemanal) < hoy;
}

export function getMetodoPagoLabel(metodo?: Solicitud['metodoPagoEnganche']): string | null {
  switch (metodo) {
    case 'card':
      return 'Tarjeta';
    case 'oxxo':
      return 'OXXO';
    case 'customer_balance':
      return 'Transferencia (SPEI)';
    default:
      return null;
  }
}
