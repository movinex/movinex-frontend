import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import type { Solicitud } from './types';
import {
  FiBarChart2,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiAlertTriangle,
  FiLink,
  FiCheck,
  FiPackage,
  FiFileText,
  FiFolder,
  FiRefreshCw,
  FiArrowLeft,
  FiZoomIn,
  FiX,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

type EstatusSolicitud = Solicitud['estatus'];

// Los filtros del listado sobreviven a volver del detalle y a recargar la página.
const FILTROS_STORAGE_KEY = 'movinex_admin_filtros';

interface DireccionInput {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  alcaldiaMunicipio: string;
  estado: string;
  codigoPostal: string;
}

interface AdminProps {
  solicitudes: Solicitud[];
  onUpdateStatus: (id: string, nuevoEstatus: EstatusSolicitud) => Promise<void>;
  onCancelarSolicitud: (id: string) => Promise<void>;
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onVolver: () => void;
  onRefrescar: () => void;
  segundosParaRefresh: number;
}

export const Admin: React.FC<AdminProps> = ({ solicitudes, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onVolver, onRefrescar, segundosParaRefresh }) => {
  // `solicitudSeleccionada` decide qué vista se muestra: en null se ve el listado
  // completo, y al elegir una fila se pasa a la vista de detalle (pantalla entera, ya
  // no una columna angosta al lado de la lista).
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);

  // Los filtros se guardan en localStorage para que volver del detalle (o recargar la
  // página) no obligue a rearmarlos. Se leen una sola vez, al montar.
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
  const [activeTab, setActiveTab] = useState<'info' | 'documentos'>('info');

  // Documento abierto en grande (lightbox). null = ninguno.
  const [imagenAmpliada, setImagenAmpliada] = useState<{ src: string; titulo: string } | null>(null);

  // Loading states for image preloading
  const [loadFrente, setLoadFrente] = useState(false);
  const [loadReverso, setLoadReverso] = useState(false);
  const [loadSelfie, setLoadSelfie] = useState(false);

  // Acción de estatus en curso (deshabilita el botón mientras espera al backend)
  const [avanzandoEstatus, setAvanzandoEstatus] = useState(false);
  const [errorEstatus, setErrorEstatus] = useState('');

  // IMEI: se puede cargar/editar desde "Preparando paquete" en adelante, obligatorio
  // antes de poder marcar como Enviado.
  const [imeiInput, setImeiInput] = useState('');
  const [guardandoImei, setGuardandoImei] = useState(false);
  const [imeiGuardadoOk, setImeiGuardadoOk] = useState(false);

  // Carga manual de domicilio desde el admin, para cuando el cliente pagó pero no
  // llegó a completar el paso de dirección.
  const [mostrarFormDireccion, setMostrarFormDireccion] = useState(false);
  const [direccionForm, setDireccionForm] = useState<DireccionInput>({
    calle: '', numeroExterior: '', numeroInterior: '', colonia: '', alcaldiaMunicipio: '', estado: '', codigoPostal: ''
  });
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState('');

  // Feedback breve del botón "Copiar link para continuar" (ver más abajo)
  const [linkCopiadoOk, setLinkCopiadoOk] = useState(false);

  // Las fechas del filtro vienen de un <input type="date"> como "2026-08-16" (hora
  // local). Se compara contra el día completo: desde las 00:00 del "desde" hasta las
  // 23:59:59 del "hasta", para que elegir el mismo día en ambos incluya ese día entero.
  const solicitudesFiltradas = solicitudes.filter(s => {
    if (filtroEstatus !== 'Todos' && s.estatus !== filtroEstatus) return false;

    if (filtroDesde || filtroHasta) {
      const fecha = new Date(s.fecha);
      if (filtroDesde && fecha < new Date(`${filtroDesde}T00:00:00`)) return false;
      if (filtroHasta && fecha > new Date(`${filtroHasta}T23:59:59.999`)) return false;
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      const campos = [s.cliente, s.celular, s.email, s.modelo, s.curp, s.id];
      if (!campos.some(c => (c || '').toLowerCase().includes(q))) return false;
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

  useEffect(() => {
    localStorage.setItem(
      FILTROS_STORAGE_KEY,
      JSON.stringify({ estatus: filtroEstatus, desde: filtroDesde, hasta: filtroHasta, busqueda })
    );
  }, [filtroEstatus, filtroDesde, filtroHasta, busqueda]);

  // Escape cierra el documento ampliado, que es lo que uno espera de un visor a
  // pantalla completa.
  useEffect(() => {
    if (!imagenAmpliada) return;
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImagenAmpliada(null);
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [imagenAmpliada]);

  // Las fotos se recargan solo cuando cambia la solicitud abierta. Si esto dependiera
  // también de `solicitudes`, cada refresh automático haría parpadear las imágenes.
  useEffect(() => {
    setLoadFrente(false);
    setLoadReverso(false);
    setLoadSelfie(false);
  }, [solicitudSeleccionada?.id]);

  // Mantiene al día la solicitud abierta cuando entra un refresh (por ejemplo si el
  // estatus cambió). Antes acá también se seleccionaba la primera de la lista
  // automáticamente; ya no corresponde, porque el detalle es una vista aparte y eso
  // abriría una solicitud sola sin que nadie la haya elegido.
  useEffect(() => {
    if (!solicitudSeleccionada) return;
    const actualizada = solicitudes.find(s => s.id === solicitudSeleccionada.id);
    if (actualizada && actualizada !== solicitudSeleccionada) {
      setSolicitudSeleccionada(actualizada);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudes]);

  // Sincronizar los formularios de IMEI/dirección cuando cambia la solicitud seleccionada
  useEffect(() => {
    setImeiInput(solicitudSeleccionada?.imei || '');
    setImeiGuardadoOk(false);
    setErrorEstatus('');
    setMostrarFormDireccion(false);
    setErrorDireccion('');
    setLinkCopiadoOk(false);
    setDireccionForm({
      calle: solicitudSeleccionada?.calle || '',
      numeroExterior: solicitudSeleccionada?.numeroExterior || '',
      numeroInterior: solicitudSeleccionada?.numeroInterior || '',
      colonia: solicitudSeleccionada?.colonia || '',
      alcaldiaMunicipio: solicitudSeleccionada?.alcaldiaMunicipio || '',
      estado: solicitudSeleccionada?.estado || '',
      codigoPostal: solicitudSeleccionada?.codigoPostal || ''
    });
  }, [solicitudSeleccionada?.id]);

  // Cálculos de métricas
  const totalSolicitudes = solicitudes.length;
  const aprobados = solicitudes.filter(s => s.estatus === 'Aprobado').length;
  const pendientes = solicitudes.filter(s => s.estatus === 'Pendiente').length;
  const rechazados = solicitudes.filter(s => s.estatus === 'Rechazado').length;
  
  // "Aprobado" es un estatus de tránsito: en cuanto el webhook de Stripe confirma el
  // pago, pasa a "Preparando paquete" en la misma actualización (ver
  // PersistenceService.marcarPagoConfirmado) — así que esto es "enganches todavía sin
  // cobrar", no un acumulado. Se suma aparte lo ya cobrado (totalEnganchesCobrados)
  // para no perder ese dato de vista.
  const totalEnganchesPorCobrar = solicitudes
    .filter(s => s.estatus === 'Aprobado')
    .reduce((acc, s) => acc + s.enganche, 0);

  const totalEnganchesCobrados = solicitudes
    .filter(s => s.pagoConfirmado)
    .reduce((acc, s) => acc + s.enganche, 0);

  // Qué le falta hacer al cliente en cada estatus, y a dónde mandarlo para retomar —
  // un solo banner arriba de todo en vez de mensajes sueltos repartidos por la pantalla.
  const getAccionPendiente = (s: Solicitud): { mensaje: string; link: string } | null => {
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
      // Sin link: acá ya no hay nada que el cliente pueda hacer — se agotaron los 3
      // intentos de la verificación en vivo, queda en manos del admin (Aprobar/Rechazar).
      return { mensaje: 'La verificación de identidad no pasó automática tras varios intentos — revisala y aprobá o rechazá manualmente', link: '' };
    }
    return null;
  };

  const getStatusClass = (estatus: Solicitud['estatus']) => {
    switch (estatus) {
      case 'Iniciada': return styles.statusIniciada;
      case 'Lista para pago': return styles.statusIniciada;
      case 'Verificando identidad': return styles.statusPending;
      case 'Pendiente': return styles.statusPending;
      case 'Aprobado': return styles.statusApproved;
      case 'Rechazado': return styles.statusRejected;
      case 'Cancelada': return styles.statusRejected;
      case 'Pendiente de envío': return styles.statusShipping;
      case 'Preparando paquete': return styles.statusPacking;
      case 'Enviado': return styles.statusShipped;
      case 'Entregado': return styles.statusDelivered;
      default: return styles.statusPending;
    }
  };

  const getMetodoPagoLabel = (metodo?: Solicitud['metodoPagoEnganche']) => {
    switch (metodo) {
      case 'card': return 'Tarjeta';
      case 'oxxo': return 'OXXO';
      case 'customer_balance': return 'Transferencia (SPEI)';
      default: return null;
    }
  };

  const handleResolver = async (id: string, nuevoEstatus: EstatusSolicitud) => {
    setErrorEstatus('');
    setAvanzandoEstatus(true);
    try {
      await onUpdateStatus(id, nuevoEstatus);
      // Actualizar el estado local para reflejar el cambio inmediato
      if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
        setSolicitudSeleccionada(prev => prev ? { ...prev, estatus: nuevoEstatus } : null);
      }
    } catch (error: any) {
      setErrorEstatus(error.message || 'No se pudo actualizar el estatus.');
    } finally {
      setAvanzandoEstatus(false);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!window.confirm('¿Cancelar esta solicitud? Si ya pagó el enganche, se reembolsa y se cancela la suscripción semanal en Stripe.')) {
      return;
    }
    setErrorEstatus('');
    setAvanzandoEstatus(true);
    try {
      await onCancelarSolicitud(id);
      if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
        setSolicitudSeleccionada(prev => prev ? { ...prev, estatus: 'Cancelada' as EstatusSolicitud } : null);
      }
    } catch (error: any) {
      setErrorEstatus(error.message || 'No se pudo cancelar la solicitud.');
    } finally {
      setAvanzandoEstatus(false);
    }
  };

  const handleGuardarImei = async () => {
    if (!solicitudSeleccionada || !imeiInput.trim()) return;
    setGuardandoImei(true);
    setImeiGuardadoOk(false);
    try {
      await onSaveImei(solicitudSeleccionada.id, imeiInput.trim());
      setSolicitudSeleccionada(prev => prev ? { ...prev, imei: imeiInput.trim() } : null);
      setImeiGuardadoOk(true);
    } catch (error: any) {
      setErrorEstatus(error.message || 'No se pudo guardar el IMEI.');
    } finally {
      setGuardandoImei(false);
    }
  };

  const handleGuardarDireccion = async () => {
    if (!solicitudSeleccionada) return;
    const { calle, numeroExterior, colonia, alcaldiaMunicipio, estado, codigoPostal } = direccionForm;
    if (!calle.trim() || !numeroExterior.trim() || !colonia.trim() || !alcaldiaMunicipio.trim() || !estado.trim() || !codigoPostal.trim()) {
      setErrorDireccion('Completa todos los campos obligatorios.');
      return;
    }
    setGuardandoDireccion(true);
    setErrorDireccion('');
    try {
      await onSaveDireccion(solicitudSeleccionada.id, direccionForm);
      setSolicitudSeleccionada(prev => prev ? { ...prev, ...direccionForm } : null);
      setMostrarFormDireccion(false);
    } catch (error: any) {
      setErrorDireccion(error.message || 'No se pudo guardar el domicilio.');
    } finally {
      setGuardandoDireccion(false);
    }
  };

  const formatearFecha = (isoString: string) => {
    try {
      const fecha = new Date(isoString);
      return fecha.toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className={styles.adminWrap}>
      {/* HEADER SUPERIOR */}
      <div className={styles.header}>
        <div>
          <h1>Movinex Backoffice</h1>
          <p className={styles.subtext}>Módulo de Análisis y Control de Créditos</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnVolver} onClick={onVolver}>
            ← Volver a la Tienda
          </button>
          <span className={styles.badge}>Administrador</span>
        </div>
      </div>

      {/* METRICAS CLAVE */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricIcon}><FiBarChart2 /></span>
          <div className={styles.metricContent}>
            <h3>Total Solicitudes</h3>
            <strong>{totalSolicitudes}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #FEF3C7' }}>
          <span className={styles.metricIcon} style={{ color: '#D97706' }}><FiClock /></span>
          <div className={styles.metricContent}>
            <h3>Pendientes</h3>
            <strong style={{ color: '#D97706' }}>{pendientes}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #D1FAE5' }}>
          <span className={styles.metricIcon} style={{ color: '#16A34A' }}><FiCheckCircle /></span>
          <div className={styles.metricContent}>
            <h3>Esperando pago</h3>
            <strong style={{ color: '#16A34A' }}>{aprobados}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #FEE2E2' }}>
          <span className={styles.metricIcon} style={{ color: '#DC2626' }}><FiXCircle /></span>
          <div className={styles.metricContent}>
            <h3>Rechazados</h3>
            <strong style={{ color: '#DC2626' }}>{rechazados}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #2B6BE4' }}>
          <span className={styles.metricIcon} style={{ color: '#2B6BE4' }}><FiDollarSign /></span>
          <div className={styles.metricContent}>
            <h3>Enganches por cobrar</h3>
            <strong style={{ color: '#2B6BE4' }}>${totalEnganchesPorCobrar.toLocaleString()}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #EDE9FE' }}>
          <span className={styles.metricIcon} style={{ color: '#7C3AED' }}><FiDollarSign /></span>
          <div className={styles.metricContent}>
            <h3>Enganches cobrados</h3>
            <strong style={{ color: '#7C3AED' }}>${totalEnganchesCobrados.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* LISTADO COMPLETO — se oculta al abrir una solicitud (ver detalle abajo) */}
      {!solicitudSeleccionada && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.listadoTitleRow}>
              <div className={styles.panelTitle}>
                Créditos Recibidos
                <span className={styles.conteoResultados}>
                  {solicitudesFiltradas.length} de {solicitudes.length}
                </span>
              </div>
              <button type="button" onClick={onRefrescar} className={styles.refreshBtn}>
                <FiRefreshCw /> Refresh ({segundosParaRefresh}s)
              </button>
            </div>

            <div className={styles.filtros}>
              <div className={styles.filtroCampo}>
                <label htmlFor="f-busqueda">Buscar</label>
                <input
                  id="f-busqueda"
                  type="search"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Nombre, teléfono, correo, CURP..."
                />
              </div>
              <div className={styles.filtroCampo}>
                <label htmlFor="f-estatus">Estatus</label>
                <select id="f-estatus" value={filtroEstatus} onChange={e => setFiltroEstatus(e.target.value as any)}>
                  {(['Todos', 'Iniciada', 'Pendiente', 'Aprobado', 'Pendiente de envío', 'Preparando paquete', 'Enviado', 'Entregado', 'Rechazado'] as const).map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filtroCampo}>
                <label htmlFor="f-desde">Desde</label>
                <input id="f-desde" type="date" value={filtroDesde} max={filtroHasta || undefined} onChange={e => setFiltroDesde(e.target.value)} />
              </div>
              <div className={styles.filtroCampo}>
                <label htmlFor="f-hasta">Hasta</label>
                <input id="f-hasta" type="date" value={filtroHasta} min={filtroDesde || undefined} onChange={e => setFiltroHasta(e.target.value)} />
              </div>
              {hayFiltrosActivos && (
                <button type="button" className={styles.limpiarFiltros} onClick={limpiarFiltros}>
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {solicitudesFiltradas.length > 0 ? (
            <div className={styles.tablaWrap}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Equipo</th>
                    <th className={styles.colNum}>Enganche</th>
                    <th className={styles.colNum}>Semanal</th>
                    <th>Fecha</th>
                    <th>Estatus</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map(s => (
                    <tr
                      key={s.id}
                      className={styles.fila}
                      onClick={() => {
                        setSolicitudSeleccionada(s);
                        setActiveTab('info');
                      }}
                      title="Ver detalle completo"
                    >
                      <td>
                        <div className={styles.celdaCliente}>
                          {s.pagoConfirmado && !s.calle && (
                            <span className={styles.itemAlertDot} title="Pago confirmado, falta la dirección de envío"></span>
                          )}
                          <span className={styles.nombreCliente}>{s.cliente}</span>
                        </div>
                        {s.curp && <span className={styles.subCelda}>{s.curp}</span>}
                      </td>
                      <td>
                        <span className={styles.subCelda}>{s.celular}</span>
                        {s.email && <span className={styles.subCelda}>{s.email}</span>}
                      </td>
                      <td>
                        <span className={styles.nombreCliente}>{s.modelo}</span>
                        <span className={styles.subCelda}>{s.semanas} semanas</span>
                      </td>
                      <td className={styles.colNum}>${Number(s.enganche).toLocaleString()}</td>
                      <td className={styles.colNum}>${Number(s.pagoSemanal).toLocaleString()}</td>
                      <td><span className={styles.subCelda}>{formatearFecha(s.fecha)}</span></td>
                      <td>
                        <span className={`${styles.status} ${getStatusClass(s.estatus)}`}>{s.estatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyList}>
              {hayFiltrosActivos
                ? 'Ninguna solicitud coincide con estos filtros.'
                : 'Todavía no hay solicitudes registradas.'}
            </div>
          )}
        </div>
      )}

      {/* DETALLE — pantalla completa, reemplaza al listado */}
      {solicitudSeleccionada && (
        <div className={styles.panel}>
          {solicitudSeleccionada ? (
            <div className={styles.detailWrapper}>
              <button
                type="button"
                className={styles.volverListado}
                onClick={() => setSolicitudSeleccionada(null)}
              >
                <FiArrowLeft /> Volver al listado
              </button>
              <div className={styles.detailHeader}>
                <div>
                  <h2>Detalle del Cliente</h2>
                  <span className={styles.detailId}>ID Solicitud: {solicitudSeleccionada.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {solicitudSeleccionada.estatus === 'Preparando paquete' && (
                    <button
                      className={styles.btnApprove}
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => handleResolver(solicitudSeleccionada.id, 'Pendiente de envío')}
                      disabled={avanzandoEstatus || !solicitudSeleccionada.imei}
                      title={!solicitudSeleccionada.imei ? 'Introducir IMEI' : undefined}
                    >
                      {avanzandoEstatus ? 'Guardando...' : 'Paquete preparado →'}
                    </button>
                  )}
                  {solicitudSeleccionada.estatus === 'Pendiente de envío' && (
                    <button
                      className={styles.btnApprove}
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => handleResolver(solicitudSeleccionada.id, 'Enviado')}
                      disabled={avanzandoEstatus || !solicitudSeleccionada.imei}
                      title={!solicitudSeleccionada.imei ? 'Carga el IMEI antes de marcar como enviado' : undefined}
                    >
                      {avanzandoEstatus ? 'Guardando...' : 'Marcar como Enviado →'}
                    </button>
                  )}
                  {!['Enviado', 'Entregado', 'Cancelada'].includes(solicitudSeleccionada.estatus) && (
                    <button
                      className={styles.btnReject}
                      style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => handleCancelar(solicitudSeleccionada.id)}
                      disabled={avanzandoEstatus}
                    >
                      Cancelar solicitud
                    </button>
                  )}
                  <span className={`${styles.status} ${getStatusClass(solicitudSeleccionada.estatus)}`}>
                    {solicitudSeleccionada.estatus}
                  </span>
                </div>
              </div>
              {errorEstatus && (
                <div style={{ color: '#DC2626', fontSize: '13px', fontWeight: 600, marginTop: '-8px', marginBottom: '12px' }}>
                  {errorEstatus}
                </div>
              )}

              {(() => {
                const accion = getAccionPendiente(solicitudSeleccionada);
                if (!accion) return null;
                const faltaDireccion = !solicitudSeleccionada.calle;
                return (
                  <div className={styles.alertBanner} style={{ marginBottom: '16px' }}>
                    <FiAlertTriangle style={{ verticalAlign: '-2px', marginRight: '6px' }} />
                    {accion.mensaje}
                    {faltaDireccion && !mostrarFormDireccion && (
                      <button
                        type="button"
                        onClick={() => setMostrarFormDireccion(true)}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#2B6BE4', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
                      >
                        Cargarla manualmente
                      </button>
                    )}
                    {accion.link && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(accion.link);
                          setLinkCopiadoOk(true);
                          setTimeout(() => setLinkCopiadoOk(false), 2500);
                        }}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#2B6BE4', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {linkCopiadoOk ? (<><FiCheck /> ¡Copiado!</>) : (<><FiLink /> Copiar link para continuar</>)}
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* TABS DE SECCIÓN */}
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tab} ${activeTab === 'info' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Información General
                </button>
                <button 
                  className={`${styles.tab} ${activeTab === 'documentos' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('documentos')}
                >
                  Documentación Biométrica
                </button>
              </div>

              {/* CONTENIDO DE TABS */}
              {activeTab === 'info' ? (
                <div className={styles.detailBody}>
                  <div className={styles.sectionHeader}>Datos Personales</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Nombre Completo</span>
                      <span className={styles.infoValue}>{solicitudSeleccionada.cliente}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>CURP</span>
                      <span className={styles.infoValue}>{solicitudSeleccionada.curp || '—'}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Teléfono (WhatsApp)</span>
                      <span className={styles.infoValue}>
                        <a 
                          href={`https://wa.me/52${solicitudSeleccionada.celular}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.waLink}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FaWhatsapp style={{ color: '#25D366' }} /> {solicitudSeleccionada.celular}
                        </a>
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Correo Electrónico</span>
                      <span className={styles.infoValue}>{solicitudSeleccionada.email}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Fecha de Solicitud</span>
                      <span className={styles.infoValue}>{formatearFecha(solicitudSeleccionada.fecha)}</span>
                    </div>
                  </div>

                  <div className={styles.sectionHeader} style={{ marginTop: '24px' }}>Detalles del Plan de Crédito</div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Celular Solicitado</span>
                      <span className={styles.infoValue}>{solicitudSeleccionada.modelo}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Enganche Cobrado</span>
                      <span className={styles.infoValue} style={{ color: '#2B6BE4', fontWeight: 800 }}>
                        ${solicitudSeleccionada.enganche.toLocaleString()}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Plazo Elegido</span>
                      <span className={styles.infoValue}>{solicitudSeleccionada.semanas} semanas</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Cuota Semanal</span>
                      <span className={styles.infoValue}>${solicitudSeleccionada.pagoSemanal}</span>
                    </div>
                  </div>

                  <div className={styles.sectionHeader} style={{ marginTop: '24px' }}>Pago y Envío</div>

                  {mostrarFormDireccion && (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', margin: '10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input placeholder="Calle (sin número ni referencias, máx. 45)" value={direccionForm.calle} onChange={e => setDireccionForm(f => ({ ...f, calle: e.target.value.slice(0, 45) }))} maxLength={45} style={{ gridColumn: 'span 2', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="No. exterior" value={direccionForm.numeroExterior} onChange={e => setDireccionForm(f => ({ ...f, numeroExterior: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="No. interior (opcional)" value={direccionForm.numeroInterior} onChange={e => setDireccionForm(f => ({ ...f, numeroInterior: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="Colonia" value={direccionForm.colonia} onChange={e => setDireccionForm(f => ({ ...f, colonia: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="Alcaldía / Municipio" value={direccionForm.alcaldiaMunicipio} onChange={e => setDireccionForm(f => ({ ...f, alcaldiaMunicipio: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="Estado" value={direccionForm.estado} onChange={e => setDireccionForm(f => ({ ...f, estado: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      <input placeholder="Código postal" value={direccionForm.codigoPostal} onChange={e => setDireccionForm(f => ({ ...f, codigoPostal: e.target.value }))} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                      {errorDireccion && <span style={{ gridColumn: 'span 2', color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>{errorDireccion}</span>}
                      <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={handleGuardarDireccion} disabled={guardandoDireccion} className={styles.btnApprove} style={{ width: 'auto', padding: '8px 16px', fontSize: '13px' }}>
                          {guardandoDireccion ? 'Guardando...' : 'Guardar dirección y generar guía'}
                        </button>
                        <button type="button" onClick={() => setMostrarFormDireccion(false)} style={{ background: 'none', border: 'none', color: '#5A6688', cursor: 'pointer', fontSize: '13px' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Pago del Enganche</span>
                      <span
                        className={styles.infoValue}
                        style={{ color: solicitudSeleccionada.pagoConfirmado ? '#16A34A' : '#D97706', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {solicitudSeleccionada.pagoConfirmado ? (<><FiCheck /> Confirmado</>) : 'Pendiente'}
                      </span>
                    </div>
                    {getMetodoPagoLabel(solicitudSeleccionada.metodoPagoEnganche) && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Método de Pago</span>
                        <span className={styles.infoValue}>
                          {getMetodoPagoLabel(solicitudSeleccionada.metodoPagoEnganche)}
                        </span>
                      </div>
                    )}
                    {solicitudSeleccionada.trackingNumber && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Número de Rastreo</span>
                        <span className={styles.infoValue}>{solicitudSeleccionada.trackingNumber}</span>
                      </div>
                    )}
                    {solicitudSeleccionada.labelUrl && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Guía de Envío</span>
                        <a
                          href={solicitudSeleccionada.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.guideLink}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiPackage /> Ver guía de envío
                        </a>
                      </div>
                    )}
                    {solicitudSeleccionada.reciboUrl && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Comprobante de Pago</span>
                        <a
                          href={solicitudSeleccionada.reciboUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.guideLink}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FiFileText /> Ver recibo de Stripe
                        </a>
                      </div>
                    )}
                    {solicitudSeleccionada.calle && (
                      <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                        <span className={styles.infoLabel}>Dirección de Envío</span>
                        <span className={styles.infoValue}>
                          {solicitudSeleccionada.calle} {solicitudSeleccionada.numeroExterior}
                          {solicitudSeleccionada.numeroInterior ? ` Int. ${solicitudSeleccionada.numeroInterior}` : ''}, {solicitudSeleccionada.colonia}, {solicitudSeleccionada.alcaldiaMunicipio}, {solicitudSeleccionada.estado}, CP {solicitudSeleccionada.codigoPostal}
                        </span>
                      </div>
                    )}
                  </div>

                  {solicitudSeleccionada.pagoConfirmado && (
                    <div style={{ marginTop: '16px' }}>
                      <span className={styles.infoLabel}>IMEI del celular {solicitudSeleccionada.estatus !== 'Enviado' && '(obligatorio antes de marcar como Enviado)'}</span>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <input
                          placeholder="15 dígitos"
                          value={imeiInput}
                          maxLength={15}
                          inputMode="numeric"
                          onChange={e => { setImeiInput(e.target.value.replace(/\D/g, '').slice(0, 15)); setImeiGuardadoOk(false); }}
                          disabled={solicitudSeleccionada.estatus === 'Enviado'}
                          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        />
                        {solicitudSeleccionada.estatus !== 'Enviado' && (
                          <button
                            type="button"
                            onClick={handleGuardarImei}
                            disabled={guardandoImei || imeiInput.trim().length !== 15 || imeiInput.trim() === (solicitudSeleccionada.imei || '')}
                            className={styles.btnApprove}
                            style={{ width: 'auto', padding: '10px 18px', fontSize: '13px' }}
                          >
                            {guardandoImei ? 'Guardando...' : (solicitudSeleccionada.imei ? 'Actualizar IMEI' : 'Guardar IMEI')}
                          </button>
                        )}
                      </div>
                      {imeiGuardadoOk && <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiCheck /> IMEI guardado</span>}
                    </div>
                  )}

                  {solicitudSeleccionada.estatus === 'Pendiente' && (
                    <div className={styles.btnGroup}>
                      <button 
                        className={styles.btnApprove} 
                        onClick={() => handleResolver(solicitudSeleccionada.id, 'Aprobado')}
                      >
                        Aprobar Solicitud
                      </button>
                      <button
                        className={styles.btnReject}
                        onClick={() => handleResolver(solicitudSeleccionada.id, 'Rechazado')}
                      >
                        Rechazar Crédito
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className={styles.documentBody}>
                  <div className={styles.docGrid}>
                    {/* INE Frente */}
                    <div className={styles.docCard}>
                      <h4>INE Frente</h4>
                      <div className={styles.docImageWrap}>
                        {solicitudSeleccionada.ineFrente ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!loadFrente && (
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }}></div>
                            )}
                            <img
                              src={solicitudSeleccionada.ineFrente}
                              alt="INE Frente"
                              className={styles.docImage}
                              onLoad={() => setLoadFrente(true)}
                              onClick={() => setImagenAmpliada({ src: solicitudSeleccionada.ineFrente!, titulo: 'INE Frente' })}
                              title="Clic para ampliar"
                              style={{ opacity: loadFrente ? 1 : 0, transition: 'opacity 0.25s ease', cursor: 'zoom-in' }}
                            />
                            {loadFrente && <span className={styles.zoomHint}><FiZoomIn /> Ampliar</span>}
                          </div>
                        ) : (
                          <div className={styles.noDoc}>Sin foto cargada</div>
                        )}
                      </div>
                    </div>

                    {/* INE Reverso */}
                    <div className={styles.docCard}>
                      <h4>INE Reverso</h4>
                      <div className={styles.docImageWrap}>
                        {solicitudSeleccionada.ineReverso ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!loadReverso && (
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }}></div>
                            )}
                            <img
                              src={solicitudSeleccionada.ineReverso}
                              alt="INE Reverso"
                              className={styles.docImage}
                              onLoad={() => setLoadReverso(true)}
                              onClick={() => setImagenAmpliada({ src: solicitudSeleccionada.ineReverso!, titulo: 'INE Reverso' })}
                              title="Clic para ampliar"
                              style={{ opacity: loadReverso ? 1 : 0, transition: 'opacity 0.25s ease', cursor: 'zoom-in' }}
                            />
                            {loadReverso && <span className={styles.zoomHint}><FiZoomIn /> Ampliar</span>}
                          </div>
                        ) : (
                          <div className={styles.noDoc}>Sin foto cargada</div>
                        )}
                      </div>
                    </div>

                    {/* Selfie */}
                    <div className={styles.docCard} style={{ gridColumn: 'span 2' }}>
                      <h4>Selfie Biométrica</h4>
                      <div className={styles.docImageWrap} style={{ height: '240px' }}>
                        {solicitudSeleccionada.selfie ? (
                          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!loadSelfie && (
                              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '8px' }}></div>
                            )}
                            <img
                              src={solicitudSeleccionada.selfie}
                              alt="Selfie"
                              className={styles.docImage}
                              onLoad={() => setLoadSelfie(true)}
                              onClick={() => setImagenAmpliada({ src: solicitudSeleccionada.selfie!, titulo: 'Selfie Biométrica' })}
                              title="Clic para ampliar"
                              style={{ maxWidth: '240px', opacity: loadSelfie ? 1 : 0, transition: 'opacity 0.25s ease', cursor: 'zoom-in' }}
                            />
                            {loadSelfie && <span className={styles.zoomHint}><FiZoomIn /> Ampliar</span>}
                          </div>
                        ) : (
                          <div className={styles.noDoc}>Sin selfie cargada</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <span className={styles.emptyIcon}><FiFolder /></span>
              <p>Selecciona una solicitud de crédito en el listado para ver su detalle e historial.</p>
            </div>
          )}
        </div>
      )}

      {/* Documento en grande. Se cierra con la X, clic en el fondo o Escape. */}
      {imagenAmpliada && (
        <div className={styles.lightbox} onClick={() => setImagenAmpliada(null)}>
          <div className={styles.lightboxBarra}>
            <span>{imagenAmpliada.titulo}</span>
            <button type="button" onClick={() => setImagenAmpliada(null)} aria-label="Cerrar">
              <FiX />
            </button>
          </div>
          <img
            src={imagenAmpliada.src}
            alt={imagenAmpliada.titulo}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
