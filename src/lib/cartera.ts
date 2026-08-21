/**
 * Motor de cartera: convierte una solicitud + su historial de pagos en el estado real
 * del crédito (cuánto se cobró, cuánto se debe, cuántos días de atraso, en qué bucket
 * de antigüedad cae). Es el equivalente de `estadoCredito()` de autovia-dashboard,
 * adaptado a que el producto de Movinex es más simple.
 *
 * Dos diferencias con autovía que justifican no copiar su código tal cual:
 *
 * 1. **El calendario es plano, no amortizado.** Stripe cobra una Subscription semanal de
 *    monto fijo (`pago_semanal`); lo que el cliente debe cada semana es siempre lo mismo.
 *    La tabla de amortización de `lib/amortizacion.ts` sirve para COTIZAR (desglosar
 *    capital/interés antes de vender), no para cobrar. Usarla acá daría cuotas variables
 *    que no coinciden con lo que Stripe factura.
 * 2. **No hay pagos parciales ni abonos a capital.** Stripe cobra la semana completa o
 *    falla. Eso hace que el reparto FIFO sea exacto, no una aproximación.
 */
import { normalizarFechaUTC } from './amortizacion';
import type { Solicitud } from '@/types';

const MS_DIA = 86_400_000;
const MS_SEMANA = 7 * MS_DIA;

/**
 * Días de tolerancia antes de contar mora. Autovía usa 5 (`diasGracia` en su parametría);
 * acá va en 0 hasta que el negocio defina una política, porque inventar una tolerancia
 * haría ver "al corriente" a alguien que no lo está. Stripe reintenta la tarjeta solo
 * durante unos días (Smart Retries), así que si se quisiera alinear con eso, 3 sería el
 * número razonable — pero es una decisión de negocio, no técnica.
 */
export const DIAS_GRACIA = 0;

export interface Pago {
  id: string;
  solicitudId: string;
  tipo: 'enganche' | 'semanal';
  numeroSemana: number | null;
  monto: number;
  fecha: string;
  metodo: string | null;
  estado: 'pagado' | 'fallido' | 'reembolsado';
}

export type Bucket = 'Al corriente' | '1-30' | '31-60' | '61-90' | '90+' | 'n/a';
export type EstatusCartera = 'Por activar' | 'Al corriente' | 'Atraso 1 cuota' | 'Atraso 2+ cuotas' | 'Liquidado';

export interface Cuota {
  numero: number;
  vence: Date;
  monto: number;
  aplicado: number;
  estatus: 'Pagada' | 'Vencida' | 'Por vencer';
  vencida: boolean;
}

export interface CreditoEstado {
  solicitud: Solicitud;
  /** Todas las cuotas del plan, con su estado. Es la base del estado de cuenta. */
  cuotas: Cuota[];
  pagos: Pago[];

  total: number;          // suma del plan semanal (sin enganche)
  cobrado: number;        // suma de los pagos semanales acreditados
  enCaja: number;         // cobrado + enganche: la plata que entró de verdad
  saldo: number;          // lo que falta cobrar del plan
  exigible: number;       // suma de las cuotas ya vencidas
  atraso: number;         // exigible que no está cubierto

  cuotasVencidas: number;
  cuotasCubiertas: number;
  cuotasAtraso: number;   // atraso expresado en cuotas (puede ser fraccionario)

  diasMora: number;
  bucket: Bucket;
  estatus: EstatusCartera;
  avance: number;         // 0..1

  proxVto: Date | null;
  proxMonto: number;
  primerVto: Date | null;
  ultimoVto: Date | null;
  ultPagoFecha: Date | null;
  diasSinPago: number | null;
  pagosFallidos: number;
}

/** Fecha de la primera cuota semanal. */
function anclaCalendario(s: Solicitud, pagosDeLaSolicitud: Pago[]): Date | null {
  // La Subscription se crea con `trial_period_days: 7`, así que la primera cuota cae
  // una semana después de que entró el enganche.
  const enganche = pagosDeLaSolicitud.find((p) => p.tipo === 'enganche');
  const base = enganche?.fecha || s.pagoConfirmadoAt;
  // Se usa el pago del enganche antes que `pago_confirmado_at` a propósito: las
  // solicitudes anteriores al 2026-08-18 no tienen esa columna, pero sí tienen la fecha
  // real recuperada de Stripe en la tabla `pagos`.
  if (!base) return null;
  return new Date(normalizarFechaUTC(new Date(base)).getTime() + MS_SEMANA);
}

