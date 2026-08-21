import { useMemo } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap } from '@/components/ui/table';
import { Kpi, Kpis, Panel, PanelH, SecH } from './bloques';
import { Pill, type TonoPill } from './pill';
import { BrechaChart } from './charts';
import { CalendarioMes } from './calendario-mes';
import { formatoMoneda, formatoPorcentaje } from '@/lib/format';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import { calendario, etiquetaMes, type CreditoEstado, type FilaCalendario } from '@/lib/cartera';

const TONO_FASE: Record<FilaCalendario['fase'], TonoPill> = {
  Cerrado: 'n',
  'En curso': 'i',
  Proyectado: 'w'
};

export function CalendarioView({ cartera }: { cartera: CreditoEstado[] }) {
  const flujo = useMemo(() => calendario(cartera), [cartera]);

  const cerrados = flujo.filter((f) => f.fase === 'Cerrado');
  const proyectados = flujo.filter((f) => f.fase === 'Proyectado');
  const enCurso = flujo.find((f) => f.fase === 'En curso');

  const esperadoCerrado = cerrados.reduce((acc, f) => acc + f.esperado, 0);
  const cobradoCerrado = cerrados.reduce((acc, f) => acc + f.cobrado, 0);
  const efectividad = esperadoCerrado ? cobradoCerrado / esperadoCerrado : 0;
  const porVenir = proyectados.reduce((acc, f) => acc + f.esperado, 0);

  const totales = flujo.reduce(
    (acc, f) => ({ esperado: acc.esperado + f.esperado, cobrado: acc.cobrado + f.cobrado, pendiente: acc.pendiente + f.pendiente }),
    { esperado: 0, cobrado: 0, pendiente: 0 }
  );

  const exportar = () => {
    descargar(
      toCSV([
        ['Mes', 'Créditos activos', 'Fase', 'Esperado', 'Cobrado', 'Pendiente', 'Efectividad'],
        ...flujo.map((f) => [
          f.mes, f.creditosActivos, f.fase,
          Math.round(f.esperado * 100) / 100,
          Math.round(f.cobrado * 100) / 100,
          Math.round(f.pendiente * 100) / 100,
          f.esperado ? Math.round((f.cobrado / f.esperado) * 10000) / 100 + '%' : ''
        ])
      ]),
      nombreArchivo('flujo_mensual')
    );
    toast.success('Calendario de flujo exportado a CSV.');
  };

  if (flujo.length === 0) {
    return (
      <div className="banner n">
        <div>
          Todavía no hay ningún crédito con su plan semanal arrancado, así que no hay flujo
          que proyectar. Esta vista se llena sola en cuanto se active el primero.
        </div>
      </div>
    );
  }

  return (
    <>
      <SecH titulo="Resumen del flujo" nota={`${cerrados.length} mes(es) cerrado(s) · ${proyectados.length} proyectado(s)`} />
      <Kpis>
        <Kpi
          label="Efectividad de cobranza"
          valor={formatoPorcentaje(efectividad)}
          pie={`${formatoMoneda(cobradoCerrado)} cobrados de ${formatoMoneda(esperadoCerrado)} exigibles en meses cerrados`}
          tono={efectividad < 0.9 && cerrados.length > 0 ? 'warning' : 'default'}
        />
        <Kpi
          label="Este mes"
          valor={enCurso ? formatoMoneda(enCurso.esperado) : formatoMoneda(0)}
          pie={enCurso ? `${formatoMoneda(enCurso.cobrado)} ya cobrados` : 'Sin cuotas este mes'}
        />
        <Kpi label="Por venir" valor={formatoMoneda(porVenir)} pie={`Comprometido en los próximos ${proyectados.length} mes(es)`} />
        <Kpi
          label="Quedó sin cobrar"
          valor={formatoMoneda(cerrados.reduce((acc, f) => acc + f.pendiente, 0))}
          pie="Acumulado de los meses ya cerrados"
          tono={cerrados.some((f) => f.pendiente > 0) ? 'critical' : 'default'}
        />
      </Kpis>

      <SecH titulo="Esperado contra cobrado" nota="solo meses ya vencidos o en curso" />
      <Panel>
        <PanelH
          titulo="Brecha mensual"
          descripcion="La franja verde es lo que entró; la naranja, lo que se esperaba y no entró."
        />
        <div className="px-[18px] pb-[18px] pt-3.5"><BrechaChart datos={flujo} /></div>
      </Panel>

      <Panel className="p-[18px]">
        <CalendarioMes cartera={cartera} />
      </Panel>

      <SecH titulo="Mes a mes" nota={`${flujo.length} meses`} />
      <div className="mb-3 flex justify-end">
        <button type="button" className="ctl" onClick={exportar}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
      </div>
      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <th>Mes</th>
              <th className="num">Créditos activos</th>
              <th>Fase</th>
              <th className="num">Esperado</th>
              <th className="num">Cobrado</th>
              <th className="num">Pendiente</th>
              <th className="num">Efectividad</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flujo.map((f) => {
              const efec = f.esperado ? f.cobrado / f.esperado : null;
              return (
                <TableRow key={f.mes}>
                  <TableCell className="mono font-semibold">{etiquetaMes(f.mes)}</TableCell>
                  <TableCell className="num">{f.creditosActivos}</TableCell>
                  <TableCell><Pill tono={TONO_FASE[f.fase]}>{f.fase}</Pill></TableCell>
                  <TableCell className="num">{formatoMoneda(f.esperado)}</TableCell>
                  <TableCell className="num">{f.fase === 'Proyectado' ? '—' : formatoMoneda(f.cobrado)}</TableCell>
                  <TableCell className="num">
                    {f.fase === 'Proyectado' ? '—' : f.pendiente > 0.5
                      ? <b className="text-[var(--crit-ink)]">{formatoMoneda(f.pendiente)}</b>
                      : '—'}
                  </TableCell>
                  <TableCell className="num">
                    {f.fase === 'Proyectado' || efec === null ? '—' : (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[11px] text-muted-foreground">{formatoPorcentaje(efec)}</span>
                        <div className="minibar" style={{ width: 46 }}>
                          <i style={{ width: `${Math.min(100, efec * 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>{flujo.length} meses</TableCell>
              <TableCell className="num">{formatoMoneda(totales.esperado)}</TableCell>
              <TableCell className="num">{formatoMoneda(totales.cobrado)}</TableCell>
              <TableCell className="num">{formatoMoneda(totales.pendiente)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </TableWrap>
    </>
  );
}
