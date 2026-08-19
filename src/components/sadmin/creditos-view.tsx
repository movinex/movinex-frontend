import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Check, Link as LinkIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Select, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from './estado-badge';
import { formatoFechaHora } from '@/lib/format';
import { getMetodoPagoLabel } from '@/lib/solicitudes';
import type { Solicitud } from '@/types';

type EstatusSolicitud = Solicitud['estatus'];

const FILTROS_STORAGE_KEY = 'movinex_admin_filtros';
const ESTATUS_OPCIONES: Array<'Todos' | EstatusSolicitud> = [
  'Todos', 'Iniciada', 'Lista para pago', 'Verificando identidad', 'Pendiente',
  'Aprobado', 'Preparando paquete', 'Pendiente de envío', 'Enviado', 'Entregado', 'Rechazado', 'Cancelada'
];

interface DireccionInput {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  alcaldiaMunicipio: string;
  estado: string;
  codigoPostal: string;
}

interface CreditosViewProps {
  solicitudes: Solicitud[];
  onUpdateStatus: (id: string, nuevoEstatus: EstatusSolicitud) => Promise<void>;
  onCancelarSolicitud: (id: string) => Promise<void>;
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onRefrescar: () => void;
  segundosParaRefresh: number;
}

export function CreditosView({
  solicitudes, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onRefrescar, segundosParaRefresh
}: CreditosViewProps) {
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

  useEffect(() => {
    localStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify({ estatus: filtroEstatus, desde: filtroDesde, hasta: filtroHasta, busqueda }));
  }, [filtroEstatus, filtroDesde, filtroHasta, busqueda]);

  useEffect(() => {
    if (!seleccionada) return;
    const actualizada = solicitudes.find((s) => s.id === seleccionada.id);
    if (actualizada && actualizada !== seleccionada) setSeleccionada(actualizada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudes]);

  const solicitudesFiltradas = solicitudes.filter((s) => {
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
  });

  const hayFiltrosActivos = filtroEstatus !== 'Todos' || Boolean(filtroDesde) || Boolean(filtroHasta) || Boolean(busqueda.trim());
  const limpiarFiltros = () => {
    setFiltroEstatus('Todos');
    setFiltroDesde('');
    setFiltroHasta('');
    setBusqueda('');
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
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Créditos</h1>
          <p className="text-muted-foreground">
            {solicitudesFiltradas.length} de {solicitudes.length} solicitud(es)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRefrescar}>
          <RefreshCw className="size-4" />
          Refrescar ({segundosParaRefresh}s)
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-busqueda">Buscar</Label>
          <Input
            id="f-busqueda"
            className="w-64"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, teléfono, correo, CURP…"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-estatus">Estatus</Label>
          <Select id="f-estatus" className="w-48" value={filtroEstatus} onChange={(e) => setFiltroEstatus(e.target.value as any)}>
            {ESTATUS_OPCIONES.map((est) => (
              <option key={est} value={est}>{est}</option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-desde">Desde</Label>
          <Input id="f-desde" type="date" className="w-40" value={filtroDesde} max={filtroHasta || undefined} onChange={(e) => setFiltroDesde(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="f-hasta">Hasta</Label>
          <Input id="f-hasta" type="date" className="w-40" value={filtroHasta} min={filtroDesde || undefined} onChange={(e) => setFiltroHasta(e.target.value)} />
        </div>
        {hayFiltrosActivos && (
          <Button variant="ghost" size="sm" onClick={limpiarFiltros}>Limpiar filtros</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">Enganche</TableHead>
                <TableHead className="text-right">Semanal</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudesFiltradas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {hayFiltrosActivos ? 'Ninguna solicitud coincide con estos filtros.' : 'Todavía no hay solicitudes registradas.'}
                  </TableCell>
                </TableRow>
              )}
              {solicitudesFiltradas.map((s) => (
                <TableRow key={s.id} className="cursor-pointer" onClick={() => setSeleccionada(s)}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {s.pagoConfirmado && !s.calle && (
                        <span className="size-2 shrink-0 rounded-full bg-[color:var(--status-warning)]" title="Pago confirmado, falta la dirección de envío" />
                      )}
                      {s.cliente}
                    </div>
                    {s.curp && <p className="text-xs text-muted-foreground">{s.curp}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">{s.celular}</p>
                    {s.email && <p className="text-sm text-muted-foreground">{s.email}</p>}
                  </TableCell>
                  <TableCell>
                    <p>{s.modelo}</p>
                    <p className="text-xs text-muted-foreground">{s.semanas} semanas</p>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">${Number(s.enganche).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">${Number(s.pagoSemanal).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatoFechaHora(s.fecha)}</TableCell>
                  <TableCell><EstadoBadge estatus={s.estatus} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
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
    return { mensaje: 'La verificación de identidad no pasó automática tras varios intentos — revisala y aprobá o rechazá manualmente', link: '' };
  }
  return null;
}

interface DetalleCreditoProps {
  solicitud: Solicitud;
  onVolver: () => void;
  onUpdateStatus: CreditosViewProps['onUpdateStatus'];
  onCancelarSolicitud: CreditosViewProps['onCancelarSolicitud'];
  onSaveImei: CreditosViewProps['onSaveImei'];
  onSaveDireccion: CreditosViewProps['onSaveDireccion'];
}

function DetalleCredito({ solicitud, onVolver, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion }: DetalleCreditoProps) {
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
    <div className="mx-auto max-w-4xl space-y-5">
      <Button variant="ghost" size="sm" onClick={onVolver}>
        <ArrowLeft className="size-4" />
        Volver al listado
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{solicitud.cliente}</h1>
          <p className="text-sm text-muted-foreground">ID: {solicitud.id}</p>
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
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[color:var(--status-warning)]/40 bg-[color:var(--status-warning)]/10 px-4 py-3 text-sm">
          <AlertTriangle className="size-4 shrink-0 text-[color:var(--status-warning)]" />
          <span>{accion.mensaje}</span>
          {!solicitud.calle && !mostrarFormDireccion && (
            <button type="button" className="font-semibold text-primary underline" onClick={() => setMostrarFormDireccion(true)}>
              Cargarla manualmente
            </button>
          )}
          {accion.link && (
            <button
              type="button"
              className="inline-flex items-center gap-1 font-semibold text-primary underline"
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

      <Card>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6 sm:grid-cols-3">
          <Campo label="CURP" valor={solicitud.curp || '—'} />
          <Campo
            label="WhatsApp"
            valor={
              <a href={`https://wa.me/52${solicitud.celular}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <FaWhatsapp className="text-[#25D366]" /> {solicitud.celular}
              </a>
            }
          />
          <Campo label="Correo" valor={solicitud.email} />
          <Campo label="Fecha de solicitud" valor={formatoFechaHora(solicitud.fecha)} />
          <Campo label="Equipo" valor={solicitud.modelo} />
          <Campo label="Plazo" valor={`${solicitud.semanas} semanas`} />
          <Campo label="Enganche" valor={<span className="font-semibold text-primary">${Number(solicitud.enganche).toLocaleString()}</span>} />
          <Campo label="Cuota semanal" valor={`$${Number(solicitud.pagoSemanal).toLocaleString()}`} />
          <Campo
            label="Progreso de pago"
            valor={solicitud.pagoConfirmado ? `${solicitud.semanasPagadas ?? 0} de ${solicitud.semanas} semanas` : '—'}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <SectionTitle>Pago y verificación</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Campo
              label="Pago del enganche"
              valor={
                <span className={solicitud.pagoConfirmado ? 'inline-flex items-center gap-1 font-semibold text-[color:var(--status-good)]' : 'font-semibold text-[color:var(--status-warning)]'}>
                  {solicitud.pagoConfirmado ? (<><Check className="size-3.5" /> Confirmado</>) : 'Pendiente'}
                </span>
              }
            />
            {metodoPago && <Campo label="Método de pago" valor={metodoPago} />}
            {solicitud.verificamexStatus && (
              <Campo label="Verificación Verificamex" valor={`${solicitud.verificamexStatus}${solicitud.verificamexIntentos ? ` (intento ${solicitud.verificamexIntentos} de 3)` : ''}`} />
            )}
            {solicitud.trackingNumber && <Campo label="Número de rastreo" valor={solicitud.trackingNumber} />}
            {solicitud.labelUrl && (
              <Campo label="Guía de envío" valor={<a href={solicitud.labelUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver guía</a>} />
            )}
            {solicitud.reciboUrl && (
              <Campo label="Comprobante" valor={<a href={solicitud.reciboUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver recibo de Stripe</a>} />
            )}
          </div>

          {solicitud.calle && !mostrarFormDireccion && (
            <Campo
              label="Dirección de envío"
              valor={`${solicitud.calle} ${solicitud.numeroExterior}${solicitud.numeroInterior ? ` Int. ${solicitud.numeroInterior}` : ''}, ${solicitud.colonia}, ${solicitud.alcaldiaMunicipio}, ${solicitud.estado}, CP ${solicitud.codigoPostal}`}
            />
          )}

          {mostrarFormDireccion && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4">
              <Input className="col-span-2" placeholder="Calle" value={direccionForm.calle} onChange={(e) => setDireccionForm((f) => ({ ...f, calle: e.target.value }))} />
              <Input placeholder="No. exterior" value={direccionForm.numeroExterior} onChange={(e) => setDireccionForm((f) => ({ ...f, numeroExterior: e.target.value }))} />
              <Input placeholder="No. interior (opcional)" value={direccionForm.numeroInterior} onChange={(e) => setDireccionForm((f) => ({ ...f, numeroInterior: e.target.value }))} />
              <Input placeholder="Colonia" value={direccionForm.colonia} onChange={(e) => setDireccionForm((f) => ({ ...f, colonia: e.target.value }))} />
              <Input placeholder="Alcaldía / Municipio" value={direccionForm.alcaldiaMunicipio} onChange={(e) => setDireccionForm((f) => ({ ...f, alcaldiaMunicipio: e.target.value }))} />
              <Input placeholder="Estado" value={direccionForm.estado} onChange={(e) => setDireccionForm((f) => ({ ...f, estado: e.target.value }))} />
              <Input placeholder="Código postal" value={direccionForm.codigoPostal} onChange={(e) => setDireccionForm((f) => ({ ...f, codigoPostal: e.target.value }))} />
              <div className="col-span-2 flex gap-2">
                <Button size="sm" disabled={guardandoDireccion} onClick={handleGuardarDireccion}>
                  {guardandoDireccion ? 'Guardando...' : 'Guardar dirección y generar guía'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setMostrarFormDireccion(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {solicitud.pagoConfirmado && (
            <div className="space-y-1.5">
              <Label>IMEI del celular {solicitud.estatus !== 'Enviado' && '(obligatorio antes de marcar como Enviado)'}</Label>
              <div className="flex gap-2">
                <Input
                  className="max-w-xs"
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
        </CardContent>
      </Card>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>;
}

function Campo({ label, valor }: { label: string; valor: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{valor}</span>
    </div>
  );
}