export function estadoCredito(s: Solicitud, pagosDeLaSolicitud: Pago[], hoy: Date = new Date()): CreditoEstado {
  const pagos = [...pagosDeLaSolicitud].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const acreditados = pagos.filter((p) => p.tipo === 'semanal' && p.estado === 'pagado');
  const engancheCobrado = pagos.filter((p) => p.tipo === 'enganche' && p.estado === 'pagado').reduce((acc, p) => acc + p.monto, 0);

  const cuotaMonto = Number(s.pagoSemanal || 0);
  const plazo = Number(s.semanas || 0);
  const total = cuotaMonto * plazo;
  const cobrado = acreditados.reduce((acc, p) => acc + p.monto, 0);
  const ancla = anclaCalendario(s, pagos);
  const corte = normalizarFechaUTC(hoy);

  // Reparto FIFO de lo cobrado sobre las cuotas, en orden. Sin pagos parciales esto es
  // exacto: cada cuota queda cubierta entera o no queda cubierta.
  let bolsa = cobrado;
  const cuotas: Cuota[] = [];
  for (let n = 1; n <= plazo; n++) {
    const vence = ancla ? new Date(ancla.getTime() + (n - 1) * MS_SEMANA) : null;
    const aplicado = Math.min(bolsa, cuotaMonto);
    bolsa -= aplicado;
    // Estrictamente ANTERIOR a hoy: una cuota que vence hoy todavía no está vencida —
    // el cliente tiene el día para pagarla. Con `<=` una cuota del día aparecía como
    // "Atraso 1 cuota" y a la vez en el bucket "Al corriente" (0 días de mora), que es
    // contradictorio y hacía que la lista de llamadas incluyera a gente que no debe nada.
    const vencida = vence ? vence.getTime() < corte.getTime() : false;
    const pagada = aplicado >= cuotaMonto - 0.5;
    cuotas.push({
      numero: n,
      vence: vence ?? corte,
      monto: cuotaMonto,
      aplicado,
      estatus: pagada ? 'Pagada' : vencida ? 'Vencida' : 'Por vencer',
      vencida
    });
  }

  const vencidas = cuotas.filter((c) => c.vencida);
  const exigible = vencidas.reduce((acc, c) => acc + c.monto, 0);
  const atraso = Math.max(0, exigible - Math.min(cobrado, exigible));
  const cuotasCubiertas = cuotas.filter((c) => c.estatus === 'Pagada').length;
  const saldo = Math.max(0, total - cobrado);
  const cuotasAtraso = cuotaMonto ? atraso / cuotaMonto : 0;

  // Mora: se cuenta desde la cuota vencida más vieja que todavía no está cubierta.
  const primeraImpaga = cuotas.find((c) => c.vencida && c.estatus !== 'Pagada');
  const diasMora = primeraImpaga
    ? Math.max(0, Math.floor((corte.getTime() - primeraImpaga.vence.getTime()) / MS_DIA) - DIAS_GRACIA)
    : 0;

  let estatus: EstatusCartera;
  if (!s.pagoConfirmado || !ancla) estatus = 'Por activar';
  else if (saldo <= 0.5 || cuotasCubiertas >= plazo) estatus = 'Liquidado';
  else if (atraso <= 0.5) estatus = 'Al corriente';
  else if (cuotasAtraso < 2) estatus = 'Atraso 1 cuota';
  else estatus = 'Atraso 2+ cuotas';

  const bucket: Bucket =
    estatus === 'Por activar' || estatus === 'Liquidado' ? 'n/a'
      : diasMora <= 0 ? 'Al corriente'
        : diasMora <= 30 ? '1-30'
          : diasMora <= 60 ? '31-60'
            : diasMora <= 90 ? '61-90'
              : '90+';

  const proxima = cuotas.find((c) => c.estatus !== 'Pagada');
  // "Último pago" es cualquier plata que entró de verdad (enganche o semanal), no solo
  // lo que cuenta para el FIFO de cuotas — si no, alguien que pagó el enganche pero
  // todavía no llega a su primera cuota semanal aparece como si nunca hubiera pagado.
  const todosLosPagos = pagos.filter((p) => p.estado === 'pagado');
  const ultimoPago = todosLosPagos.length ? todosLosPagos[todosLosPagos.length - 1] : null;

  return {
    solicitud: s,
    cuotas,
    pagos,
    total,
    cobrado,
    enCaja: cobrado + engancheCobrado,
    saldo,
    exigible,
    atraso,
    cuotasVencidas: vencidas.length,
    cuotasCubiertas,
    cuotasAtraso,
    diasMora,
    bucket,
    estatus,
    avance: total ? cobrado / total : 0,
    proxVto: proxima ? proxima.vence : null,
    proxMonto: proxima ? proxima.monto - proxima.aplicado : 0,
    primerVto: cuotas.length ? cuotas[0].vence : null,
    ultimoVto: cuotas.length ? cuotas[cuotas.length - 1].vence : null,
    ultPagoFecha: ultimoPago ? new Date(ultimoPago.fecha) : null,
    diasSinPago: ultimoPago ? Math.floor((corte.getTime() - new Date(ultimoPago.fecha).getTime()) / MS_DIA) : null,
    pagosFallidos: pagos.filter((p) => p.estado === 'fallido').length
  };
}

