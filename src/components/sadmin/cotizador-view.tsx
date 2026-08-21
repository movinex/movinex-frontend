import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, Copy, Trash2, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Panel, SecH } from './bloques';
import { cn } from '@/lib/utils';
import { calcularCotizacion, primerPagoSugerido } from '@/lib/amortizacion';
import { formatoMoneda, formatoPorcentaje, formatoFecha } from '@/lib/format';
import type { Configuracion } from '@/types';

const MARCAS = ['Samsung', 'Motorola', 'Xiaomi', 'Redmi', 'Oppo', 'Otro'];

const CONFIG_DEFAULT: Configuracion = {
  enganchePct: 0.15,
  tasaAnualPct: 2.28,
  ivaPct: 0.16,
  cargoSemanalNombre: 'Servicio de Seguridad y Bloqueo',
  cargoSemanalMonto: 17
};

interface CotizacionGuardada {
  id: string;
  marca: string;
  modelo: string;
  almacenamiento_color: string | null;
  precio_contado: number;
  plazo_semanas: number;
  enganche: number;
  pago_semanal: number;
  created_at: string;
}

interface CotizadorViewProps {
  configuracion: Configuracion | null;
  backendUrl: string;
  adminToken: string | null;
}

export function CotizadorView({ configuracion, backendUrl, adminToken }: CotizadorViewProps) {
  const parametros = configuracion || CONFIG_DEFAULT;

  const [marca, setMarca] = useState(MARCAS[0]);
  const [modelo, setModelo] = useState('');
  const [almacenamientoColor, setAlmacenamientoColor] = useState('');
  const [precioContado, setPrecioContado] = useState('2999');
  const [plazoSemanas, setPlazoSemanas] = useState<26 | 52>(26);
  const [guardando, setGuardando] = useState(false);
  const [recientes, setRecientes] = useState<CotizacionGuardada[]>([]);

  const precio = Number(precioContado) || 0;
  const fechaPrimerPago = useMemo(() => primerPagoSugerido(new Date()), []);

  const resultado = useMemo(() => {
    if (precio <= 0) return null;
    return calcularCotizacion({ precioContado: precio, plazoSemanas, fechaPrimerPago, parametros });
  }, [precio, plazoSemanas, fechaPrimerPago, parametros]);

  const comparativo = useMemo(() => {
    if (precio <= 0) return null;
    return [26, 52].map((plazo) => calcularCotizacion({ precioContado: precio, plazoSemanas: plazo, fechaPrimerPago, parametros }));
  }, [precio, fechaPrimerPago, parametros]);

  const cargarRecientes = () => {
    if (!adminToken) return;
    fetch(`${backendUrl}/api/admin/cotizaciones`, { headers: { Authorization: `Bearer ${adminToken}` } })
      .then((res) => res.json())
      .then(setRecientes)
      .catch((err) => console.error('Error al cargar cotizaciones recientes:', err));
  };

  useEffect(cargarRecientes, [adminToken, backendUrl]);

  const handleGuardar = async () => {
    if (!modelo.trim() || !resultado) {
      toast.error('Escribe el modelo del equipo antes de guardar.');
      return;
    }
    setGuardando(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({
          marca, modelo, almacenamientoColor,
          precioContado: precio, plazoSemanas,
          enganche: resultado.enganche, pagoSemanal: resultado.pagoTotalSemanal
        })
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || 'No se pudo guardar la cotización.');
      toast.success('Cotización guardada.');
      cargarRecientes();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la cotización.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarMensaje = () => {
    if (!modelo.trim() || !resultado) {
      toast.error('Escribe el modelo del equipo antes de generar el mensaje.');
      return;
    }
    const equipo = `${marca} ${modelo}${almacenamientoColor ? ` (${almacenamientoColor})` : ''}`;
    const mensaje = `¡Hola! Te comparto tu cotización para el ${equipo}:\n\n` +
      `• Enganche: ${formatoMoneda(resultado.enganche)}\n` +
      `• ${plazoSemanas} pagos semanales de ${formatoMoneda(resultado.pagoTotalSemanal)}\n\n` +
      `Para continuar, entrá a movinex.mx, elegí el ${modelo} y seguí los pasos — cualquier duda me escribís por acá. 😊`;
    navigator.clipboard.writeText(mensaje);
    toast.success('Mensaje copiado — el cliente igual completa el flujo real (OTP, pago y verificación) en movinex.mx.');
  };

  const handleEliminar = async (id: string) => {
    try {
      await fetch(`${backendUrl}/api/admin/cotizaciones/${id}`, {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      });
      toast.success('Cotización eliminada.');
      cargarRecientes();
    } catch {
      toast.error('No se pudo eliminar la cotización.');
    }
  };

  const totalesTabla = resultado
    ? resultado.tabla.reduce(
        (acc, f) => ({
          interes: acc.interes + f.interes + f.ivaInteres,
          capital: acc.capital + f.capital,
          cargo: acc.cargo + f.cargoServicio + f.ivaCargo,
          pago: acc.pago + f.pagoTotal
        }),
        { interes: 0, capital: 0, cargo: 0, pago: 0 }
      )
    : null;

  return (
    <>
      <div className="banner i mb-4">
        <div className="bi"><Info strokeWidth={1.8} className="size-full" /></div>
        <div>
          Mismas reglas que Movinex usa al vender: <b>{(parametros.enganchePct * 100).toFixed(0)}%</b> de
          enganche, <b>{(parametros.tasaAnualPct * 100).toFixed(0)}%</b> anual sobre saldos insolutos,
          IVA <b>{(parametros.ivaPct * 100).toFixed(0)}%</b> y {parametros.cargoSemanalNombre} de{' '}
          <b>${parametros.cargoSemanalMonto.toFixed(0)}</b> + IVA por semana.
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div>
          <SecH titulo="Datos del equipo" />
          <Panel className="p-4">
            <div className="grid gap-3">
              <div className="fld">
                <label htmlFor="marca">Marca</label>
                <select id="marca" value={marca} onChange={(e) => setMarca(e.target.value)}>
                  {MARCAS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="modelo">Modelo</label>
                <input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Galaxy A07" />
              </div>
              <div className="fld">
                <label htmlFor="almacenamiento">Almacenamiento / color</label>
                <input id="almacenamiento" value={almacenamientoColor} onChange={(e) => setAlmacenamientoColor(e.target.value)} placeholder="64 GB / Negro" />
              </div>
              <div className="fld">
                <label htmlFor="precio">Precio de contado (MXN)</label>
                <input id="precio" type="number" min={1} step="0.01" value={precioContado} onChange={(e) => setPrecioContado(e.target.value)} />
              </div>
              <div className="fld">
                <label>Plazo</label>
                <div className="seg self-start">
                  {([26, 52] as const).map((p) => (
                    <button key={p} type="button" className={cn(plazoSemanas === p && 'on')} onClick={() => setPlazoSemanas(p)}>
                      {p} semanas
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              <Button onClick={handleCopiarMensaje}>
                <Copy className="size-4" />
                Copiar mensaje para el cliente
              </Button>
              <Button onClick={handleGuardar} disabled={guardando} variant="outline">
                <Save className="size-4" />
                Guardar cotización
              </Button>
            </div>
          </Panel>
        </div>

        <div>
          <SecH titulo="Resultado" nota={resultado ? `${plazoSemanas} pagos semanales` : undefined} />
          {resultado ? (
            <div className="calcbox">
              <div className="calcrow"><span>Precio de contado</span><b>{formatoMoneda(precio)}</b></div>
              <div className="calcrow"><span>Enganche</span><b>{formatoMoneda(resultado.enganche)}</b></div>
              <div className="calcrow"><span>Monto a financiar</span><b>{formatoMoneda(resultado.montoFinanciar)}</b></div>
              <div className="calcrow big">
                <span>{plazoSemanas} pagos semanales de</span>
                <b>{formatoMoneda(resultado.pagoTotalSemanal)}</b>
              </div>
              <div className="calcrow mut"><span>Último pago (ajuste)</span><b>{formatoMoneda(resultado.ultimoPago)}</b></div>
              <div className="calcrow"><span>Suma de pagos</span><b>{formatoMoneda(resultado.sumaPagos)}</b></div>
              <div className="calcrow"><span>Total desembolsado</span><b>{formatoMoneda(resultado.totalDesembolsado)}</b></div>
              <div className="calcrow"><span>Costo del financiamiento</span><b>{formatoMoneda(resultado.costoFinanciamiento)}</b></div>
              <div className="calcrow mut">
                <span>Costo anual efectivo (referencia interna, no es el CAT de Banxico)</span>
                <b>{resultado.costoAnualEfectivoRef !== null ? formatoPorcentaje(resultado.costoAnualEfectivoRef) : 'n/d'}</b>
              </div>
            </div>
          ) : (
            <Panel><div className="empty">Captura un precio de contado mayor a 0.</div></Panel>
          )}

          {comparativo && (
            <>
              <SecH titulo="Comparativo de plazos" nota="Mismo equipo, 26 vs. 52 semanas" />
              <div className="opt-grid">
                {comparativo.map((r, i) => {
                  const plazo = i === 0 ? 26 : 52;
                  return (
                    <button
                      key={plazo}
                      type="button"
                      className={cn('opt', plazoSemanas === plazo && 'on')}
                      onClick={() => setPlazoSemanas(plazo as 26 | 52)}
                    >
                      <h4><span className="rd" />{plazo} semanas</h4>
                      <div className="big">{formatoMoneda(r.pagoTotalSemanal)}<span className="text-[13px] font-medium text-muted-foreground">/sem</span></div>
                      <div className="sm">
                        Enganche {formatoMoneda(r.enganche)} · Total desembolsado {formatoMoneda(r.totalDesembolsado)}<br />
                        Costo del crédito {formatoMoneda(r.costoFinanciamiento)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {resultado && totalesTabla && (
        <>
          <SecH titulo={`Tabla de amortización — ${plazoSemanas} semanas`} />
          <TableWrap maxHeight="420px">
            <Table>
              <TableHeader>
                <TableRow>
                  <th className="num">#</th>
                  <th>Fecha</th>
                  <th className="num">Saldo inicial</th>
                  <th className="num">Interés + IVA</th>
                  <th className="num">Capital</th>
                  <th className="num">{parametros.cargoSemanalNombre} + IVA</th>
                  <th className="num">Pago total</th>
                  <th className="num">Saldo final</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.tabla.map((f) => (
                  <TableRow key={f.numeroPeriodo}>
                    <TableCell className="num font-semibold">{f.numeroPeriodo}</TableCell>
                    <TableCell className="mono">{formatoFecha(f.fecha)}</TableCell>
                    <TableCell className="num">{formatoMoneda(f.saldoInicial)}</TableCell>
                    <TableCell className="num">{formatoMoneda(f.interes + f.ivaInteres)}</TableCell>
                    <TableCell className="num">{formatoMoneda(f.capital)}</TableCell>
                    <TableCell className="num">{formatoMoneda(f.cargoServicio + f.ivaCargo)}</TableCell>
                    <TableCell className="num font-semibold">{formatoMoneda(f.pagoTotal)}</TableCell>
                    <TableCell className="num">{formatoMoneda(f.saldoFinal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>{resultado.tabla.length} pagos</TableCell>
                  <TableCell className="num">{formatoMoneda(totalesTabla.interes)}</TableCell>
                  <TableCell className="num">{formatoMoneda(totalesTabla.capital)}</TableCell>
                  <TableCell className="num">{formatoMoneda(totalesTabla.cargo)}</TableCell>
                  <TableCell className="num">{formatoMoneda(totalesTabla.pago)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </TableWrap>
        </>
      )}

      {recientes.length > 0 && (
        <>
          <SecH titulo="Cotizaciones recientes" nota={`${recientes.length} guardadas`} />
          <TableWrap maxHeight="320px">
            <Table>
              <TableHeader>
                <TableRow>
                  <th>Equipo</th>
                  <th className="num">Contado</th>
                  <th className="num">Plazo</th>
                  <th className="num">Enganche</th>
                  <th className="num">Semanal</th>
                  <th />
                </TableRow>
              </TableHeader>
              <TableBody>
                {recientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="cell-2">
                        <b>{c.marca} {c.modelo}</b>
                        <small>{c.almacenamiento_color || formatoFecha(c.created_at)}</small>
                      </div>
                    </TableCell>
                    <TableCell className="num">{formatoMoneda(Number(c.precio_contado))}</TableCell>
                    <TableCell className="num">{c.plazo_semanas} sem</TableCell>
                    <TableCell className="num">{formatoMoneda(Number(c.enganche))}</TableCell>
                    <TableCell className="num font-semibold">{formatoMoneda(Number(c.pago_semanal))}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button size="icon" variant="ghost" onClick={() => handleEliminar(c.id)} aria-label="Eliminar cotización">
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrap>
        </>
      )}
    </>
  );
}
