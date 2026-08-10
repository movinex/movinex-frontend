import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import type { Solicitud } from './types';

type EstatusSolicitud = Solicitud['estatus'];

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
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onVolver: () => void;
}

export const Admin: React.FC<AdminProps> = ({ solicitudes, onUpdateStatus, onSaveImei, onSaveDireccion, onVolver }) => {
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [filtroEstatus, setFiltroEstatus] = useState<'Todos' | EstatusSolicitud>('Todos');
  const [activeTab, setActiveTab] = useState<'info' | 'documentos'>('info');

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

  // Seleccionar la primera solicitud por defecto al cargar o al cambiar filtros
  const solicitudesFiltradas = solicitudes.filter(s => 
    filtroEstatus === 'Todos' ? true : s.estatus === filtroEstatus
  );

  useEffect(() => {
    // Reset loaded states when changing selection
    setLoadFrente(false);
    setLoadReverso(false);
    setLoadSelfie(false);

    if (solicitudesFiltradas.length > 0) {
      // Intentar mantener seleccionada la misma si sigue en la lista filtrada
      const aunExiste = solicitudesFiltradas.find(s => s.id === solicitudSeleccionada?.id);
      if (aunExiste) {
        setSolicitudSeleccionada(aunExiste);
      } else {
        setSolicitudSeleccionada(solicitudesFiltradas[0]);
      }
    } else {
      setSolicitudSeleccionada(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstatus, solicitudes, solicitudSeleccionada?.id]);

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
  
  const totalEnganchesAprobados = solicitudes
    .filter(s => s.estatus === 'Aprobado')
    .reduce((acc, s) => acc + s.enganche, 0);

  const getStatusClass = (estatus: Solicitud['estatus']) => {
    switch (estatus) {
      case 'Pendiente': return styles.statusPending;
      case 'Aprobado': return styles.statusApproved;
      case 'Rechazado': return styles.statusRejected;
      case 'Pendiente de envío': return styles.statusShipping;
      case 'Preparando paquete': return styles.statusPacking;
      case 'Enviado': return styles.statusShipped;
      default: return styles.statusPending;
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
          <span className={styles.metricIcon}>📊</span>
          <div className={styles.metricContent}>
            <h3>Total Solicitudes</h3>
            <strong>{totalSolicitudes}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #FEF3C7' }}>
          <span className={styles.metricIcon} style={{ color: '#D97706' }}>🕒</span>
          <div className={styles.metricContent}>
            <h3>Pendientes</h3>
            <strong style={{ color: '#D97706' }}>{pendientes}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #D1FAE5' }}>
          <span className={styles.metricIcon} style={{ color: '#16A34A' }}>✓</span>
          <div className={styles.metricContent}>
            <h3>Aprobados</h3>
            <strong style={{ color: '#16A34A' }}>{aprobados}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #FEE2E2' }}>
          <span className={styles.metricIcon} style={{ color: '#DC2626' }}>✕</span>
          <div className={styles.metricContent}>
            <h3>Rechazados</h3>
            <strong style={{ color: '#DC2626' }}>{rechazados}</strong>
          </div>
        </div>
        <div className={styles.metricCard} style={{ borderLeft: '4px solid #2B6BE4' }}>
          <span className={styles.metricIcon} style={{ color: '#2B6BE4' }}>💰</span>
          <div className={styles.metricContent}>
            <h3>Enganches Aprobados</h3>
            <strong style={{ color: '#2B6BE4' }}>${totalEnganchesAprobados.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* CONTROL DE LISTADO Y DETALLES */}
      <div className={styles.mainGrid}>
        
        {/* PANEL IZQUIERDO: LISTADO */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Créditos Recibidos</div>
            <div className={styles.filterBar}>
              {(['Todos', 'Pendiente', 'Aprobado', 'Pendiente de envío', 'Preparando paquete', 'Enviado', 'Rechazado'] as const).map(est => (
                <button
                  key={est}
                  className={`${styles.filterBtn} ${filtroEstatus === est ? styles.filterBtnActive : ''}`}
                  onClick={() => setFiltroEstatus(est)}
                >
                  {est}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.list}>
            {solicitudesFiltradas.length > 0 ? (
              solicitudesFiltradas.map(s => (
                <div 
                  key={s.id} 
                  className={`${styles.item} ${solicitudSeleccionada?.id === s.id ? styles.itemActive : ''}`}
                  onClick={() => {
                    setSolicitudSeleccionada(s);
                    setActiveTab('info');
                  }}
                >
                  <div className={styles.clientInfo}>
                    <h4>
                      {s.pagoConfirmado && !s.calle && (
                        <span
                          className={styles.itemAlertDot}
                          title="Pago confirmado, falta la dirección de envío"
                        ></span>
                      )}
                      {s.cliente}
                    </h4>
                    <p>{s.modelo} · {s.semanas} sem</p>
                    <small className={styles.fechaText}>{formatearFecha(s.fecha)}</small>
                  </div>
                  <span className={`${styles.status} ${getStatusClass(s.estatus)}`}>
                    {s.estatus}
                  </span>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>
                No se encontraron solicitudes con este estatus.
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: DETALLES */}
        <div className={styles.panel}>
          {solicitudSeleccionada ? (
            <div className={styles.detailWrapper}>
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
                      <span className={styles.infoLabel}>Teléfono (WhatsApp)</span>
                      <span className={styles.infoValue}>
                        <a 
                          href={`https://wa.me/52${solicitudSeleccionada.celular}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.waLink}
                        >
                          🟢 {solicitudSeleccionada.celular}
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

                  {solicitudSeleccionada.pagoConfirmado && !solicitudSeleccionada.calle && (
                    <div className={styles.alertBanner}>
                      ⚠️ Pago confirmado — falta que el cliente complete su dirección de envío
                      {!mostrarFormDireccion && (
                        <button
                          type="button"
                          onClick={() => setMostrarFormDireccion(true)}
                          style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#2B6BE4', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
                        >
                          Cargarla manualmente
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const link = `${window.location.origin}/domicilio?solicitud=${solicitudSeleccionada.id}&modelo=${encodeURIComponent(solicitudSeleccionada.modelo)}`;
                          navigator.clipboard.writeText(link);
                          setLinkCopiadoOk(true);
                          setTimeout(() => setLinkCopiadoOk(false), 2500);
                        }}
                        style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#2B6BE4', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
                      >
                        {linkCopiadoOk ? '✓ ¡Copiado!' : '🔗 Copiar link para continuar'}
                      </button>
                    </div>
                  )}

                  {mostrarFormDireccion && (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', margin: '10px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <input placeholder="Calle" value={direccionForm.calle} onChange={e => setDireccionForm(f => ({ ...f, calle: e.target.value }))} style={{ gridColumn: 'span 2', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
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
                        style={{ color: solicitudSeleccionada.pagoConfirmado ? '#16A34A' : '#D97706', fontWeight: 700 }}
                      >
                        {solicitudSeleccionada.pagoConfirmado ? '✓ Confirmado' : 'Pendiente'}
                      </span>
                    </div>
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
                        >
                          📦 Ver guía de envío
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
                        >
                          🧾 Ver recibo de Stripe
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
                      {imeiGuardadoOk && <span style={{ color: '#16A34A', fontSize: '12px', fontWeight: 700 }}>✓ IMEI guardado</span>}
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
                              style={{ opacity: loadFrente ? 1 : 0, transition: 'opacity 0.25s ease' }}
                            />
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
                              style={{ opacity: loadReverso ? 1 : 0, transition: 'opacity 0.25s ease' }}
                            />
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
                              style={{ maxWidth: '240px', opacity: loadSelfie ? 1 : 0, transition: 'opacity 0.25s ease' }}
                            />
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
              <span className={styles.emptyIcon}>📂</span>
              <p>Selecciona una solicitud de crédito en el listado para ver su detalle e historial.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