/**
 * Arma la cartera completa. Se agrupan los pagos por solicitud una sola vez en vez de
 * filtrar el array entero por cada crédito, que sería O(n×m).
 */
export function construirCartera(solicitudes: Solicitud[], pagos: Pago[], hoy: Date = new Date()): CreditoEstado[] {
  const porSolicitud = new Map<string, Pago[]>();
  for (const p of pagos) {
    const lista = porSolicitud.get(p.solicitudId);
    if (lista) lista.push(p);
    else porSolicitud.set(p.solicitudId, [p]);
  }
  return solicitudes.map((s) => estadoCredito(s, porSolicitud.get(s.id) || [], hoy));
}

// ---------------------------------------------------------------------------
// Agregados — port de kpis() / porMes() / calendario() de autovia-dashboard
// ---------------------------------------------------------------------------

export const BUCKETS: Bucket[] = ['Al corriente', '1-30', '31-60', '61-90', '90+'];

export interface KpisCartera {
  n: number;
  activos: number;
  atrasados: number;
  liquidados: number;
  porActivar: number;
  enganches: number;
  total: number;
  cobrado: number;
  porCobrar: number;
  enCaja: number;
  avance: number;
  ingresoSemanal: number;
  exigible: number;
  atraso: number;
  morosidad: number;
  ticket: number;
  nClientes: number;
  topCliente: [string, number];
  topPct: number;
  aging: { bucket: Bucket; n: number; monto: number }[];
}

export function kpis(cartera: CreditoEstado[]): KpisCartera {
  const suma = (f: (c: CreditoEstado) => number) => cartera.reduce((acc, c) => acc + f(c), 0);
  const activos = cartera.filter((c) => c.estatus !== 'Liquidado' && c.estatus !== 'Por activar');
  const atrasados = cartera.filter((c) => c.estatus.startsWith('Atraso'));

  const total = suma((c) => c.total);
  const cobrado = suma((c) => c.cobrado);
  const exigible = suma((c) => c.exigible);
  const atraso = suma((c) => c.atraso);
  const porCobrar = suma((c) => c.saldo);

  const porCliente = new Map<string, number>();
  for (const c of cartera) {
    const nombre = c.solicitud.cliente || '—';
    porCliente.set(nombre, (porCliente.get(nombre) || 0) + c.saldo);
  }
  const ranking = [...porCliente.entries()].sort((a, b) => b[1] - a[1]);

  return {
    n: cartera.length,
    activos: activos.length,
    atrasados: atrasados.length,
    liquidados: cartera.filter((c) => c.estatus === 'Liquidado').length,
    porActivar: cartera.filter((c) => c.estatus === 'Por activar').length,
    enganches: suma((c) => c.enCaja - c.cobrado),
    total,
    cobrado,
    porCobrar,
    enCaja: suma((c) => c.enCaja),
    avance: total ? cobrado / total : 0,
    ingresoSemanal: activos.reduce((acc, c) => acc + Number(c.solicitud.pagoSemanal || 0), 0),
    exigible,
    atraso,
    morosidad: exigible ? atraso / exigible : 0,
    ticket: cartera.length ? total / cartera.length : 0,
    nClientes: porCliente.size,
    topCliente: ranking[0] || ['—', 0],
    topPct: porCobrar && ranking[0] ? ranking[0][1] / porCobrar : 0,
    aging: BUCKETS.map((bucket) => {
      const enBucket = cartera.filter((c) => c.bucket === bucket);
      return {
        bucket,
        n: enBucket.length,
        // Al corriente se mide por saldo vigente; los demás, por importe vencido.
        monto: enBucket.reduce((acc, c) => acc + (bucket === 'Al corriente' ? c.saldo : c.atraso), 0)
      };
    })
  };
}

