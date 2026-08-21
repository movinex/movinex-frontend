import { useMemo, useState } from 'react';
import { Check, Download, Link as LinkIcon, Search, Send, FileText } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Kpi, Kpis, Panel, PanelH, SecH } from './bloques';
import { Pill, type TonoPill } from './pill';
import { useOrden } from './use-orden';
import { AgingChart, BrechaChart } from './charts';
import { formatoFecha, formatoMoneda } from '@/lib/format';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import { calendario, kpis as calcularKpis, type Bucket, type CreditoEstado } from '@/lib/cartera';
import { getMetodoPagoLabel } from '@/lib/solicitudes';

const TONO_BUCKET: Record<Bucket, TonoPill> = {
  'Al corriente': 'ok', '1-30': 'w', '31-60': 's', '61-90': 'c', '90+': 'c', 'n/a': 'n'
};

const ETIQUETA_BUCKET: Record<Bucket, string> = {
  'Al corriente': 'Al corriente',
  '1-30': '1 – 30 días',
  '31-60': '31 – 60 días',
  '61-90': '61 – 90 días',
  '90+': 'Más de 90 días',
  'n/a': '—'
};

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MS_DIA = 86_400_000;

/** Días entre hoy y una fecha, en días de calendario. */
function enCuantosDias(fecha: Date, hoy = new Date()): number {
  const a = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const b = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((a - b) / MS_DIA);
}

const ACCESORES: Record<string, (c: CreditoEstado) => string | number | null | undefined> = {
  cliente: (c) => c.solicitud.cliente,
  celular: (c) => c.solicitud.celular,
  modelo: (c) => c.solicitud.modelo,
  avance: (c) => c.avance,
  cuota: (c) => Number(c.solicitud.pagoSemanal || 0),
  atraso: (c) => c.atraso,
  diasMora: (c) => c.diasMora,
  proxVto: (c) => (c.proxVto ? c.proxVto.getTime() : null),
  ultPago: (c) => (c.ultPagoFecha ? c.ultPagoFecha.getTime() : null)
};
const CAMPOS_TEXTO = ['cliente', 'celular', 'modelo'];

interface CobranzaViewProps {
  cartera: CreditoEstado[];
  onProcesarRecordatorios: () => Promise<void>;
  onGenerarLinkTarjeta: (id: string) => Promise<string>;
}

