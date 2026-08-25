import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { SecH } from './bloques';
import { Pill } from './pill';
import { useOrden } from './use-orden';
import { formatoFecha, formatoMoneda } from '@/lib/format';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import type { CreditoEstado } from '@/lib/cartera';

/**
 * Deudores: créditos activos con 2 o más cuotas vencidas (`estadoCredito()` en
 * lib/cartera.ts ya calcula ese corte — acá no se persiste ni se recalcula nada nuevo).
 * Misma estructura que la "Lista de llamadas" de Cobranza, pero como vista propia:
 * Cobranza mezcla atraso 1 cuota con 2+, esta es solo el caso grave.
 */

const ACCESORES: Record<string, (c: CreditoEstado) => string | number | null | undefined> = {
  cliente: (c) => c.solicitud.cliente,
  celular: (c) => c.solicitud.celular,
  modelo: (c) => c.solicitud.modelo,
  atraso: (c) => c.atraso,
  cuotasAtraso: (c) => c.cuotasAtraso,
  diasMora: (c) => c.diasMora,
  ultPago: (c) => (c.ultPagoFecha ? c.ultPagoFecha.getTime() : null)
};
const CAMPOS_TEXTO = ['cliente', 'celular', 'modelo'];

export function DeudoresView({ cartera }: { cartera: CreditoEstado[] }) {
  const [q, setQ] = useState('');
  const orden = useOrden<CreditoEstado>(ACCESORES, { inicial: 'atraso', dirInicial: -1, texto: CAMPOS_TEXTO });

  const deudores = useMemo(() => {
    const base = cartera.filter((c) => c.estatus === 'Atraso 2+ cuotas');
    if (!q.trim()) return base;
    const query = q.trim().toLowerCase();
    return base.filter((c) =>
      [c.solicitud.cliente, c.solicitud.celular, c.solicitud.modelo, c.solicitud.curp, c.solicitud.imei]
        .some((v) => (v || '').toLowerCase().includes(query))
    );
  }, [cartera, q]);

  const ordenados = orden.ordenar(deudores);
  const totalVencido = deudores.reduce((s, c) => s + c.atraso, 0);

  const exportar = () => {
    descargar(
      toCSV([
        ['Cliente', 'CURP', 'IMEI', 'Teléfono', 'Equipo', 'Vencido', 'Cuotas de atraso', 'Días de mora', 'Antigüedad en el crédito', 'Último pago'],
        ...ordenados.map((c) => [
          c.solicitud.cliente, c.solicitud.curp || '', c.solicitud.imei || '', c.solicitud.celular, c.solicitud.modelo,
          Math.round(c.atraso * 100) / 100, c.cuotasAtraso.toFixed(1), c.diasMora,
          c.primerVto ? formatoFecha(c.primerVto) : '',
          c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : 'nunca'
        ])
      ]),
      nombreArchivo('deudores')
    );
    toast.success(`${ordenados.length} deudor(es) exportados a CSV.`);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono, modelo, CURP, IMEI…" aria-label="Buscar deudores" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{deudores.length}</b> deudor(es)</span>
        {totalVencido > 0 && <span className="chip"><b className="text-[var(--crit-ink)]">{formatoMoneda(totalVencido)}</b> vencido</span>}
        <button type="button" className="ctl" onClick={exportar} disabled={ordenados.length === 0}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
      </div>

      <SecH titulo="Deudores" nota="créditos activos con 2 o más cuotas vencidas, sin período de gracia" />

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead campo="cliente" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Cliente</SortHead>
              <SortHead campo="celular" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Teléfono</SortHead>
              <SortHead campo="modelo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Equipo</SortHead>
              <SortHead campo="atraso" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Vencido</SortHead>
              <SortHead campo="cuotasAtraso" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Cuotas de atraso</SortHead>
              <SortHead campo="diasMora" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Días de mora</SortHead>
              <SortHead campo="ultPago" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Último pago</SortHead>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenados.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="empty">{q.trim() ? 'Ningún deudor coincide con la búsqueda.' : 'Sin deudores por ahora — nadie con 2 o más cuotas vencidas.'}</div>
                </TableCell>
              </TableRow>
            )}
            {ordenados.map((c) => (
              <TableRow key={c.solicitud.id}>
                <TableCell>
                  <div className="cell-2">
                    <b>{c.solicitud.cliente}</b>
                    <small className="mono">
                      {c.solicitud.curp || 'sin CURP'}{c.solicitud.imei ? ` · IMEI ${c.solicitud.imei}` : ''}
                    </small>
                  </div>
                </TableCell>
                <TableCell>
                  <a href={`https://wa.me/52${c.solicitud.celular}`} target="_blank" rel="noopener noreferrer" className="mono inline-flex items-center gap-1.5 hover:text-primary">
                    <FaWhatsapp className="text-[#25D366]" /> {c.solicitud.celular}
                  </a>
                </TableCell>
                <TableCell>{c.solicitud.modelo}</TableCell>
                <TableCell className="num"><b className="text-[var(--crit-ink)]">{formatoMoneda(c.atraso)}</b></TableCell>
                <TableCell className="num"><Pill tono="c">{c.cuotasAtraso.toFixed(1)}</Pill></TableCell>
                <TableCell className="num">{c.diasMora}</TableCell>
                <TableCell className="num mono">{c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : 'nunca'}</TableCell>
                <TableCell>
                  <Link to={`/sadmin/estado-cuenta/${c.solicitud.id}`} className="ctl" title="Ver estado de cuenta">Ver</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {ordenados.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>{ordenados.length} deudor(es)</TableCell>
                <TableCell className="num">{formatoMoneda(totalVencido)}</TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableWrap>
    </>
  );
}
