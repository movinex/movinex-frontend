import React, { useState } from 'react';
import styles from './Admin.module.css';

interface Solicitud {
  id: string;
  cliente: string;
  celular: string;
  modelo: string;
  enganche: number;
  semanas: number;
  pagoSemanal: number;
  estatus: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export const Admin: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([
    { id: '1', cliente: 'Juan Pérez López', celular: '5512345678', modelo: 'Samsung Galaxy S24 Ultra', enganche: 2999, semanas: 26, pagoSemanal: 425, estatus: 'Pendiente' },
    { id: '2', cliente: 'María Rodríguez García', celular: '5598765432', modelo: 'iPhone 15 Pro Max', enganche: 3999, semanas: 52, pagoSemanal: 310, estatus: 'Aprobado' }
  ]);

  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(solicitudes[0]);

  const handleResolver = (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estatus: nuevoEstatus } : s));
    if (solicitudSeleccionada && solicitudSeleccionada.id === id) {
      setSolicitudSeleccionada(prev => prev ? { ...prev, estatus: nuevoEstatus } : null);
    }
  };

  return (
    <div className={styles.adminWrap}>
      <div className={styles.header}>
        <h1>Movinex Portal</h1>
        <span className={styles.badge}>Backoffice de Procesamiento</span>
      </div>

      <div className={styles.grid} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Lista de solicitudes */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Solicitudes de Crédito</div>
          <div className={styles.list}>
            {solicitudes.map(s => (
              <div 
                key={s.id} 
                className={styles.item}
                onClick={() => setSolicitudSeleccionada(s)}
                style={{ borderColor: solicitudSeleccionada?.id === s.id ? 'var(--azul)' : '' }}
              >
                <div className={styles.clientInfo}>
                  <h4>{s.cliente}</h4>
                  <p>{s.modelo}</p>
                </div>
                <span className={`${styles.status} ${s.estatus === 'Pendiente' ? styles.statusPending : styles.statusApproved}`}>
                  {s.estatus}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle de la solicitud seleccionada */}
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Detalle del Cliente</div>
          {solicitudSeleccionada ? (
            <div className={styles.detail}>
              <div className={styles.detailRow}>
                <span>Nombre Completo</span>
                <span>{solicitudSeleccionada.cliente}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Celular</span>
                <span>{solicitudSeleccionada.celular}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Equipo</span>
                <span>{solicitudSeleccionada.modelo}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Enganche Cobrado</span>
                <span>${solicitudSeleccionada.enganche.toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Plazo Solicitado</span>
                <span>{solicitudSeleccionada.semanas} Semanas</span>
              </div>
              <div className={styles.detailRow}>
                <span>Pago Semanal</span>
                <span>${solicitudSeleccionada.pagoSemanal}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Estatus Actual</span>
                <span style={{ color: solicitudSeleccionada.estatus === 'Pendiente' ? '#D97706' : 'var(--ok)' }}>
                  {solicitudSeleccionada.estatus}
                </span>
              </div>

              {solicitudSeleccionada.estatus === 'Pendiente' && (
                <div className={styles.btnGroup}>
                  <button 
                    className={styles.btnApprove} 
                    onClick={() => handleResolver(solicitudSeleccionada.id, 'Aprobado')}
                  >
                    Aprobar Crédito
                  </button>
                  <button 
                    className={styles.btnReject} 
                    onClick={() => handleResolver(solicitudSeleccionada.id, 'Rechazado')}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p style={{ color: 'var(--gris)', textAlign: 'center' }}>Selecciona una solicitud para procesar</p>
          )}
        </div>
      </div>
    </div>
  );
};
