import { useMemo, useState } from 'react';
import { BadgeCheck, Download, Search } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { SecH } from './bloques';
import { useOrden } from './use-orden';
import { formatoFecha, formatoMoneda } from '@/lib/format';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import type { CreditoEstado } from '@/lib/cartera';

/**
 * Liquidados: créditos que terminaron de pagarse. Solo consulta — al liquidar el
 * backend libera el CURP solo (ver PersistenceService.liquidarCredito), así que acá no
 * hay ninguna acción que tomar, solo mostrar el historial.
 */

const ACCESORES: Record<string, (c: CreditoEstado) => string | number | null | undefined> = {
  cliente: (c) => c.solicitud.cliente,
  modelo: (c) => c.solicitud.modelo,
  total: (c) => c.enCaja,
  liquidado: (c) => (c.ultPagoFecha ? c.ultPagoFecha.getTime() : null)
};
const CAMPOS_TEXTO = ['cliente', 'modelo'];

export function LiquidadosView({ cartera }: { cartera: CreditoEstado[] }) {
  const [q, setQ] = useState('');
  const orden = useOrden<CreditoEstado>(ACCESORES, { inicial: 'liquidado', dirInicial: -1, texto: CAMPOS_TEXTO });

  const liquidados = useMemo(() => {
    const base = cartera.filter((c) => c.estatus === 'Liquidado');
    if (!q.trim()) return base;
    const query = q.trim().toLowerCase();
    return base.filter((c) =>
      [c.solicitud.cliente, c.solicitud.celular, c.solicitud.modelo, c.solicitud.curp].some((v) => (v || '').toLowerCase().includes(query))
    );
  }, [cartera, q]);

  const ordenados = orden.ordenar(liquidados);
  const totalCobrado = liquidados.reduce((s, c) => s + c.enCaja, 0);

  const exportar = () => {
    descargar(
      toCSV([
        ['Cliente', 'CURP', 'Equipo', 'Total pagado', 'Liquidado el'],
        ...ordenados.map((c) => [
          c.solicitud.cliente, c.solicitud.curp || '', c.solicitud.modelo, Math.round(c.enCaja * 100) / 100,
          c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : ''
        ])
      ]),
      nombreArchivo('liquidados')
    );
    toast.success(`${ordenados.length} crédito(s) liquidados exportados a CSV.`);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono, modelo, CURP…" aria-label="Buscar liquidados" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{liquidados.length}</b> liquidado(s)</span>
        <span className="chip"><b className="text-[var(--good-ink)]">{formatoMoneda(totalCobrado)}</b> cobrado en total</span>
        <button type="button" className="ctl" onClick={exportar} disabled={ordenados.length === 0}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
      </div>

      <SecH titulo="Liquidados" nota="créditos terminados de pagar — el CURP ya quedó libre para pedir otro equipo" />

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead campo="cliente" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Cliente</SortHead>
              <SortHead campo="modelo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Equipo</SortHead>
              <SortHead campo="total" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Total pagado</SortHead>
              <SortHead campo="liquidado" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Liquidado el</SortHead>
              <th>CURP</th>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="empty">{q.trim() ? 'Ningún liquidado coincide con la búsqueda.' : 'Todavía no hay créditos liquidados.'}</div>
                </TableCell>
              </TableRow>
            )}
            {ordenados.map((c) => (
              <TableRow key={c.solicitud.id}>
                <TableCell><b>{c.solicitud.cliente}</b></TableCell>
                <TableCell>{c.solicitud.modelo}</TableCell>
                <TableCell className="num">{formatoMoneda(c.enCaja)}</TableCell>
                <TableCell className="mono">{c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : '—'}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-[var(--good-ink)]">
                    <BadgeCheck className="size-3.5" /> CURP libre
                  </span>
                </TableCell>
                <TableCell>
                  <Link to={`/sadmin/estado-cuenta/${c.solicitud.id}`} className="ctl" title="Ver estado de cuenta">Ver</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {ordenados.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>{ordenados.length} liquidado(s)</TableCell>
                <TableCell className="num">{formatoMoneda(totalCobrado)}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableWrap>
    </>
  );
}
