import React, { useState } from 'react';
import styles from './Documentos.module.css';
import logoBlanco from './assets/movinex_blanco.png';

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
  };
  onFinalizado: () => void;
  onVolver: () => void;
}

export const Documentos: React.FC<DocumentosProps> = ({ planData, onFinalizado, onVolver }) => {
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [ineFrente, setIneFrente] = useState<File | null>(null);
  const [ineReverso, setIneReverso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [status, setStatus] = useState<'form' | 'subiendo' | 'exito' | 'error'>('form');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !celular || !ineFrente || !ineReverso || !selfie) return;

    setStatus('subiendo');

    // Simulación de envío/KYC
    setTimeout(() => {
      setStatus('exito');
    }, 2000);
  };

  const isFormValid = nombre.trim() !== '' && celular.trim().length >= 10 && ineFrente !== null && ineReverso !== null && selfie !== null;

  if (status === 'subiendo') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.spinner}></div>
              <div className={styles.et}>Verificando Identidad</div>
              <div className={styles.ed}>Procesando tus documentos mediante Verificamex para validación biométrica.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'exito') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.badgeOk}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div className={styles.et}>¡Identidad Validada!</div>
              <div className={styles.ed}>Tu información ha sido validada con éxito. En unos momentos un asesor te contactará para finalizar tu firma.</div>
              <button className={styles.cta} onClick={onFinalizado}>Entendido</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <img src={logoBlanco} alt="Movinex Logo" className={styles.logo} />
          <div className={styles.eyebrow}>Verifica tu identidad</div>
          <div className={styles.titulo}>Sube tus documentos</div>
          <div className={styles.sub}>Para autorizar tu crédito requerimos validar tu identidad de forma segura.</div>
        </div>

        <div className={styles.body}>
          <div className={styles.planChip}>
            <div className={styles.ico}></div>
            <div>
              Plan elegido: <b>{planData.semanas} semanas</b> de <b>${planData.pagoSemanal}/sem</b> con enganche de <b>${planData.enganche}</b>.
            </div>
          </div>

          <form onSubmit={handleEnviar}>
            <div className={styles.lbl}>Datos de contacto</div>
            
            <div className={styles.campo}>
              <label htmlFor="nombre">Nombre completo (como aparece en tu INE)</label>
              <input
                id="nombre"
                type="text"
                placeholder="Juan Pérez López"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="celular">Número de Celular</label>
              <input
                id="celular"
                type="tel"
                placeholder="55 1234 5678"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                maxLength={10}
                required
              />
              <div className={styles.hint}>Se enviará un código de verificación por SMS.</div>
            </div>

            <div className={styles.lbl} style={{ marginTop: '20px' }}>Fotografía de tu INE y Selfie</div>

            {/* Frente */}
            <div className={`${styles.drop} ${ineFrente ? styles.cargado : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setIneFrente)}
                required
              />
              <div className={styles.thumb}>
                {ineFrente ? (
                  <img src={URL.createObjectURL(ineFrente)} alt="Frente INE" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="4"></line>
                    <line x1="8" y1="2" x2="8" y2="4"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Frente de tu INE</div>
                <div className={styles.d}>{ineFrente ? 'Foto cargada correctamente' : 'Haz clic para tomar foto o subir'}</div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

            {/* Reverso */}
            <div className={`${styles.drop} ${ineReverso ? styles.cargado : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setIneReverso)}
                required
              />
              <div className={styles.thumb}>
                {ineReverso ? (
                  <img src={URL.createObjectURL(ineReverso)} alt="Reverso INE" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="4"></line>
                    <line x1="8" y1="2" x2="8" y2="4"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Reverso de tu INE</div>
                <div className={styles.d}>{ineReverso ? 'Foto cargada correctamente' : 'Haz clic para tomar foto o subir'}</div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

            {/* Selfie */}
            <div className={`${styles.drop} ${selfie ? styles.cargado : ''}`}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setSelfie)}
                required
              />
              <div className={styles.thumb}>
                {selfie ? (
                  <img src={URL.createObjectURL(selfie)} alt="Selfie" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="9" r="4"></circle>
                    <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"></path>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Selfie</div>
                <div className={styles.d}>{selfie ? 'Foto cargada correctamente' : 'Tu rostro, bien iluminado'}</div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

            <div className={styles.privacidad}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Tus datos biométricos y fotos se encriptan de extremo a extremo conforme a la Ley de Protección de Datos Personales.
            </div>

            <button type="submit" className={styles.cta} disabled={!isFormValid}>
              Enviar y Verificar Identidad
            </button>

            <button type="button" className={styles.cta} style={{ background: '#E4E8F1', color: '#5A6688', marginTop: '10px', boxShadow: 'none' }} onClick={onVolver}>
              Volver al cotizador
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
