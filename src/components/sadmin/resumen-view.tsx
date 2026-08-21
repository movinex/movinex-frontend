import { useMemo } from 'react';
import { Kpi, Kpis, Panel, PanelH, SecH } from './bloques';
import { BrechaChart, ColocacionChart, CobranzaChart, ConcentracionChart, EstatusChart, PlazoChart } from './charts';
import { formatoMoneda, formatoPorcentaje } from '@/lib/format';
import { calendario, kpis as calcularKpis, porMes, type CreditoEstado } from '@/lib/cartera';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MS_DIA = 86_400_000;

export function ResumenView({ cartera }: { cartera: CreditoEstado[] }) {
  const k = useMemo(() => calcularKpis(cartera), [cartera]);
  const originacion = useMemo(() => porMes(cartera), [cartera]);
  const flujo = useMemo(() => calendario(cartera), [cartera]);

  const activos = cartera.filter((c) => c.estatus !== 'Por activar' && c.estatus !== 'Liquidado');

  // Embudo: dónde se está atascando la gente antes de llegar a pagar.
  const datosEstatus = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cartera) m.set(c.solicitud.estatus, (m.get(c.solicitud.estatus) || 0) + 1);
    return [...m.entries()].map(([estatus, total]) => ({ estatus, total })).sort((a, b) => b.total - a.total);
  }, [cartera]);

  // Cobranza esperada de los próximos 7 días, por día.
  const datosCobranza = useMemo(() => {
    const hoy = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(hoy.getTime() + i * MS_DIA);
      d.setHours(0, 0, 0, 0);
      const monto = activos.reduce((acc, c) => {
        const cuota = c.cuotas.find((q) => q.estatus !== 'Pagada' && q.vence.toDateString() === d.toDateString());
        return acc + (cuota ? cuota.monto : 0);
      }, 0);
      return { dia: DIAS[d.getDay()], monto };
    });
  }, [activos]);

  const mezclaPlazo = useMemo(() => {
    const m = new Map<number, { n: number; monto: number }>();
    for (const c of cartera) {
      const plazo = Number(c.solicitud.semanas || 0);
      const v = m.get(plazo) || { n: 0, monto: 0 };
      v.n++;
      v.monto += c.total;
      m.set(plazo, v);
    }
    return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([plazo, v]) => ({ plazo: `${plazo} semanas`, ...v }));
  }, [cartera]);

  const concentracion = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cartera) {
      if (c.saldo <= 0) continue;
      const nombre = c.solicitud.cliente || '—';
      m.set(nombre, (m.get(nombre) || 0) + c.saldo);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([cliente, saldo]) => ({ cliente, saldo }));
  }, [cartera]);

  return (
    <>
      <SecH titulo="Originación" nota={`${k.n} solicitudes · ${k.nClientes} clientes`} />
      <Kpis>
        <Kpi
          label="Solicitudes"
          valor={k.n}
          pie={`${k.activos} activas · ${k.liquidados} liquidadas · ${k.porActivar} sin activar`}
        />
        <Kpi label="Enganches cobrados" valor={formatoMoneda(k.enganches)} pie="Acumulado histórico, incluye envío" />
        <Kpi label="Plan colocado" valor={formatoMoneda(k.total)} pie={`Ticket promedio ${formatoMoneda(k.ticket)}`} />
        <Kpi label="Recuperado en caja" valor={formatoMoneda(k.enCaja)} pie="Enganches + cuotas semanales cobradas" />
      </Kpis>

      <SecH titulo="Cobranza" />
      <Kpis>
        <Kpi label="Cobrado del plan" valor={formatoMoneda(k.cobrado)} pie={`${formatoPorcentaje(k.avance)} del plan colocado`} />
        <Kpi label="Por cobrar" valor={formatoMoneda(k.porCobrar)} pie="Saldo del flujo semanal pendiente" />
        <Kpi label="Avance de cobranza" valor={formatoPorcentaje(k.avance)} pie="Del monto total a cobrar" />
        <Kpi
          label="Ingreso semanal vigente"
          valor={formatoMoneda(k.ingresoSemanal)}
          pie={`Suma de cuotas de ${k.activos} crédito(s) activo(s)`}
        />
        <Kpi label="Exigible a la fecha" valor={formatoMoneda(k.exigible)} pie="Cuotas ya vencidas, cobradas o no" />
      </Kpis>

      <SecH titulo="Calidad de cartera y riesgo" />
      <Kpis>
        <Kpi
          label="Créditos con atraso"
          valor={k.atrasados}
          pie={k.atrasados > 0 ? 'Con al menos una cuota vencida sin cubrir' : 'Toda la cartera al corriente'}
          tono={k.atrasados > 0 ? 'critical' : 'default'}
        />
        <Kpi
          label="Importe vencido"
          valor={formatoMoneda(k.atraso)}
          pie="Lo que debió cobrarse y no entró"
          tono={k.atraso > 0 ? 'critical' : 'default'}
        />
        <Kpi
          label="Índice de morosidad"
          valor={formatoPorcentaje(k.morosidad)}
          pie="Importe vencido sobre importe exigible"
          tono={k.morosidad > 0.1 ? 'warning' : 'default'}
        />
        <Kpi
          label="Exposición máxima"
          valor={formatoMoneda(k.topCliente[1])}
          pie={`${k.topCliente[0]} · ${formatoPorcentaje(k.topPct)} del saldo total`}
          tono={k.topPct > 0.25 ? 'warning' : 'default'}
        />
      </Kpis>

      <SecH titulo="Tendencias" />
      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelH titulo="Colocación mensual" descripcion="Cuánto plan se pone en la calle cada mes y con qué enganche se apoya." />
          <div className="px-[18px] pb-[18px] pt-3.5"><ColocacionChart datos={originacion} /></div>
        </Panel>
        <Panel>
          <PanelH titulo="Mezcla por plazo" descripcion="A cuántas semanas está comprometido el capital: determina la duración de la cartera." />
          <div className="px-[18px] pb-[18px] pt-3.5"><PlazoChart datos={mezclaPlazo} /></div>
        </Panel>
        <Panel>
          <PanelH titulo="Cobranza de los próximos 7 días" descripcion="Monto esperado por día, según el calendario de cuotas." />
          <div className="px-[18px] pb-[18px] pt-3.5"><CobranzaChart datos={datosCobranza} /></div>
        </Panel>
        <Panel>
          <PanelH titulo="Solicitudes por estatus" descripcion="Dónde se está atascando la gente dentro del flujo de alta." />
          <div className="px-[18px] pb-[18px] pt-3.5"><EstatusChart datos={datosEstatus} /></div>
        </Panel>
        <Panel>
          <PanelH titulo="Esperado contra cobrado" descripcion="Meses ya vencidos o en curso. La brecha entre lo esperado y lo cobrado es la cobranza que no entró." />
          <div className="px-[18px] pb-[18px] pt-3.5"><BrechaChart datos={flujo} /></div>
        </Panel>
        <Panel>
          <PanelH titulo="Concentración por cliente" descripcion="Los diez mayores saldos por cobrar — sirve para fijar un límite de exposición." />
          <div className="px-[18px] pb-[18px] pt-3.5"><ConcentracionChart datos={concentracion} /></div>
        </Panel>
      </div>

      {flujo.length === 0 && (
        <div className="banner n mt-4">
          <div>
            Todavía no hay cuotas con fecha: los indicadores de cobranza se llenan solos en
            cuanto el primer crédito arranque su plan semanal.
          </div>
        </div>
      )}
    </>
  );
}
