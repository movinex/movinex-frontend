import React, { useState } from 'react';
import styles from './Documentos.module.css';
import logoBlanco from './assets/movinex_blanco.png';

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
    modelo: string;
  };
  onFinalizado: (datos: {
    cliente: string;
    celular: string;
    email: string;
    modelo: string;
    enganche: number;
    semanas: number;
    pagoSemanal: number;
    ineFrente: string;
    ineReverso: string;
    selfie: string;
  }) => void;
  onVolver: () => void;
}

// Utilidad para comprimir y convertir imágenes a Base64
const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > width && height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(dataUrl.split(',')[1]);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      img.onerror = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('FileReader result is empty'));
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = (error) => reject(error);
  });
};

export const Documentos: React.FC<DocumentosProps> = ({ planData, onFinalizado, onVolver }) => {
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [ineFrente, setIneFrente] = useState<File | null>(null);
  const [ineReverso, setIneReverso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [status, setStatus] = useState<'form' | 'subiendo' | 'exito' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  // Estados para persistir base64 de las imágenes
  const [ineFrenteBase64, setIneFrenteBase64] = useState<string>('');
  const [ineReversoBase64, setIneReversoBase64] = useState<string>('');
  const [selfieBase64, setSelfieBase64] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !celular || !email || !ineFrente || !ineReverso || !selfie) return;

    setStatus('subiendo');
    setErrorMessage('');

    try {
      // Comprimir imágenes de manera concurrente
      const [ineFrenteB64, ineReversoB64, selfieB64] = await Promise.all([
        compressAndGetBase64(ineFrente),
        compressAndGetBase64(ineReverso),
        compressAndGetBase64(selfie)
      ]);

      const formattedFrente = `data:image/jpeg;base64,${ineFrenteB64}`;
      const formattedReverso = `data:image/jpeg;base64,${ineReversoB64}`;
      const formattedSelfie = `data:image/jpeg;base64,${selfieB64}`;

      setIneFrenteBase64(formattedFrente);
      setIneReversoBase64(formattedReverso);
      setSelfieBase64(formattedSelfie);

      // Enviar solicitud de manera segura a nuestro Backend
      const response = await fetch('https://movinex-backend-production.up.railway.app/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: nombre.trim(),
          celular: celular.trim(),
          email: email.trim(),
          modelo: planData.modelo,
          enganche: planData.enganche,
          semanas: planData.semanas,
          pago_semanal: planData.pagoSemanal,
          ine_frente: formattedFrente,
          ine_reverso: formattedReverso,
          selfie: formattedSelfie
        })
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.error || 'Ocurrió un error al procesar tu solicitud.');
      }

      setStatus('exito');
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Ocurrió un error al procesar tu solicitud de crédito. Por favor intenta de nuevo.');
      setStatus('error');
    }
  };

  const isFormValid =
    nombre.trim() !== '' &&
    celular.trim().length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    ineFrente !== null &&
    ineReverso !== null &&
    selfie !== null;

  if (status === 'subiendo') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.spinner}></div>
              <div className={styles.et}>Verificando Identidad</div>
              <div className={styles.ed}>Estamos verificando tu INE ante fuentes oficiales. No cierres esta ventana.</div>
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
              <div className={styles.et}>🎉 ¡Felicidades, fuiste autorizado!</div>
              <div className={styles.ed}>Tu identidad quedó validada. El siguiente paso es tu enganche de <b>${planData.enganche}</b> para apartar tu equipo.</div>
              <button className={styles.cta} onClick={() => onFinalizado({
                cliente: nombre.trim(),
                celular: celular.trim(),
                email: email.trim(),
                modelo: planData.modelo,
                enganche: planData.enganche,
                semanas: planData.semanas,
                pagoSemanal: planData.pagoSemanal,
                ineFrente: ineFrenteBase64,
                ineReverso: ineReversoBase64,
                selfie: selfieBase64
              })}>Pagar enganche →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.badgeErr}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div className={styles.et}>No pudimos verificarte</div>
              <div className={styles.ed}>{errorMessage}</div>
              <button className={styles.cta} onClick={() => setStatus('form')}>Volver a intentar</button>
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
              <label htmlFor="celular">Número de Celular (WhatsApp)</label>
              <input
                id="celular"
                type="tel"
                placeholder="55 1234 5678"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                maxLength={10}
                required
              />
              <div className={styles.hint}>Ahí te enviaremos el seguimiento de tu crédito.</div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
