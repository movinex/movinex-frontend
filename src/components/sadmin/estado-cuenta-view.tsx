import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Printer, Search, ArrowLeft, Copy, Link as LinkIcon, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap } from '@/components/ui/table';
import { Kpi, Kpis, Panel, SecH } from './bloques';
import { Pill, type TonoPill } from './pill';
import { formatoFecha, formatoMoneda, formatoPorcentaje } from '@/lib/format';
import { getMetodoPagoLabel } from '@/lib/solicitudes';
import type { Cuota, CreditoEstado } from '@/lib/cartera';

const TONO_CUOTA: Record<Cuota['estatus'], TonoPill> = {
  Pagada: 'ok',
  Vencida: 'c',
  'Por vencer': 'n'
};

export function EstadoCuentaView({
  cartera,
  onGenerarLinkPago
}: {
  cartera: CreditoEstado[];
  onGenerarLinkPago?: (id: string, metodo: 'card' | 'oxxo') => Promise<string>;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [generandoLink, setGenerandoLink] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const credito = useMemo(() => cartera.find((c) => c.solicitud.id === id), [cartera, id]);

  if (!id || !credito) {
    return <Selector cartera={cartera} q={q} setQ={setQ} noEncontrado={Boolean(id)} />;
  }

  const s = credito.solicitud;
  const pagosReales = credito.pagos.filter((p) => p.estado === 'pagado');
  const fallidos = credito.pagos.filter((p) => p.estado === 'fallido');

  const mensajeWhatsapp = () => {
    const texto =
      `Hola ${s.cliente}, te comparto el estado de tu crédito Movinex (${s.modelo}):\n\n` +
      `• Cuotas pagadas: ${credito.cuotasCubiertas} de ${s.semanas}\n` +
      `• Cuota semanal: ${formatoMoneda(Number(s.pagoSemanal))}\n` +
      `• Saldo por pagar: ${formatoMoneda(credito.saldo)}\n` +
      (credito.atraso > 0.5 ? `• Vencido a la fecha: ${formatoMoneda(credito.atraso)}\n` : '') +
      (credito.proxVto ? `• Próximo pago: ${formatoFecha(credito.proxVto)}\n` : '');
    navigator.clipboard.writeText(texto);
    toast.success('Resumen copiado — listo para mandar por WhatsApp.');
  };

  const metodo = s.metodoPagoEnganche;
  const esSpei = metodo === 'customer_balance';
  const puedeGenerarLink =
    credito.estatus !== 'Liquidado' &&
    ((esSpei && Boolean(s.stripeClabeReferencia)) ||
      (Boolean(onGenerarLinkPago) && (metodo === 'card' || metodo === 'oxxo')));

  const handleGenerarLink = async () => {
    // SPEI: no genera un link nuevo, solo copia la CLABE persistente que el
    // cliente reutiliza cada semana.
    if (esSpei) {
      if (!s.stripeClabeReferencia) return;
      try {
        await navigator.clipboard.writeText(s.stripeClabeReferencia);
        setLinkCopiado(true);
        toast.success('CLABE copiada — mandala por WhatsApp.');
        setTimeout(() => setLinkCopiado(false), 2500);
      } catch {
        toast.error('No se pudo copiar la CLABE.');
      }
      return;
    }

    if (!onGenerarLinkPago || (metodo !== 'card' && metodo !== 'oxxo')) return;
    setGenerandoLink(true);
    try {
      const url = await onGenerarLinkPago(s.id, metodo);
      await navigator.clipboard.writeText(url);
      setLinkCopiado(true);
      toast.success('Link de pago copiado — mandalo por WhatsApp.');
      setTimeout(() => setLinkCopiado(false), 2500);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo generar el link de pago.');
    } finally {
      setGenerandoLink(false);
    }
  };

  return (
    <>
      {/* La barra de acciones no se imprime: en papel solo va el estado de cuenta. */}
      <div className="noprint mb-4 flex flex-wrap items-center gap-2">
        <button type="button" className="ctl" onClick={() => navigate('/sadmin/estado-cuenta')}>
          <ArrowLeft strokeWidth={1.7} />
          Elegir otro crédito
        </button>
        <span className="flex-1" />
        <button type="button" className="ctl" onClick={mensajeWhatsapp}>
          <Copy strokeWidth={1.7} />
          Copiar resumen
        </button>
        <a href={`https://wa.me/52${s.celular}`} target="_blank" rel="noopener noreferrer" className="ctl">
          <FaWhatsapp className="text-[#25D366]" />
          Escribirle
        </a>
        {puedeGenerarLink && (
          <button type="button" className="ctl" disabled={generandoLink} onClick={handleGenerarLink}>
            {linkCopiado
              ? (<><Check strokeWidth={1.7} /> {esSpei ? 'CLABE copiada' : 'Link copiado'}</>)
              : (<><LinkIcon strokeWidth={1.7} /> {generandoLink ? 'Generando…' : (esSpei ? 'Copiar CLABE' : 'Link de pago')}</>)}
          </button>
        )}
        <button type="button" className="ctl" onClick={() => window.print()}>
          <Printer strokeWidth={1.7} />
          Imprimir
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[19px] font-semibold tracking-[-.35px]">{s.cliente}</h2>
          <p className="mono text-[12px] text-muted-foreground">
            {s.modelo} · {s.semanas} semanas · {getMetodoPagoLabel(s.metodoPagoEnganche) || 'sin método'}
            {s.curp ? ` · ${s.curp}` : ''}
          </p>
        </div>
        <Pill tono={credito.estatus.startsWith('Atraso') ? 'c' : credito.estatus === 'Liquidado' ? 'i' : credito.estatus === 'Por activar' ? 'n' : 'ok'}>
          {credito.estatus}
        </Pill>
      </div>

      <Kpis>
        <Kpi
          label="Avance"
          valor={`${credito.cuotasCubiertas} / ${s.semanas}`}
          pie={`${formatoPorcentaje(credito.avance)} del plan cobrado`}
        />
        <Kpi label="Cuota semanal" valor={formatoMoneda(Number(s.pagoSemanal))} pie={`Enganche ${formatoMoneda(Number(s.enganche))}`} />
        <Kpi label="Saldo por pagar" valor={formatoMoneda(credito.saldo)} pie={`De un plan de ${formatoMoneda(credito.total)}`} />
        <Kpi
          label="Vencido"
          valor={formatoMoneda(credito.atraso)}
          pie={credito.diasMora > 0 ? `${credito.diasMora} días de mora` : 'Sin cuotas vencidas sin cubrir'}
          tono={credito.atraso > 0.5 ? 'critical' : 'default'}
        />
      </Kpis>

      {fallidos.length > 0 && (
        <div className="banner w mt-4">
          <div>
            <b>{fallidos.length} intento(s) de cobro rechazado(s).</b> La tarjeta del cliente
            rebotó — conviene mandarle el link de pago manual desde Cobranza.
          </div>
        </div>
      )}

      <SecH titulo="Calendario de pagos" nota={`${credito.cuotasCubiertas} pagadas · ${credito.cuotasVencidas - credito.cuotasCubiertas > 0 ? credito.cuotasVencidas - credito.cuotasCubiertas : 0} vencidas · ${s.semanas - credito.cuotasVencidas} por vencer`} />
      <TableWrap maxHeight="520px">
        <Table>
          <TableHeader>
            <TableRow>
              <th className="num">#</th>
              <th>Vence</th>
              <th className="num">Monto</th>
              <th className="num">Aplicado</th>
              <th>Estado</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credito.cuotas.map((c) => (
              <TableRow key={c.numero}>
                <TableCell className="num font-semibold">{c.numero}</TableCell>
                <TableCell className="mono">{formatoFecha(c.vence)}</TableCell>
                <TableCell className="num">{formatoMoneda(c.monto)}</TableCell>
                <TableCell className="num">{c.aplicado > 0 ? formatoMoneda(c.aplicado) : '—'}</TableCell>
                <TableCell><Pill tono={TONO_CUOTA[c.estatus]}>{c.estatus}</Pill></TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>{credito.cuotas.length} cuotas</TableCell>
              <TableCell className="num">{formatoMoneda(credito.total)}</TableCell>
              <TableCell className="num">{formatoMoneda(credito.cobrado)}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </TableWrap>

      <SecH titulo="Movimientos" nota={`${pagosReales.length} cobro(s) acreditado(s)`} />
      {credito.pagos.length === 0 ? (
        <Panel><div className="empty">Todavía no hay ningún cobro registrado.</div></Panel>
      ) : (
        <TableWrap maxHeight="none">
          <Table>
            <TableHeader>
              <TableRow>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Método</th>
                <th className="num">Monto</th>
                <th>Estado</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credito.pagos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="mono">{formatoFecha(p.fecha)}</TableCell>
                  <TableCell>{p.tipo === 'enganche' ? 'Enganche' : `Cuota semanal${p.numeroSemana ? ` #${p.numeroSemana}` : ''}`}</TableCell>
                  <TableCell>{getMetodoPagoLabel(p.metodo as any) || p.metodo || '—'}</TableCell>
                  <TableCell className="num">{formatoMoneda(p.monto)}</TableCell>
                  <TableCell>
                    <Pill tono={p.estado === 'pagado' ? 'ok' : p.estado === 'fallido' ? 'c' : 'w'}>{p.estado}</Pill>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total acreditado</TableCell>
                <TableCell className="num">{formatoMoneda(credito.enCaja)}</TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          </Table>
        </TableWrap>
      )}
    </>
  );
}

/** Buscador de crédito cuando se entra a la vista sin un id en la URL. */
function Selector({
  cartera, q, setQ, noEncontrado
}: { cartera: CreditoEstado[]; q: string; setQ: (v: string) => void; noEncontrado: boolean }) {
  const navigate = useNavigate();
  const conCredito = cartera.filter((c) => c.estatus !== 'Por activar');
  const filtrados = q.trim()
    ? conCredito.filter((c) =>
        [c.solicitud.cliente, c.solicitud.celular, c.solicitud.curp, c.solicitud.modelo]
          .some((v) => (v || '').toLowerCase().includes(q.trim().toLowerCase())))
    : conCredito;

  return (
    <>
      {noEncontrado && (
        <div className="banner w mb-4">
          <div>Ese crédito ya no está en la lista — puede haberse cancelado. Elegí otro.</div>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono, CURP o modelo…" aria-label="Buscar crédito" />
        </div>
        <span className="flex-1" />
        <span className="chip"><b>{filtrados.length}</b> de {conCredito.length} créditos</span>
      </div>

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <th>Cliente</th>
              <th>Equipo</th>
              <th className="num">Avance</th>
              <th className="num">Saldo</th>
              <th className="num">Vencido</th>
              <th>Estatus</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="empty">
                    {conCredito.length === 0
                      ? 'Todavía no hay ningún crédito activado.'
                      : 'Ningún crédito coincide con la búsqueda.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {filtrados.map((c) => (
              <TableRow key={c.solicitud.id} className="clk" onClick={() => navigate(`/sadmin/estado-cuenta/${c.solicitud.id}`)}>
                <TableCell>
                  <div className="cell-2">
                    <b>{c.solicitud.cliente}</b>
                    <small className="mono">{c.solicitud.celular}</small>
                  </div>
                </TableCell>
                <TableCell>{c.solicitud.modelo}</TableCell>
                <TableCell className="num">{c.cuotasCubiertas} / {c.solicitud.semanas}</TableCell>
                <TableCell className="num">{formatoMoneda(c.saldo)}</TableCell>
                <TableCell className="num">
                  {c.atraso > 0.5 ? <b className="text-[var(--crit-ink)]">{formatoMoneda(c.atraso)}</b> : '—'}
                </TableCell>
                <TableCell>
                  <Pill tono={c.estatus.startsWith('Atraso') ? 'c' : c.estatus === 'Liquidado' ? 'i' : 'ok'}>{c.estatus}</Pill>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableWrap>
    </>
  );
}
