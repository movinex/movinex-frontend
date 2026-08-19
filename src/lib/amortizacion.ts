/**
 * Motor de cálculo financiero de Movinex.
 *
 * Replica, fórmula por fórmula, el Cotizador de Excel (amortización francesa/PMT sobre
 * saldos insolutos, IVA sobre interés y sobre el cargo semanal, último pago ajustado a
 * saldo cero) — misma fórmula que hasta ahora vivía solo (duplicada, simplificada) en
 * catalogo-view.tsx. Única fuente de verdad: la usan tanto el Catálogo (enganche/pago
 * sugeridos al cargar un celular) como el Cotizador interno.
 *
 * Todas las fechas se manejan en UTC-mediodía para que sumar 7 días nunca cruce un
 * cambio de horario y desplace el día de la semana.
 */

export interface ParametrosNegocio {
  enganchePct: number;
  tasaAnualPct: number;
  ivaPct: number;
  cargoSemanalNombre: string;
  cargoSemanalMonto: number;
}

export interface EntradaCotizacion {
  precioContado: number;
  plazoSemanas: number;
  fechaPrimerPago: Date;
  parametros: ParametrosNegocio;
}

export interface FilaAmortizacion {
  numeroPeriodo: number;
  fecha: Date;
  saldoInicial: number;
  interes: number;
  ivaInteres: number;
  capital: number;
  cargoServicio: number;
  ivaCargo: number;
  pagoTotal: number;
  saldoFinal: number;
}

export interface ResultadoCotizacion {
  enganche: number;
  montoFinanciar: number;
  tasaSemanal: number;
  tasaSemanalIVA: number;
  cargoSemanalIVA: number;
  pagoBase: number;
  pagoTotalSemanal: number;
  ultimoPago: number;
  sumaPagos: number;
  totalDesembolsado: number;
  costoFinanciamiento: number;
  costoAnualEfectivoRef: number | null;
  tabla: FilaAmortizacion[];
}

/** Fecha a las 12:00 UTC del mismo año/mes/día, para aritmética de semanas sin brincos de DST. */
export function normalizarFechaUTC(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0));
}