const ym = (d: Date | string) => new Date(d).toISOString().slice(0, 7);

export interface FilaMes {
  mes: string;
  n: number;
  enganches: number;
  total: number;
  cobrado: number;
}

/** Originación por mes de alta de la solicitud. */
export function porMes(cartera: CreditoEstado[]): FilaMes[] {
  const m = new Map<string, FilaMes>();
  for (const c of cartera) {
    const k = ym(c.solicitud.fecha);
    const fila = m.get(k) || { mes: k, n: 0, enganches: 0, total: 0, cobrado: 0 };
    fila.n++;
    fila.enganches += c.enCaja - c.cobrado;
    fila.total += c.total;
    fila.cobrado += c.cobrado;
    m.set(k, fila);
  }
  return [...m.values()].sort((a, b) => (a.mes < b.mes ? -1 : 1));
}

export interface FilaCalendario {
  mes: string;
  creditosActivos: number;
  esperado: number;
  cobrado: number;
  pendiente: number;
  fase: 'Cerrado' | 'En curso' | 'Proyectado';
}

/**
 * Flujo mensual: lo que debía entrar (por fecha de vencimiento de cada cuota) contra lo
 * que entró de verdad (por fecha de caja del pago). La brecha entre ambos, en los meses
 * ya cerrados, es la cobranza que no se logró.
 */
export function calendario(cartera: CreditoEstado[], hoy: Date = new Date()): FilaCalendario[] {
  const m = new Map<string, { esperado: number; cobrado: number; creditos: Set<string> }>();
  const tocar = (k: string) => {
    const v = m.get(k) || { esperado: 0, cobrado: 0, creditos: new Set<string>() };
    m.set(k, v);
    return v;
  };

  for (const c of cartera) {
    if (c.estatus === 'Por activar') continue;
    for (const cuota of c.cuotas) {
      const v = tocar(ym(cuota.vence));
      v.esperado += cuota.monto;
      v.creditos.add(c.solicitud.id);
    }
    for (const p of c.pagos) {
      if (p.tipo !== 'semanal' || p.estado !== 'pagado') continue;
      tocar(ym(p.fecha)).cobrado += p.monto;
    }
  }

  const corte = ym(hoy);
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([mes, v]) => ({
      mes,
      creditosActivos: v.creditos.size,
      esperado: v.esperado,
      cobrado: v.cobrado,
      pendiente: Math.max(0, v.esperado - v.cobrado),
      fase: mes < corte ? 'Cerrado' : mes === corte ? 'En curso' : 'Proyectado'
    }));
}

export interface DiaCalendario {
  /** `YYYY-MM-DD` en UTC-mediodía, mismo criterio de fecha que el resto de la cartera. */
  fecha: Date;
  monto: number;
  cuotas: number;
}

/** Vencimientos día por día de un mes puntual (`YYYY-MM`) — alimenta el heatmap mensual. */
export function calendarioDiario(cartera: CreditoEstado[], mes: string): DiaCalendario[] {
  const m = new Map<string, { monto: number; cuotas: number }>();
  for (const c of cartera) {
    if (c.estatus === 'Por activar') continue;
    for (const cuota of c.cuotas) {
      const clave = cuota.vence.toISOString().slice(0, 10);
      if (!clave.startsWith(mes)) continue;
      const v = m.get(clave) || { monto: 0, cuotas: 0 };
      v.monto += cuota.monto;
      v.cuotas += 1;
      m.set(clave, v);
    }
  }
  return [...m.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([clave, v]) => ({ fecha: new Date(`${clave}T12:00:00Z`), ...v }));
}

/** `2026-08` → `ago-26`, para los ejes de los gráficos. */
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export function etiquetaMes(k: string): string {
  const [anio, mes] = k.split('-');
  return `${MESES_CORTOS[Number(mes) - 1]}-${anio.slice(2)}`;
}
