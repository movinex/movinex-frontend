import React, { useState } from 'react';
import styles from './Sadmin.module.css';
import logoBlanco from './assets/movinex_blanco.webp';
import { Admin } from './Admin';
import type { Phone, Solicitud } from './types';

interface SadminProps {
  solicitudes: Solicitud[];
  onUpdateStatus: (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => void;
  onVolver: () => void;
  phones: Phone[];
  onReloadPhones: () => void;
}

export const SadminPortal: React.FC<SadminProps> = ({
  solicitudes,
  onUpdateStatus,
  onVolver,
  phones,
  onReloadPhones
}) => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activePortalTab, setActivePortalTab] = useState<'solicitudes' | 'celulares'>('solicitudes');

  // Form states for CRUD
  const [editingPhone, setEditingPhone] = useState<Phone | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [id, setId] = useState('');
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [precioBase, setPrecioBase] = useState(0);
  const [enganche, setEnganche] = useState(0);
  const [montoSemanal26, setMontoSemanal26] = useState(0);
  const [montoSemanal52, setMontoSemanal52] = useState(0);
  const [imagenUrl, setImagenUrl] = useState('');
  const [envioGratis, setEnvioGratis] = useState(true);
  const [costoEnvio, setCostoEnvio] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  const resetForm = () => {
    setId('');
    setModelo('');
    setMarca('');
    setPrecioBase(0);
    setEnganche(0);
    setMontoSemanal26(0);
    setMontoSemanal52(0);
    setImagenUrl('');
    setEnvioGratis(true);
    setCostoEnvio(0);
    setEditingPhone(null);
    setIsAdding(false);
    setError('');
  };

  const handleEdit = (phone: Phone) => {
    setEditingPhone(phone);
    setIsAdding(false);
    setId(phone.id);
    setModelo(phone.modelo);
    setMarca(phone.marca);
    setPrecioBase(phone.precioBase);
    setEnganche(phone.enganche);
    setMontoSemanal26(phone.montoSemanal26);
    setMontoSemanal52(phone.montoSemanal52);
    setImagenUrl(phone.imagen);
    setEnvioGratis(phone.envioGratis !== false);
    setCostoEnvio(phone.costoEnvio || 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      id,
      modelo,
      marca,
      precio_base: precioBase,
      enganche,
      monto_semanal_26: montoSemanal26,
      monto_semanal_52: montoSemanal52,
      imagen: imagenUrl,
      envio_gratis: envioGratis,
      costo_envio: envioGratis ? 0 : costoEnvio
    };

    try {
      const url = isAdding ? `${backendUrl}/api/celulares` : `${backendUrl}/api/celulares/${id}`;
      const method = isAdding ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onReloadPhones();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al guardar los datos del celular.');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (phoneId: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este celular del catálogo?')) return;
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/api/celulares/${phoneId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        onReloadPhones();
      } else {
        alert('Error al eliminar celular.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // If not logged in, render SadminLogin view
  if (!adminUser) {
    return (
      <SadminLogin
        onLoginSuccess={(user) => setAdminUser(user)}
        onVolver={onVolver}
      />
    );
  }

  return (
    <div className={styles.portalWrap}>
      {/* HEADER PRINCIPAL */}
      <header className={styles.portalHeader}>
        <div className={styles.portalHeaderLeft}>
          <img src={logoBlanco} alt="Movinex Logo" className={styles.portalLogo} />
          <div className={styles.userInfo}>
            Bienvenido, <strong>{adminUser.nombre}</strong> (Super Admin)
          </div>
        </div>
        <div className={styles.portalHeaderActions}>
          <button className={styles.tabBtn} onClick={() => setActivePortalTab('solicitudes')} style={{ background: activePortalTab === 'solicitudes' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            📋 Ver Créditos
          </button>
          <button className={styles.tabBtn} onClick={() => setActivePortalTab('celulares')} style={{ background: activePortalTab === 'celulares' ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
            📱 Catálogo Celulares
          </button>
          <button className={styles.logoutBtn} onClick={() => setAdminUser(null)}>
            Salir
          </button>
        </div>
      </header>

      {/* CONTENIDO INTERNO */}
      <div className={styles.portalContent}>
        {activePortalTab === 'solicitudes' ? (
          <Admin
            solicitudes={solicitudes}
            onUpdateStatus={onUpdateStatus}
            onVolver={onVolver}
          />
        ) : (
          <div className={styles.crudContainer}>
            <div className={styles.crudHeader}>
              <h2>Catálogo de Equipos Celulares</h2>
              {!isAdding && !editingPhone && (
                <button className={styles.addBtn} onClick={() => { setIsAdding(true); resetForm(); setIsAdding(true); }}>
                  + Agregar Nuevo Celular
                </button>
              )}
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            {(isAdding || editingPhone) ? (
              <form onSubmit={handleSave} className={styles.crudForm}>
                <h3>{isAdding ? 'Agregar Nuevo Celular' : `Editar Celular: ${modelo}`}</h3>
                
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Identificador Único (ID)</label>
                    <input
                      type="text"
                      placeholder="ej. samsung-s24"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      disabled={!!editingPhone}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Marca</label>
                    <input
                      type="text"
                      placeholder="ej. Samsung, Apple, Xiaomi"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Modelo</label>
                    <input
                      type="text"
                      placeholder="ej. Galaxy S24 Ultra"
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Precio Base (Pesos MXN)</label>
                    <input
                      type="number"
                      placeholder="ej. 12999"
                      value={precioBase}
                      onChange={(e) => setPrecioBase(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pago Inicial (Enganche en Pesos)</label>
                    <input
                      type="number"
                      placeholder="ej. 1999"
                      value={enganche}
                      onChange={(e) => setEnganche(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pago Semanal (Plazo 26 Semanas)</label>
                    <input
                      type="number"
                      placeholder="ej. 320"
                      value={montoSemanal26}
                      onChange={(e) => setMontoSemanal26(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Pago Semanal (Plazo 52 Semanas)</label>
                    <input
                      type="number"
                      placeholder="ej. 175"
                      value={montoSemanal52}
                      onChange={(e) => setMontoSemanal52(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>URL de la Imagen</label>
                    <input
                      type="text"
                      placeholder="ej. https://dominio.com/imagen.png"
                      value={imagenUrl}
                      onChange={(e) => setImagenUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>¿Envío Gratis?</label>
                    <select
                      value={envioGratis ? 'si' : 'no'}
                      onChange={(e) => setEnvioGratis(e.target.value === 'si')}
                    >
                      <option value="si">Sí, Envío Gratis</option>
                      <option value="no">Con Costo Adicional</option>
                    </select>
                  </div>

                  {!envioGratis && (
                    <div className={styles.formGroup}>
                      <label>Costo de Envío ($ MXN)</label>
                      <input
                        type="number"
                        placeholder="ej. 150"
                        value={costoEnvio}
                        onChange={(e) => setCostoEnvio(Number(e.target.value))}
                        required
                      />
                    </div>
                  )}
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn} disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Celular'}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.crudTable}>
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>ID</th>
                      <th>Modelo</th>
                      <th>Marca</th>
                      <th>Precio Base</th>
                      <th>Enganche</th>
                      <th>Semanal (26/52)</th>
                      <th>Envío</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phones.map((phone) => (
                      <tr key={phone.id}>
                        <td>
                          <img src={phone.imagen} alt={phone.modelo} className={styles.tableImg} />
                        </td>
                        <td><code>{phone.id}</code></td>
                        <td><strong>{phone.modelo}</strong></td>
                        <td>{phone.marca}</td>
                        <td>${phone.precioBase.toLocaleString()}</td>
                        <td>${phone.enganche.toLocaleString()}</td>
                        <td>${phone.montoSemanal26}/${phone.montoSemanal52}</td>
                        <td>{phone.envioGratis !== false ? 'Gratis' : `$${phone.costoEnvio || 0}`}</td>
                        <td>
                          <button className={styles.editBtn} onClick={() => handleEdit(phone)}>
                            Editar
                          </button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(phone.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SadminLoginProps {
  onLoginSuccess: (admin: any) => void;
  onVolver: () => void;
}

// SadminLogin is declared below
export const SadminLogin: React.FC<SadminLoginProps> = ({ onLoginSuccess, onVolver }) => {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.admin);
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos.');
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <img src={logoBlanco} alt="Movinex Logo" className={styles.logo} />
          <div className={styles.eyebrow}>Portal Privado</div>
          <div className={styles.titulo}>Acceso Super Admin</div>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.campo}>
              <label htmlFor="usuario">Usuario Administrador</label>
              <input
                id="usuario"
                type="email"
                placeholder="admin@movinex.mx"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="clave">Contraseña</label>
              <input
                id="clave"
                type="password"
                placeholder="••••••••"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.cta} disabled={loading}>
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </button>

            <button type="button" className={styles.volver} onClick={onVolver}>
              Regresar al inicio
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
