import { useMemo, useState } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { SecH } from './bloques';
import { Pill } from './pill';
import { useOrden } from './use-orden';
import { formatoFechaHora } from '@/lib/format';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import type { Rechazo, Solicitud } from '@/types';

/**
 * Rechazos: intentos bloqueados porque el CURP ya tenía un crédito activo (ver
 * PersistenceService.registrarRechazo en el backend, enganchado al 2do OTP de
 * confirmar-terminos). El join con la solicitud rechazada se arma acá contra la lista
 * de solicitudes que /sadmin ya tiene cargada — igual que hace lib/cartera.ts con los
 * pagos, no hay fetch nuevo por esto.
 */

const ETIQUETA_MOTIVO: Record<string, string> = {
  curp_con_credito_activo: 'CURP con crédito activo'
};

interface Fila {
  rechazo: Rechazo;
  solicitud: Solicitud | null;
}

const ACCESORES: Record<string, (f: Fila) => string | number | null | undefined> = {
  fecha: (f) => new Date(f.rechazo.creadoAt).getTime(),
  cliente: (f) => f.solicitud?.cliente,
  curp: (f) => f.rechazo.curp,
  motivo: (f) => ETIQUETA_MOTIVO[f.rechazo.motivo] || f.rechazo.motivo
};
const CAMPOS_TEXTO = ['cliente', 'curp', 'motivo'];

interface RechazosViewProps {
  rechazos: Rechazo[];
  solicitudes: Solicitud[];
}

export function RechazosView({ rechazos, solicitudes }: RechazosViewProps) {
  const [q, setQ] = useState('');
  const orden = useOrden<Fila>(ACCESORES, { inicial: 'fecha', dirInicial: -1, texto: CAMPOS_TEXTO });

  const porSolicitud = useMemo(() => {
    const m = new Map<string, Solicitud>();
    for (const s of solicitudes) m.set(s.id, s);
    return m;
  }, [solicitudes]);

  const filas = useMemo(() => {
    const base: Fila[] = rechazos.map((r) => ({ rechazo: r, solicitud: r.solicitudId ? porSolicitud.get(r.solicitudId) || null : null }));
    if (!q.trim()) return base;
    const query = q.trim().toLowerCase();
    return base.filter((f) =>
      [f.solicitud?.cliente, f.solicitud?.celular, f.rechazo.curp, f.rechazo.detalle].some((v) => (v || '').toLowerCase().includes(query))
    );
  }, [rechazos, porSolicitud, q]);

  const ordenadas = orden.ordenar(filas);

  const exportar = () => {
    descargar(
      toCSV([
        ['Fecha', 'Cliente', 'Teléfono', 'CURP', 'Motivo', 'Detalle'],
        ...ordenadas.map((f) => [
          formatoFechaHora(f.rechazo.creadoAt), f.solicitud?.cliente || '', f.solicitud?.celular || '',
          f.rechazo.curp, ETIQUETA_MOTIVO[f.rechazo.motivo] || f.rechazo.motivo, f.rechazo.detalle || ''
        ])
      ]),
      nombreArchivo('rechazos')
    );
    toast.success(`${ordenadas.length} rechazo(s) exportados a CSV.`);
  };

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono, CURP…" aria-label="Buscar rechazos" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{filas.length}</b> rechazo(s)</span>
        <button type="button" className="ctl" onClick={exportar} disabled={ordenadas.length === 0}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
      </div>

      <SecH titulo="Rechazos" nota="intentos bloqueados por CURP con un crédito activo" />

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead campo="fecha" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Fecha</SortHead>
              <SortHead campo="cliente" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Cliente</SortHead>
              <SortHead campo="curp" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>CURP</SortHead>
              <SortHead campo="motivo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Motivo</SortHead>
              <th>Detalle</th>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordenadas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="empty">{q.trim() ? 'Ningún rechazo coincide con la búsqueda.' : 'Sin rechazos por ahora — nadie intentó un segundo crédito con el mismo CURP.'}</div>
                </TableCell>
              </TableRow>
            )}
            {ordenadas.map((f) => (
              <TableRow key={f.rechazo.id}>
                <TableCell className="mono">{formatoFechaHora(f.rechazo.creadoAt)}</TableCell>
                <TableCell>
                  <div className="cell-2">
                    <b>{f.solicitud?.cliente || 'Solicitud eliminada'}</b>
                    {f.solicitud?.celular && <small className="mono">{f.solicitud.celular}</small>}
                  </div>
                </TableCell>
                <TableCell className="mono">{f.rechazo.curp}</TableCell>
                <TableCell><Pill tono="c">{ETIQUETA_MOTIVO[f.rechazo.motivo] || f.rechazo.motivo}</Pill></TableCell>
                <TableCell className="text-[12.8px] text-muted-foreground">{f.rechazo.detalle || '—'}</TableCell>
                <TableCell>
                  {f.rechazo.creditoSolicitudId && (
                    <Link to={`/sadmin/estado-cuenta/${f.rechazo.creditoSolicitudId}`} className="ctl" title="Ver el crédito que causó el bloqueo">
                      <FileText strokeWidth={1.7} /> Ver crédito
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {ordenadas.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>{ordenadas.length} rechazo(s)</TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableWrap>
    </>
  );
}
