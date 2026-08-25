import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, X, Link as LinkIcon, AlertTriangle, Download, Search, Pencil, MessageSquare } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow, TableWrap, SortHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from './pill';
import { useOrden } from './use-orden';
import { formatoFechaHora, formatoMoneda } from '@/lib/format';
import { getMetodoPagoLabel } from '@/lib/solicitudes';
import { descargar, nombreArchivo, toCSV } from '@/lib/csv';
import type { MensajeWhatsapp, Solicitud } from '@/types';

type EstatusSolicitud = Solicitud['estatus'];

const FILTROS_STORAGE_KEY = 'movinex_admin_filtros';
const ESTATUS_OPCIONES: Array<'Todos' | EstatusSolicitud> = [
  'Todos', 'Iniciada', 'Lista para pago', 'Verificando identidad', 'Pendiente',
  'Aprobado', 'Preparando paquete', 'Pendiente de envío', 'Enviado', 'Entregado', 'Rechazado', 'Cancelada'
];

// Fuera del componente: si se armara en cada render, `ordenar` cambiaría de identidad
// todo el tiempo.
const ACCESORES: Record<string, (s: Solicitud) => string | number | null | undefined> = {
  cliente: (s) => s.cliente,
  contacto: (s) => s.celular,
  modelo: (s) => s.modelo,
  enganche: (s) => Number(s.enganche || 0),
  pagoSemanal: (s) => Number(s.pagoSemanal || 0),
  fecha: (s) => new Date(s.fecha).getTime(),
  estatus: (s) => s.estatus
};
const CAMPOS_TEXTO = ['cliente', 'contacto', 'modelo', 'estatus'];

interface DireccionInput {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  alcaldiaMunicipio: string;
  estado: string;
  codigoPostal: string;
}

interface SolicitudesViewProps {
  solicitudes: Solicitud[];
  onUpdateStatus: (id: string, nuevoEstatus: EstatusSolicitud) => Promise<void>;
  onCancelarSolicitud: (id: string) => Promise<void>;
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onSaveCelular: (id: string, celular: string) => Promise<void>;
  backendUrl: string;
  adminToken: string | null;
}