export function CobranzaView({ cartera, onProcesarRecordatorios, onGenerarLinkTarjeta }: CobranzaViewProps) {
  const [q, setQ] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [generandoLinkId, setGenerandoLinkId] = useState<string | null>(null);
  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null);

  const orden = useOrden<CreditoEstado>(ACCESORES, { inicial: 'proxVto', dirInicial: 1, texto: CAMPOS_TEXTO });

  const kpi = useMemo(() => calcularKpis(cartera), [cartera]);
  const flujo = useMemo(() => calendario(cartera), [cartera]);

  const activos = useMemo(() => {
    const base = cartera.filter((c) => c.estatus !== 'Por activar' && c.estatus !== 'Liquidado');
    if (!q.trim()) return base;
    const query = q.trim().toLowerCase();
    return base.filter((c) =>
      [c.solicitud.cliente, c.solicitud.celular, c.solicitud.modelo, c.solicitud.curp, c.solicitud.imei]
        .some((v) => (v || '').toLowerCase().includes(query))
    );
  }, [cartera, q]);

  // Lista de llamadas: solo lo vencido, priorizado por monto × días — lo que más duele
  // y hace más tiempo primero. Mismo criterio que autovía.
  const llamadas = useMemo(
    () => activos.filter((c) => c.atraso > 0.5).sort((a, b) => b.atraso * (b.diasMora + 1) - a.atraso * (a.diasMora + 1)),
    [activos]
  );

  // Los que están al corriente y les toca pagar pronto.
  const proximos = useMemo(() => {
    const limite = Date.now() + 14 * MS_DIA;
    return activos
      .filter((c) => c.proxVto && c.proxVto.getTime() <= limite && c.atraso <= 0.5)
      .sort((a, b) => (a.proxVto!.getTime() - b.proxVto!.getTime()));
  }, [activos]);

  const todos = orden.ordenar(activos);

  const handleProcesar = async () => {
    setEnviando(true);
    try {
      await onProcesarRecordatorios();
      toast.success('Recordatorios de cobranza semanal enviados.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron enviar los recordatorios.');
    } finally {
      setEnviando(false);
    }
  };

  const handleGenerarLink = async (id: string) => {
    setGenerandoLinkId(id);
    try {
      const url = await onGenerarLinkTarjeta(id);
      await navigator.clipboard.writeText(url);
      setLinkCopiadoId(id);
      toast.success('Link de pago copiado — mandalo por WhatsApp.');
      setTimeout(() => setLinkCopiadoId((actual) => (actual === id ? null : actual)), 2500);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo generar el link de pago.');
    } finally {
      setGenerandoLinkId(null);
    }
  };

  const exportar = () => {
    descargar(
      toCSV([
        ['Cliente', 'CURP', 'Teléfono', 'Equipo', 'IMEI', 'Cuotas cubiertas', 'Plazo', 'Cuota', 'Vencido', 'Días de mora', 'Antigüedad', 'Próx. vencimiento', 'Último pago', 'Método', 'Estatus'],
        ...todos.map((c) => [
          c.solicitud.cliente, c.solicitud.curp || '', c.solicitud.celular, c.solicitud.modelo, c.solicitud.imei || '',
          c.cuotasCubiertas, c.solicitud.semanas, Number(c.solicitud.pagoSemanal || 0),
          Math.round(c.atraso * 100) / 100, c.diasMora, ETIQUETA_BUCKET[c.bucket],
          c.proxVto ? formatoFecha(c.proxVto) : '',
          c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : 'nunca',
          getMetodoPagoLabel(c.solicitud.metodoPagoEnganche) || '', c.estatus
        ])
      ]),
      nombreArchivo('cobranza')
    );
    toast.success(`${todos.length} crédito(s) exportados a CSV.`);
  };

  const AccionesCredito = ({ c }: { c: CreditoEstado }) => (
    <div className="flex justify-end gap-1">
      <Link to={`/sadmin/estado-cuenta/${c.solicitud.id}`} className="ctl" title="Ver estado de cuenta">
        <FileText strokeWidth={1.7} />
      </Link>
      {c.solicitud.metodoPagoEnganche === 'card' && (
        <button type="button" className="ctl" disabled={generandoLinkId === c.solicitud.id} onClick={() => handleGenerarLink(c.solicitud.id)}>
          {linkCopiadoId === c.solicitud.id
            ? (<><Check strokeWidth={1.7} /> Copiado</>)
            : (<><LinkIcon strokeWidth={1.7} /> {generandoLinkId === c.solicitud.id ? 'Generando…' : 'Link'}</>)}
        </button>
      )}
    </div>
  );

  const CeldaCliente = ({ c }: { c: CreditoEstado }) => (
    <TableCell>
      <div className="cell-2">
        <b>{c.solicitud.cliente}</b>
        {/* CURP e IMEI a la vista para identificar y bloquear el equipo sin abrir el
            detalle (pedido de Eduardo). */}
        <small className="mono">
          {c.solicitud.curp || 'sin CURP'}{c.solicitud.imei ? ` · IMEI ${c.solicitud.imei}` : ''}
        </small>
      </div>
    </TableCell>
  );

  const CeldaTelefono = ({ c }: { c: CreditoEstado }) => (
    <TableCell>
      <a href={`https://wa.me/52${c.solicitud.celular}`} target="_blank" rel="noopener noreferrer" className="mono inline-flex items-center gap-1.5 hover:text-primary">
        <FaWhatsapp className="text-[#25D366]" /> {c.solicitud.celular}
      </a>
    </TableCell>
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono, modelo, CURP, IMEI…" aria-label="Buscar en cobranza" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{activos.length}</b> créditos activos</span>
        {kpi.atraso > 0.5 && (
          <span className="chip"><b className="text-[var(--crit-ink)]">{formatoMoneda(kpi.atraso)}</b> vencido</span>
        )}
        <button type="button" className="ctl" onClick={exportar} disabled={todos.length === 0}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
        <Button size="sm" disabled={enviando} onClick={handleProcesar}>
          <Send className="size-4" />
          {enviando ? 'Enviando...' : 'Enviar recordatorios'}
        </Button>
      </div>

      {/* ---------- Antigüedad de saldos ---------- */}
      <SecH titulo="Antigüedad de saldos" nota="días vencidos desde la fecha de cada cuota, sin período de gracia" />
      <Kpis>
        {kpi.aging.map((a) => (
          <Kpi
            key={a.bucket}
            label={ETIQUETA_BUCKET[a.bucket]}
            valor={a.n}
            pie={a.bucket === 'Al corriente' ? `${formatoMoneda(a.monto)} de saldo vigente` : `${formatoMoneda(a.monto)} vencido`}
            tono={a.n > 0 && a.bucket !== 'Al corriente' ? (a.bucket === '1-30' ? 'warning' : 'critical') : 'default'}
          />
        ))}
      </Kpis>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelH
            titulo="Distribución del saldo por antigüedad"
            descripcion="¿Cuánto del saldo está sano y cuánto empieza a envejecer? Un saldo que cruza los 90 días rara vez se recupera completo."
          />
          <div className="px-[18px] pb-[18px] pt-3.5"><AgingChart datos={kpi.aging} /></div>
        </Panel>
        <Panel>
          <PanelH
            titulo="Brecha mensual de cobranza"
            descripcion="Lo que debió entrar contra lo que entró, mes a mes. La franja naranja es lo que quedó pendiente."
          />
          <div className="px-[18px] pb-[18px] pt-3.5"><BrechaChart datos={flujo} /></div>
        </Panel>
      </div>

      {/* ---------- 1. Los que deben ---------- */}
      <SecH
        titulo="Lista de llamadas"
        nota={`${llamadas.length} cuenta(s) con importe vencido · ordenadas por monto × días`}
      />
      {llamadas.length === 0 ? (
        <Panel><div className="empty">Ninguna cuenta con importe vencido a la fecha.</div></Panel>
      ) : (
        <TableWrap maxHeight="none">
          <Table>
            <TableHeader>
              <TableRow>
                <th className="num">#</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Equipo</th>
                <th className="num">Cuota</th>
                <th className="num">Vencido</th>
                <th className="num">Cuotas</th>
                <th className="num">Días de mora</th>
                <th>Antigüedad</th>
                <th className="num">Último pago</th>
                <th />
              </TableRow>
            </TableHeader>
            <TableBody>
              {llamadas.map((c, i) => (
                <TableRow key={c.solicitud.id}>
                  <TableCell className="num"><Pill tono={i < 3 ? 'c' : i < 8 ? 's' : 'n'}>{i + 1}</Pill></TableCell>
                  <CeldaCliente c={c} />
                  <CeldaTelefono c={c} />
                  <TableCell>{c.solicitud.modelo}</TableCell>
                  <TableCell className="num">{formatoMoneda(Number(c.solicitud.pagoSemanal))}</TableCell>
                  <TableCell className="num"><b className="text-[var(--crit-ink)]">{formatoMoneda(c.atraso)}</b></TableCell>
                  <TableCell className="num">{c.cuotasAtraso.toFixed(1)}</TableCell>
                  <TableCell className="num">{c.diasMora}</TableCell>
                  <TableCell><Pill tono={TONO_BUCKET[c.bucket]}>{ETIQUETA_BUCKET[c.bucket]}</Pill></TableCell>
                  <TableCell className="num mono">{c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : 'nunca'}</TableCell>
                  <TableCell><AccionesCredito c={c} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>{llamadas.length} cuenta(s)</TableCell>
                <TableCell className="num">{formatoMoneda(llamadas.reduce((s, c) => s + c.atraso, 0))}</TableCell>
                <TableCell colSpan={5} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableWrap>
      )}

      {/* ---------- 2. Los que están al corriente y les toca pronto ---------- */}
      <SecH
        titulo="Vencimientos de los próximos 14 días"
        nota={`${proximos.length} cuota(s) · ${formatoMoneda(proximos.reduce((s, c) => s + c.proxMonto, 0))}`}
      />
      {proximos.length === 0 ? (
        <Panel><div className="empty">Sin vencimientos en los próximos 14 días.</div></Panel>
      ) : (
        <TableWrap maxHeight="420px">
          <Table>
            <TableHeader>
              <TableRow>
                <th>Vence</th>
                <th>Día</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Equipo</th>
                <th className="num">Monto</th>
                <th className="num">Cuota</th>
                <th>Estatus</th>
                <th />
              </TableRow>
            </TableHeader>
            <TableBody>
              {proximos.map((c) => {
                const dias = enCuantosDias(c.proxVto!);
                return (
                  <TableRow key={c.solicitud.id}>
                    <TableCell className="mono font-semibold">{formatoFecha(c.proxVto!)}</TableCell>
                    <TableCell>
                      <span className={`tag ${dias <= 3 ? 'w' : 'n'}`}>{dias === 0 ? 'hoy' : `en ${dias} d`}</span>{' '}
                      <span className="text-[11.5px] text-muted-foreground">{DIAS_SEMANA[c.proxVto!.getDay()]}</span>
                    </TableCell>
                    <CeldaCliente c={c} />
                    <CeldaTelefono c={c} />
                    <TableCell>{c.solicitud.modelo}</TableCell>
                    <TableCell className="num">{formatoMoneda(c.proxMonto)}</TableCell>
                    <TableCell className="num">{c.cuotasCubiertas + 1} / {c.solicitud.semanas}</TableCell>
                    <TableCell><Pill tono="ok">{c.estatus}</Pill></TableCell>
                    <TableCell><AccionesCredito c={c} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5}>{proximos.length} cuota(s)</TableCell>
                <TableCell className="num">{formatoMoneda(proximos.reduce((s, c) => s + c.proxMonto, 0))}</TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableWrap>
      )}

      {/* ---------- 3. Todos los que van pagando ---------- */}
      <SecH
        titulo="Todos los créditos activos"
        nota={`${todos.length} en curso · ${formatoMoneda(kpi.ingresoSemanal)} por semana`}
      />
      <TableWrap maxHeight="520px">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead campo="cliente" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Cliente</SortHead>
              <SortHead campo="celular" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Teléfono</SortHead>
              <SortHead campo="modelo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Equipo</SortHead>
              <SortHead campo="avance" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Avance</SortHead>
              <SortHead campo="cuota" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Cuota</SortHead>
              <SortHead campo="atraso" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Vencido</SortHead>
              <SortHead campo="proxVto" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Próx. vto.</SortHead>
              <SortHead campo="ultPago" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Último pago</SortHead>
              <th>Estatus</th>
              <th />
            </TableRow>
          </TableHeader>
          <TableBody>
            {todos.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
                  <div className="empty">
                    {q.trim() ? 'Ningún crédito coincide con la búsqueda.' : 'Todavía no hay créditos activos.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {todos.map((c) => (
              <TableRow key={c.solicitud.id}>
                <CeldaCliente c={c} />
                <CeldaTelefono c={c} />
                <TableCell>
                  <div className="cell-2">
                    <span>{c.solicitud.modelo}</span>
                    <small>{getMetodoPagoLabel(c.solicitud.metodoPagoEnganche) || 'sin método'}</small>
                  </div>
                </TableCell>
                <TableCell className="num">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[11px] text-muted-foreground">{c.cuotasCubiertas}/{c.solicitud.semanas}</span>
                    <div className="minibar" style={{ width: 46 }}>
                      <i style={{ width: `${Math.min(100, c.avance * 100)}%` }} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="num">{formatoMoneda(Number(c.solicitud.pagoSemanal))}</TableCell>
                <TableCell className="num">
                  {c.atraso > 0.5 ? <b className="text-[var(--crit-ink)]">{formatoMoneda(c.atraso)}</b> : '—'}
                </TableCell>
                <TableCell className="mono">{c.proxVto ? formatoFecha(c.proxVto) : '—'}</TableCell>
                <TableCell className="mono">{c.ultPagoFecha ? formatoFecha(c.ultPagoFecha) : 'nunca'}</TableCell>
                <TableCell><Pill tono={TONO_BUCKET[c.bucket]}>{c.estatus}</Pill></TableCell>
                <TableCell><AccionesCredito c={c} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
          {todos.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4}>{todos.length} créditos</TableCell>
                <TableCell className="num">{formatoMoneda(kpi.ingresoSemanal)}</TableCell>
                <TableCell className="num">{kpi.atraso > 0.5 ? formatoMoneda(kpi.atraso) : '—'}</TableCell>
                <TableCell colSpan={4} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableWrap>
    </>
  );
}