function sumarDiasUTC(fecha: Date, dias: number): Date {
  return new Date(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
}

/** PMT estándar de anualidad (idéntico al PMT de Excel con fv=0, type=0). */
export function pmt(tasaPeriodo: number, numPeriodos: number, valorPresente: number): number {
  if (numPeriodos <= 0) return 0;
  if (tasaPeriodo === 0) return valorPresente / numPeriodos;
  return (valorPresente * tasaPeriodo) / (1 - Math.pow(1 + tasaPeriodo, -numPeriodos));
}

/**
 * Resuelve por bisección la tasa periódica `i` tal que
 * pv = pago * (1 - (1+i)^-nper) / i   — equivalente al RATE(nper, -pago, pv) de Excel.
 * Es una referencia interna aproximada (así lo marca el propio Excel), no el CAT oficial.
 */
export function rateBiseccion(numPeriodos: number, pago: number, valorPresente: number): number | null {
  if (numPeriodos <= 0 || pago <= 0 || valorPresente <= 0) return null;

  const f = (i: number) => {
    if (Math.abs(i) < 1e-12) return pago * numPeriodos - valorPresente;
    return (pago * (1 - Math.pow(1 + i, -numPeriodos))) / i - valorPresente;
  };

  let lo = 1e-9;
  let hi = 10; // hasta 1000% por periodo — de sobra para tasas semanales de crédito al consumo
  let fLo = f(lo);
  const fHi = f(hi);
  if (fLo * fHi > 0) return null;

  let mid = lo;
  for (let iter = 0; iter < 200; iter++) {
    mid = (lo + hi) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-9) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return mid;
}

/**
 * Pago semanal total (capital+interés+IVA+cargo de servicio) para un monto ya
 * financiado (después de descontar el enganche) — separado de `calcularCotizacion`
 * porque el Catálogo permite que el admin pise el enganche sugerido con otro monto, y
 * en ese caso el "financiado" ya no es `precioContado * (1 - enganchePct)`.
 */
export function calcularPagoSemanal(montoFinanciar: number, plazoSemanas: number, parametros: ParametrosNegocio): number {
  if (!montoFinanciar || montoFinanciar <= 0) return 0;
  const tasaSemanalIVA = (parametros.tasaAnualPct / 52) * (1 + parametros.ivaPct);
  const cargoSemanalIVA = parametros.cargoSemanalMonto * (1 + parametros.ivaPct);
  return Math.round(pmt(tasaSemanalIVA, plazoSemanas, montoFinanciar) + cargoSemanalIVA);
}

export function calcularCotizacion(entrada: EntradaCotizacion): ResultadoCotizacion {
  const { precioContado, plazoSemanas, parametros } = entrada;
  const { enganchePct, tasaAnualPct, ivaPct, cargoSemanalMonto } = parametros;
  const fechaPrimerPago = normalizarFechaUTC(entrada.fechaPrimerPago);

  const enganche = precioContado * enganchePct;
  const montoFinanciar = precioContado - enganche;

  const tasaSemanal = tasaAnualPct / 52;
  const tasaSemanalIVA = tasaSemanal * (1 + ivaPct);
  const cargoSemanalIVA = cargoSemanalMonto * (1 + ivaPct);

  const pagoTotalSemanal = Math.round(pmt(tasaSemanalIVA, plazoSemanas, montoFinanciar) + cargoSemanalIVA);
  const pagoBase = pagoTotalSemanal - cargoSemanalIVA;

  const tabla: FilaAmortizacion[] = [];
  let saldo = montoFinanciar;

  for (let n = 1; n <= plazoSemanas; n++) {
    const fecha = n === 1 ? fechaPrimerPago : sumarDiasUTC(tabla[n - 2].fecha, 7);
    const saldoInicial = saldo;
    const interes = saldoInicial * tasaSemanal;
    const ivaInteres = interes * ivaPct;
    const capital = n === plazoSemanas ? saldoInicial : pagoBase - interes - ivaInteres;
    const cargoServicio = cargoSemanalMonto;
    const ivaCargo = cargoSemanalMonto * ivaPct;
    const pagoTotal = capital + interes + ivaInteres + cargoServicio + ivaCargo;
    const saldoFinal = Math.max(0, saldoInicial - capital);

    tabla.push({ numeroPeriodo: n, fecha, saldoInicial, interes, ivaInteres, capital, cargoServicio, ivaCargo, pagoTotal, saldoFinal });

    saldo = saldoFinal;
  }

  const ultimoPago = tabla[tabla.length - 1]?.pagoTotal ?? pagoTotalSemanal;
  const sumaPagos = tabla.reduce((acc, fila) => acc + fila.pagoTotal, 0);
  const totalDesembolsado = enganche + sumaPagos;
  const costoFinanciamiento = totalDesembolsado - precioContado;

  const tasaEfectivaPeriodo = rateBiseccion(plazoSemanas, pagoTotalSemanal, montoFinanciar);
  const costoAnualEfectivoRef = tasaEfectivaPeriodo === null ? null : Math.pow(1 + tasaEfectivaPeriodo, 52) - 1;

  return {
    enganche,
    montoFinanciar,
    tasaSemanal,
    tasaSemanalIVA,
    cargoSemanalIVA,
    pagoBase,
    pagoTotalSemanal,
    ultimoPago,
    sumaPagos,
    totalDesembolsado,
    costoFinanciamiento,
    costoAnualEfectivoRef,
    tabla,
  };
}

/** Próxima fecha en que cae el mismo día de la semana que `fechaVenta`, 7 días después. */
export function primerPagoSugerido(fechaVenta: Date): Date {
  return sumarDiasUTC(normalizarFechaUTC(fechaVenta), 7);
}