export function SolicitudesView({
  solicitudes, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onSaveCelular, backendUrl, adminToken
}: SolicitudesViewProps) {
  const [seleccionada, setSeleccionada] = useState<Solicitud | null>(null);

  const filtrosGuardados = (() => {
    try {
      return JSON.parse(localStorage.getItem(FILTROS_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  const [filtroEstatus, setFiltroEstatus] = useState<'Todos' | EstatusSolicitud>(filtrosGuardados.estatus || 'Todos');
  const [filtroDesde, setFiltroDesde] = useState<string>(filtrosGuardados.desde || '');
  const [filtroHasta, setFiltroHasta] = useState<string>(filtrosGuardados.hasta || '');
  const [busqueda, setBusqueda] = useState<string>(filtrosGuardados.busqueda || '');

  const orden = useOrden<Solicitud>(ACCESORES, { inicial: 'fecha', dirInicial: -1, texto: CAMPOS_TEXTO });

  useEffect(() => {
    localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify({ estatus: filtroEstatus, desde: filtroDesde, hasta: filtroHasta, busqueda }));
  }, [filtroEstatus, filtroDesde, filtroHasta, busqueda]);

  useEffect(() => {
    if (!seleccionada) return;
    const actualizada = solicitudes.find((s) => s.id === seleccionada.id);
    if (actualizada && actualizada !== seleccionada) setSeleccionada(actualizada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudes]);

  const solicitudesFiltradas = orden.ordenar(
    solicitudes.filter((s) => {
      if (filtroEstatus !== 'Todos' && s.estatus !== filtroEstatus) return false;
      if (filtroDesde || filtroHasta) {
        const fecha = new Date(s.fecha);
        if (filtroDesde && fecha < new Date(`${filtroDesde}T00:00:00`)) return false;
        if (filtroHasta && fecha > new Date(`${filtroHasta}T23:59:59.999`)) return false;
      }
      if (busqueda.trim()) {
        const q = busqueda.trim().toLowerCase();
        const campos = [s.cliente, s.celular, s.email, s.modelo, s.curp, s.id];
        if (!campos.some((c) => (c || '').toLowerCase().includes(q))) return false;
      }
      return true;
    })
  );

  const hayFiltrosActivos = filtroEstatus !== 'Todos' || Boolean(filtroDesde) || Boolean(filtroHasta) || Boolean(busqueda.trim());
  const limpiarFiltros = () => {
    setFiltroEstatus('Todos');
    setFiltroDesde('');
    setFiltroHasta('');
    setBusqueda('');
  };

  const totales = solicitudesFiltradas.reduce(
    (acc, s) => ({ enganche: acc.enganche + Number(s.enganche || 0), semanal: acc.semanal + Number(s.pagoSemanal || 0) }),
    { enganche: 0, semanal: 0 }
  );

  const exportar = () => {
    descargar(
      toCSV([
        ['Cliente', 'CURP', 'Teléfono', 'Correo', 'Equipo', 'Semanas', 'Enganche', 'Pago semanal', 'Fecha', 'Estatus', 'IMEI', 'Rastreo'],
        ...solicitudesFiltradas.map((s) => [
          s.cliente, s.curp || '', s.celular, s.email, s.modelo, s.semanas,
          Number(s.enganche || 0), Number(s.pagoSemanal || 0),
          formatoFechaHora(s.fecha), s.estatus, s.imei || '', s.trackingNumber || ''
        ])
      ]),
      nombreArchivo('solicitudes')
    );
    toast.success(`${solicitudesFiltradas.length} solicitud(es) exportadas a CSV.`);
  };

  if (seleccionada) {
    return (
      <DetalleCredito
        solicitud={seleccionada}
        onVolver={() => setSeleccionada(null)}
        onUpdateStatus={onUpdateStatus}
        onCancelarSolicitud={onCancelarSolicitud}
        onSaveImei={onSaveImei}
        onSaveDireccion={onSaveDireccion}
        onSaveCelular={onSaveCelular}
        backendUrl={backendUrl}
        adminToken={adminToken}
      />
    );
  }

  return (
    <>
      {/* Barra de herramientas en una sola fila de 32 px, en vez de cuatro campos
          apilados con su label arriba: gana casi el alto de una fila de tabla. */}
      <div className="mb-3 flex flex-wrap items-center gap-2.5 rounded-[var(--radius)] border bg-card p-3 shadow-[var(--sh)]">
        <div className="srch">
          <Search strokeWidth={1.8} />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, teléfono, correo, CURP…"
            aria-label="Buscar solicitudes"
          />
        </div>
        <select className="ctl" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value as typeof filtroEstatus)} aria-label="Filtrar por estatus">
          {ESTATUS_OPCIONES.map((est) => (
            <option key={est} value={est}>{est === 'Todos' ? 'Todos los estatus' : est}</option>
          ))}
        </select>
        <input type="date" className="ctl" value={filtroDesde} max={filtroHasta || undefined} onChange={(e) => setFiltroDesde(e.target.value)} aria-label="Desde" />
        <input type="date" className="ctl" value={filtroHasta} min={filtroDesde || undefined} onChange={(e) => setFiltroHasta(e.target.value)} aria-label="Hasta" />
        {hayFiltrosActivos && (
          <button type="button" className="ctl" onClick={limpiarFiltros}>Limpiar</button>
        )}
        <span className="flex-1" />
        <span className="chip">
          <b>{solicitudesFiltradas.length}</b> de {solicitudes.length} solicitudes
        </span>
        <button type="button" className="ctl" onClick={exportar} disabled={solicitudesFiltradas.length === 0}>
          <Download strokeWidth={1.7} />
          Exportar CSV
        </button>
      </div>

      <TableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead campo="cliente" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Cliente</SortHead>
              <SortHead campo="contacto" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Contacto</SortHead>
              <SortHead campo="modelo" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Equipo</SortHead>
              <SortHead campo="enganche" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Enganche</SortHead>
              <SortHead campo="pagoSemanal" activo={orden.campo} dir={orden.dir} onSort={orden.alternar} num>Semanal</SortHead>
              <SortHead campo="fecha" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Fecha</SortHead>
              <SortHead campo="estatus" activo={orden.campo} dir={orden.dir} onSort={orden.alternar}>Estatus</SortHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudesFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="empty">
                    {hayFiltrosActivos ? 'Ninguna solicitud coincide con estos filtros.' : 'Todavía no hay solicitudes registradas.'}
                  </div>
                </TableCell>
              </TableRow>
            )}
            {solicitudesFiltradas.map((s) => (
              <TableRow key={s.id} className="clk" onClick={() => setSeleccionada(s)}>
                <TableCell>
                  <div className="cell-2">
                    <b className="flex items-center gap-1.5">
                      {s.pagoConfirmado && !s.calle && (
                        <span className="size-2 shrink-0 rounded-full bg-[var(--warn)]" title="Pago confirmado, falta la dirección de envío" />
                      )}
                      {s.cliente}
                    </b>
                    <small className="mono">{s.curp || 'sin CURP'}</small>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="cell-2">
                    <span className="mono">{s.celular}</span>
                    <small>{s.email || 'sin correo'}</small>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="cell-2">
                    <span>{s.modelo}</span>
                    <small>{s.semanas} semanas</small>
                  </div>
                </TableCell>
                <TableCell className="num">{formatoMoneda(Number(s.enganche))}</TableCell>
                <TableCell className="num">{formatoMoneda(Number(s.pagoSemanal))}</TableCell>
                <TableCell className="mono">{formatoFechaHora(s.fecha)}</TableCell>
                <TableCell><EstadoBadge estatus={s.estatus} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
          {solicitudesFiltradas.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>{solicitudesFiltradas.length} solicitudes</TableCell>
                <TableCell className="num">{formatoMoneda(totales.enganche)}</TableCell>
                <TableCell className="num">{formatoMoneda(totales.semanal)}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableWrap>
    </>
  );
}

function getAccionPendiente(s: Solicitud): { mensaje: string; link: string } | null {
  const origin = window.location.origin;
  if (s.estatus === 'Iniciada') {
    return { mensaje: 'Falta que el cliente complete sus datos, dirección o el segundo código', link: `${origin}/documentos?solicitud=${s.id}` };
  }
  if (s.estatus === 'Lista para pago') {
    return { mensaje: 'Falta que el cliente pague el enganche', link: `${origin}/documentos?solicitud=${s.id}` };
  }
  if (s.estatus === 'Verificando identidad') {
    return { mensaje: 'Pago confirmado — falta que el cliente complete la verificación de identidad en vivo', link: `${origin}/verificacion?solicitud=${s.id}&modelo=${encodeURIComponent(s.modelo)}` };
  }
  if (s.estatus === 'Pendiente') {
    return { mensaje: 'La verificación de identidad no pasó automática — revisala y aprobá o rechazá manualmente', link: '' };
  }
  return null;
}

interface DetalleCreditoProps {
  solicitud: Solicitud;
  onVolver: () => void;
  onUpdateStatus: SolicitudesViewProps['onUpdateStatus'];
  onCancelarSolicitud: SolicitudesViewProps['onCancelarSolicitud'];
  onSaveImei: SolicitudesViewProps['onSaveImei'];
  onSaveDireccion: SolicitudesViewProps['onSaveDireccion'];
  onSaveCelular: SolicitudesViewProps['onSaveCelular'];
  backendUrl: string;
  adminToken: string | null;
}

function DetalleCredito({ solicitud, onVolver, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onSaveCelular, backendUrl, adminToken }: DetalleCreditoProps) {
  const [avanzando, setAvanzando] = useState(false);
  const [imeiInput, setImeiInput] = useState(solicitud.imei || '');
  const [guardandoImei, setGuardandoImei] = useState(false);
  const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
  const [direccionForm, setDireccionForm] = useState<DireccionInput>({
    calle: solicitud.calle || '', numeroExterior: solicitud.numeroExterior || '', numeroInterior: solicitud.numeroInterior || '',
    colonia: solicitud.colonia || '', alcaldiaMunicipio: solicitud.alcaldiaMunicipio || '', estado: solicitud.estado || '', codigoPostal: solicitud.codigoPostal || ''
  });
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [editandoCelular, setEditandoCelular] = useState(false);
  const [celularInput, setCelularInput] = useState(solicitud.celular);
  const [guardandoCelular, setGuardandoCelular] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeWhatsapp[] | null>(null);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);

  const handleResolver = async (nuevoEstatus: EstatusSolicitud) => {
    setAvanzando(true);
    try {
      await onUpdateStatus(solicitud.id, nuevoEstatus);
      toast.success(`Solicitud actualizada a "${nuevoEstatus}".`);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo actualizar el estatus.');
    } finally {
      setAvanzando(false);
    }
  };

  const handleCancelar = async () => {
    if (!window.confirm('¿Cancelar esta solicitud? Si ya pagó el enganche, se reembolsa y se cancela la suscripción semanal en Stripe.')) return;
    setAvanzando(true);
    try {
      await onCancelarSolicitud(solicitud.id);
      toast.success('Solicitud cancelada.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo cancelar la solicitud.');
    } finally {
      setAvanzando(false);
    }
  };

  const handleGuardarImei = async () => {
    setGuardandoImei(true);
    try {
      await onSaveImei(solicitud.id, imeiInput.trim());
      toast.success('IMEI guardado.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar el IMEI.');
    } finally {
      setGuardandoImei(false);
    }
  };

  const handleGuardarCelular = async () => {
    const digitos = celularInput.replace(/\D/g, '');
    if (digitos.length !== 10) {
      toast.error('El celular debe tener 10 dígitos.');
      return;
    }
    setGuardandoCelular(true);
    try {
      await onSaveCelular(solicitud.id, digitos);
      toast.success('Celular actualizado. Las próximas alertas se mandan a este número.');
      setEditandoCelular(false);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar el celular.');
    } finally {
      setGuardandoCelular(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    setCargandoMensajes(true);
    fetch(`${backendUrl}/api/admin/solicitudes/${solicitud.id}/mensajes`, {
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('No se pudo cargar el historial de mensajes.'))))
      .then((data) => { if (!cancelado) setMensajes(data); })
      .catch(() => { if (!cancelado) setMensajes([]); })
      .finally(() => { if (!cancelado) setCargandoMensajes(false); });
    return () => { cancelado = true; };
  }, [solicitud.id, backendUrl, adminToken]);

  const handleGuardarDireccion = async () => {
    const { calle, numeroExterior, colonia, alcaldiaMunicipio, estado, codigoPostal } = direccionForm;
    if (!calle.trim() || !numeroExterior.trim() || !colonia.trim() || !alcaldiaMunicipio.trim() || !estado.trim() || !codigoPostal.trim()) {
      toast.error('Completa todos los campos obligatorios.');
      return;
    }
    setGuardandoDireccion(true);
    try {
      await onSaveDireccion(solicitud.id, direccionForm);
      toast.success('Dirección guardada, generando guía de envío.');
      setMostrarFormDireccion(false);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar el domicilio.');
    } finally {
      setGuardandoDireccion(false);
    }
  };

  const accion = getAccionPendiente(solicitud);
  const metodoPago = getMetodoPagoLabel(solicitud.metodoPagoEnganche);

  return (
    <div className="max-w-4xl">
      <button type="button" className="ctl mb-3" onClick={onVolver}>
        <ArrowLeft strokeWidth={1.7} />
        Volver al listado
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-.3px]">{solicitud.cliente}</h2>
          <p className="mono text-[11.5px] text-muted-foreground">ID: {solicitud.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {solicitud.estatus === 'Preparando paquete' && (
            <Button size="sm" disabled={avanzando || !solicitud.imei} onClick={() => handleResolver('Pendiente de envío')} title={!solicitud.imei ? 'Introducir IMEI' : undefined}>
              Paquete preparado
            </Button>
          )}
          {solicitud.estatus === 'Pendiente de envío' && (
            <Button size="sm" disabled={avanzando || !solicitud.imei} onClick={() => handleResolver('Enviado')} title={!solicitud.imei ? 'Carga el IMEI antes de marcar como enviado' : undefined}>
              Marcar como enviado
            </Button>
          )}
          {!['Enviado', 'Entregado', 'Cancelada'].includes(solicitud.estatus) && (
            <Button size="sm" variant="destructive" disabled={avanzando} onClick={handleCancelar}>
              Cancelar solicitud
            </Button>
          )}
          <EstadoBadge estatus={solicitud.estatus} />
        </div>
      </div>

      {accion && (
        <div className="banner w mb-4 flex-wrap items-center">
          <div className="bi"><AlertTriangle strokeWidth={1.8} className="size-full" /></div>
          <span>{accion.mensaje}</span>
          {!solicitud.calle && !mostrarFormDireccion && (
            <button type="button" className="font-semibold underline" onClick={() => setMostrarFormDireccion(true)}>
              Cargarla manualmente
            </button>
          )}
          {accion.link && (
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold underline"
              onClick={() => {
                navigator.clipboard.writeText(accion.link);
                setLinkCopiado(true);
                setTimeout(() => setLinkCopiado(false), 2500);
              }}
            >
              {linkCopiado ? (<><Check className="size-3.5" /> ¡Copiado!</>) : (<><LinkIcon className="size-3.5" /> Copiar link para continuar</>)}
            </button>
          )}
        </div>
      )}

      <div className="sec-h"><h2>Solicitud</h2><div className="rule" /></div>
      <div className="rounded-[var(--radius)] border bg-card p-4 shadow-[var(--sh)]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
          <Campo label="CURP" valor={<span className="mono">{solicitud.curp || '—'}</span>} />
          <Campo
            label="WhatsApp"
            valor={
              editandoCelular ? (
                <div className="flex items-center gap-1.5">
                  <input
                    className="mono w-[110px]"
                    value={celularInput}
                    maxLength={10}
                    inputMode="numeric"
                    autoFocus
                    onChange={(e) => setCelularInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                  <Button size="sm" disabled={guardandoCelular || celularInput.length !== 10} onClick={handleGuardarCelular}>
                    {guardandoCelular ? '...' : 'Guardar'}
                  </Button>
                  <button
                    type="button"
                    className="text-muted-foreground hover:underline"
                    onClick={() => { setEditandoCelular(false); setCelularInput(solicitud.celular); }}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <a href={`https://wa.me/52${solicitud.celular}`} target="_blank" rel="noopener noreferrer" className="mono inline-flex items-center gap-1.5 text-primary hover:underline">
                    <FaWhatsapp className="text-[#25D366]" /> {solicitud.celular}
                  </a>
                  <button
                    type="button"
                    title="Cambiar el número al que le llegan las alertas"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setEditandoCelular(true)}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </span>
              )
            }
          />
          <Campo label="Correo" valor={solicitud.email} />
          <Campo label="Fecha de solicitud" valor={formatoFechaHora(solicitud.fecha)} />
          <Campo label="Equipo" valor={solicitud.modelo} />
          <Campo label="Plazo" valor={`${solicitud.semanas} semanas`} />
          <Campo label="Enganche" valor={<span className="font-semibold text-primary">{formatoMoneda(Number(solicitud.enganche))}</span>} />
          <Campo label="Cuota semanal" valor={formatoMoneda(Number(solicitud.pagoSemanal))} />
          <Campo
            label="Progreso de pago"
            valor={solicitud.pagoConfirmado ? `${solicitud.semanasPagadas ?? 0} de ${solicitud.semanas} semanas` : '—'}
          />
        </div>
      </div>

      <div className="sec-h"><h2>Pago y verificación</h2><div className="rule" /></div>
      <div className="space-y-4 rounded-[var(--radius)] border bg-card p-4 shadow-[var(--sh)]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
          <Campo
            label="Pago del enganche"
            valor={
              solicitud.pagoConfirmado
                ? <span className="inline-flex items-center gap-1 font-semibold text-[var(--good-ink)]"><Check className="size-3.5" /> Confirmado</span>
                : <span className="font-semibold text-[var(--warn-ink)]">Pendiente</span>
            }
          />
          {metodoPago && <Campo label="Método de pago" valor={metodoPago} />}
          {solicitud.verificamexStatus && (
            <Campo
              label="Verificación Verificamex"
              valor={`${solicitud.verificamexStatus}${solicitud.verificamexIntentos ? ` (intento ${solicitud.verificamexIntentos})` : ''}`}
            />
          )}
          {typeof solicitud.verificamexResult === 'number' && (
            <Campo
              label="Puntaje de verificación"
              valor={
                <span className={solicitud.verificamexResult >= 70 ? 'font-semibold text-[var(--good-ink)]' : 'font-semibold text-[var(--warn-ink)]'}>
                  {solicitud.verificamexResult}/100
                </span>
              }
            />
          )}
          {solicitud.trackingNumber && <Campo label="Número de rastreo" valor={<span className="mono">{solicitud.trackingNumber}</span>} />}
          {solicitud.labelUrl && (
            <Campo label="Guía de envío" valor={<a href={solicitud.labelUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver guía</a>} />
          )}
          {solicitud.reciboUrl && (
            <Campo label="Comprobante" valor={<a href={solicitud.reciboUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver recibo de Stripe</a>} />
          )}
        </div>

        {solicitud.verificamexErrores && solicitud.verificamexErrores.length > 0 ? (
          <div className="space-y-1.5 rounded-lg border bg-[var(--sunk)] p-3 text-[12.8px]">
            <p className="font-semibold">Detalle de la verificación</p>
            {solicitud.verificamexErrores.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-[var(--ink-2)]">
                {err.Result ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--good-ink)]" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-[var(--crit-ink)]" />
                )}
                <span>
                  <span className="font-semibold text-foreground">{err.Name || err.Category}: </span>
                  {err.Output || err.Message}
                </span>
              </div>
            ))}
          </div>
        ) : solicitud.verificamexComments && (
          <div className="rounded-lg border bg-[var(--sunk)] p-3 text-[12.8px] text-[var(--ink-2)]">
            <span className="font-semibold text-foreground">Detalle de Verificamex: </span>
            {solicitud.verificamexComments}
          </div>
        )}

        {solicitud.calle && !mostrarFormDireccion && (
          <Campo
            label="Dirección de envío"
            valor={`${solicitud.calle} ${solicitud.numeroExterior}${solicitud.numeroInterior ? ` Int. ${solicitud.numeroInterior}` : ''}, ${solicitud.colonia}, ${solicitud.alcaldiaMunicipio}, ${solicitud.estado}, CP ${solicitud.codigoPostal}`}
          />
        )}

        {mostrarFormDireccion && (
          <div className="rounded-lg border bg-[var(--sunk)] p-4">
            <div className="form-grid">
              <div className="fld" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="d-calle">Calle <span className="hint">(sin número ni referencias, máx. 45)</span></label>
                <input id="d-calle" maxLength={45} value={direccionForm.calle} onChange={(e) => setDireccionForm((f) => ({ ...f, calle: e.target.value.slice(0, 45) }))} />
              </div>
              <div className="fld"><label htmlFor="d-ext">No. exterior</label><input id="d-ext" value={direccionForm.numeroExterior} onChange={(e) => setDireccionForm((f) => ({ ...f, numeroExterior: e.target.value }))} /></div>
              <div className="fld"><label htmlFor="d-int">No. interior <span className="hint">(opcional)</span></label><input id="d-int" value={direccionForm.numeroInterior} onChange={(e) => setDireccionForm((f) => ({ ...f, numeroInterior: e.target.value }))} /></div>
              <div className="fld"><label htmlFor="d-col">Colonia</label><input id="d-col" value={direccionForm.colonia} onChange={(e) => setDireccionForm((f) => ({ ...f, colonia: e.target.value }))} /></div>
              <div className="fld"><label htmlFor="d-alc">Alcaldía / Municipio</label><input id="d-alc" value={direccionForm.alcaldiaMunicipio} onChange={(e) => setDireccionForm((f) => ({ ...f, alcaldiaMunicipio: e.target.value }))} /></div>
              <div className="fld"><label htmlFor="d-edo">Estado</label><input id="d-edo" value={direccionForm.estado} onChange={(e) => setDireccionForm((f) => ({ ...f, estado: e.target.value }))} /></div>
              <div className="fld"><label htmlFor="d-cp">Código postal</label><input id="d-cp" value={direccionForm.codigoPostal} onChange={(e) => setDireccionForm((f) => ({ ...f, codigoPostal: e.target.value }))} /></div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" disabled={guardandoDireccion} onClick={handleGuardarDireccion}>
                {guardandoDireccion ? 'Guardando...' : 'Guardar dirección y generar guía'}
              </Button>
              <button type="button" className="ctl" onClick={() => setMostrarFormDireccion(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {solicitud.pagoConfirmado && (
          <div className="fld max-w-xs">
            <label htmlFor="imei">
              IMEI del celular {solicitud.estatus !== 'Enviado' && <span className="hint">(obligatorio antes de marcar como Enviado)</span>}
            </label>
            <div className="flex gap-2">
              <input
                id="imei"
                placeholder="15 dígitos"
                value={imeiInput}
                maxLength={15}
                inputMode="numeric"
                disabled={solicitud.estatus === 'Enviado'}
                onChange={(e) => setImeiInput(e.target.value.replace(/\D/g, '').slice(0, 15))}
              />
              {solicitud.estatus !== 'Enviado' && (
                <Button size="sm" disabled={guardandoImei || imeiInput.trim().length !== 15 || imeiInput.trim() === (solicitud.imei || '')} onClick={handleGuardarImei}>
                  {guardandoImei ? 'Guardando...' : solicitud.imei ? 'Actualizar' : 'Guardar'}
                </Button>
              )}
            </div>
          </div>
        )}

        {solicitud.estatus === 'Pendiente' && (
          <div className="flex gap-2 border-t pt-4">
            <Button onClick={() => handleResolver('Aprobado')}>Aprobar solicitud</Button>
            <Button variant="destructive" onClick={() => handleResolver('Rechazado')}>Rechazar crédito</Button>
          </div>
        )}
      </div>

      <div className="sec-h"><h2>Mensajes enviados</h2><div className="rule" /></div>
      <div className="rounded-[var(--radius)] border bg-card p-4 shadow-[var(--sh)]">
        {/* Nuestro propio registro (mensajes_whatsapp): Meta no expone ningún endpoint
            para consultar mensajes ya enviados, la Cloud API es solo-envío. */}
        {cargandoMensajes ? (
          <div className="empty">Cargando mensajes…</div>
        ) : !mensajes || mensajes.length === 0 ? (
          <div className="empty">Todavía no se le mandó ningún WhatsApp a esta solicitud.</div>
        ) : (
          <ul className="space-y-2">
            {mensajes.map((m) => (
              <li key={m.id} className="flex items-start gap-2.5 border-b pb-2 text-[13px] last:border-b-0 last:pb-0">
                <MessageSquare strokeWidth={1.7} className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold">{m.tipo}</span>
                    {m.mock && <span className="chip text-[10.5px]">simulado</span>}
                    {!m.exito && <span className="inline-flex items-center gap-1 font-semibold text-[var(--crit-ink)]"><X className="size-3" /> Falló</span>}
                  </div>
                  <span className="mono text-[11.5px] text-muted-foreground">{formatoFechaHora(m.creado_en)} · {m.celular}</span>
                  {m.detalle && <p className="mt-0.5 text-[12px] text-[var(--crit-ink)]">{m.detalle}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-[.04em] text-muted-foreground">{label}</span>
      <span className="text-[13px] font-medium">{valor}</span>
    </div>
  );
}
