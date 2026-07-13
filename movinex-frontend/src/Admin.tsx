import React, { useState, useEffect } from 'react';
import styles from './Admin.module.css';
import type { Solicitud } from './types';

interface AdminProps {
  solicitudes: Solicitud[];
  onUpdateStatus: (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => void;
  onVolver: () => void;
}

export const Admin: React.FC<AdminProps> = ({ solicitudes, onUpdateStatus, onVolver }) => {
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [filtroEstatus, setFiltroEstatus] = useState<'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('Todos');
  const [activeTab, setActiveTab] = useState<'info' | 'documentos'>('info');

  // Seleccionar la primera solicitud por defecto al cargar o al cambiar filtros
  const solicitudesFiltradas = solicitudes.filter(s => 
    filtroEstatus === 'Todos' ? true : s.estatus === filtroEstatus
  );

  useEffect(() => {
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
  }, [filtroEstatus, solicitudes]);

  // Cálculos de métricas
  const totalSolicitudes = solicitudes.length;
  const aprobados = solicitudes.filter(s => s.estatus === 'Aprobado').length;
  const pendientes = solicitudes.filter(s => s.estatus === 'Pendiente').length;
  const rechazados = solicitudes.filter(s => s.estatus === 'Rechazado').length;
  
  const totalEnganchesAprobados = solicitudes
    .filter(s => s.estatus === 'Aprobado')
    .reduce((acc, s) => acc + s.enganche, 0);

  const handleResolver = (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => {
    onUpdateStatus(id, nuevoEstatus);
    // Actualizar el estado local para reflejar el cambio inmediato
    if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
      setSolicitudSeleccionada(prev => prev ? { ...prev, estatus: nuevoEstatus } : null);
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
              {(['Todos', 'Pendiente', 'Aprobado', 'Rechazado'] as const).map(est => (
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
                    <h4>{s.cliente}</h4>
                    <p>{s.modelo} · {s.semanas} sem</p>
                    <small className={styles.fechaText}>{formatearFecha(s.fecha)}</small>
                  </div>
                  <span className={`${styles.status} ${
                    s.estatus === 'Pendiente' ? styles.statusPending : 
                    s.estatus === 'Aprobado' ? styles.statusApproved : styles.statusRejected
                  }`}>
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
                <span className={`${styles.status} ${
                  solicitudSeleccionada.estatus === 'Pendiente' ? styles.statusPending : 
                  solicitudSeleccionada.estatus === 'Aprobado' ? styles.statusApproved : styles.statusRejected
                }`}>
                  {solicitudSeleccionada.estatus}
                </span>
              </div>

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
                          <img src={solicitudSeleccionada.ineFrente} alt="INE Frente" className={styles.docImage} />
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
                          <img src={solicitudSeleccionada.ineReverso} alt="INE Reverso" className={styles.docImage} />
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
                          <img src={solicitudSeleccionada.selfie} alt="Selfie" className={styles.docImage} style={{ maxWidth: '240px' }} />
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
