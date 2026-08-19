import React, { useState } from 'react';
import styles from './Sadmin.module.css';
import logoBlanco from './assets/movinex_blanco.webp';

interface SadminLoginProps {
  onLoginSuccess: (admin: any, token: string) => void;
  onVolver: () => void;
}

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

      if (response.ok && data.success && data.token) {
        onLoginSuccess(data.admin, data.token);
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
              {/* Nada de un email de ejemplo real en el placeholder: antes decía
                  literalmente el usuario admin, así que a cualquiera que abriera esta
                  pantalla solo le faltaba adivinar la contraseña. */}
              <input
                id="usuario"
                type="email"
                placeholder="Ingresa tu correo electrónico"
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
