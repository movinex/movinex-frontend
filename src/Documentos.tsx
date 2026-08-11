import React, { useState } from "react";
import { useNavigate } from "react-router";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";
import { FiCamera, FiUpload, FiCheck, FiAward, FiClock } from "react-icons/fi";

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
    modelo: string;
    envioGratis?: boolean;
    costoEnvio?: number;
  };
  onVolver: () => void;
  // Presentes solo al reanudar una solicitud desde /documentos?solicitud=X (ver
  // DocumentosRoute en App.tsx) — el celular ya está verificado y la solicitud ya
  // existe, así que el formulario arranca más adelante en vez de pedir el OTP de nuevo.
  initialSolicitudId?: string;
  initialCelular?: string;
  initialEmail?: string;
  initialOtpVerificado?: boolean;
  initialDocsGuardados?: { ineFrente: boolean; ineReverso: boolean; selfie: boolean };
}

const compressAndGetBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > width && height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
          resolve(dataUrl.split(",")[1]);
        } else {
          reject(new Error("Canvas context not available"));
        }
      };
      img.onerror = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result.split(",")[1]);
        } else {
          reject(new Error("FileReader result is empty"));
        }
      };
      img.src = reader.result as string;
    };
    reader.onerror = (error) => reject(error);
  });
};

export const Documentos: React.FC<DocumentosProps> = ({
  planData,
  onVolver,
  initialSolicitudId,
  initialCelular,
  initialEmail,
  initialOtpVerificado,
  initialDocsGuardados,
}) => {
  const navigate = useNavigate();
  const [celular, setCelular] = useState(initialCelular || "");
  const [email, setEmail] = useState(initialEmail || "");
  const [ineFrente, setIneFrente] = useState<File | null>(null);
  const [ineReverso, setIneReverso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  // Independiente de los File de arriba: al reanudar una solicitud no hay un File en
  // memoria (la foto ya se subió en otra sesión), pero igual hay que mostrar la
  // tarjeta como cargada y dejar avanzar el formulario.
  const [ineFrenteGuardado, setIneFrenteGuardado] = useState(initialDocsGuardados?.ineFrente || false);
  const [ineReversoGuardado, setIneReversoGuardado] = useState(initialDocsGuardados?.ineReverso || false);
  const [selfieGuardado, setSelfieGuardado] = useState(initialDocsGuardados?.selfie || false);
  const [guardandoCampo, setGuardandoCampo] = useState<string | null>(null);
  const [errorProgreso, setErrorProgreso] = useState("");

  const [status, setStatus] = useState<
    "form" | "subiendo" | "exito" | "error"
  >("form");
  const [errorMessage, setErrorMessage] = useState("");

  const [solicitudId, setSolicitudId] = useState<string>(initialSolicitudId || "");
  const [esAprobadoDirecto, setEsAprobadoDirecto] = useState<boolean>(true);

  // Verificación del celular por OTP de WhatsApp, ANTES de poder llenar el resto del
  // formulario — evita que un bot/script mande INE y selfie falsos sin un WhatsApp real
  // detrás. El código vence a los 10 minutos (WhatsappOtpService del backend).
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [otpVerificado, setOtpVerificado] = useState(initialOtpVerificado || false);
  const [otpCodigo, setOtpCodigo] = useState("");
  const [otpEnviando, setOtpEnviando] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Pago del enganche con Stripe Checkout (página hosteada por Stripe — la tarjeta del
  // cliente nunca pasa por nuestro servidor). El celular ya quedó verificado más
  // arriba, así que acá no se vuelve a pedir OTP.
  const [iniciandoPago, setIniciandoPago] = useState(false);
  const [pagoError, setPagoError] = useState("");
  const [aprobandoManual, setAprobandoManual] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  const handleEnviarOtpInicial = async () => {
    if (celular.length < 10) return;
    setOtpEnviando(true);
    setOtpError("");
    try {
      const response = await fetch(`${backendUrl}/api/otp/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ celular }),
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "No se pudo enviar el código de verificación.");
      }
      setOtpEnviado(true);
      setOtpCodigo("");
    } catch (error: any) {
      setOtpError(error.message || "Ocurrió un error al enviar el código.");
    } finally {
      setOtpEnviando(false);
    }
  };

  // Crea la solicitud apenas se verifica el OTP (celular + plan elegido, todavía sin
  // email/INE/selfie) para no perder el lead si se cae del formulario a mitad de
  // camino, y refleja el id en la URL para poder reanudar. Separada de
  // handleVerificarOtpInicial para poder reintentarla sola si falla, sin pedir el
  // código de nuevo (el OTP ya quedó verificado del lado del backend).
  const crearSolicitudSiHaceFalta = async () => {
    if (solicitudId) return;
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/iniciar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          celular: celular.trim(),
          modelo: planData.modelo,
          enganche: planData.enganche,
          semanas: planData.semanas,
          pago_semanal: planData.pagoSemanal,
          costoEnvio: planData.envioGratis === false ? (planData.costoEnvio || 0) : 0,
        }),
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || "No se pudo iniciar tu solicitud.");
      }
      setSolicitudId(res.solicitud.id);
      navigate(`/documentos?solicitud=${res.solicitud.id}`, { replace: true });
    } catch (error: any) {
      setOtpError(error.message || "No se pudo iniciar tu solicitud. Intenta de nuevo.");
    }
  };

  const handleVerificarOtpInicial = async () => {
    setOtpEnviando(true);
    setOtpError("");
    try {
      const response = await fetch(`${backendUrl}/api/otp/verificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ celular, codigo: otpCodigo }),
      });
      const res = await response.json();
      if (!response.ok || !res.verificado) {
        throw new Error(res.error || "Código incorrecto o expirado.");
      }
      setOtpVerificado(true);
      await crearSolicitudSiHaceFalta();
    } catch (error: any) {
      setOtpError(error.message || "Ocurrió un error al verificar el código.");
    } finally {
      setOtpEnviando(false);
    }
  };

  // Guarda un campo (email, o una foto ya en base64) apenas está listo, sin esperar al
  // submit final — así no se pierde nada si el cliente se cae del formulario a mitad
  // de camino. Se puede llamar varias veces, cada vez con lo que corresponda.
  const guardarProgreso = async (campos: Record<string, string>, nombreCampo: string): Promise<boolean> => {
    if (!solicitudId) return false;
    setGuardandoCampo(nombreCampo);
    setErrorProgreso("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/progreso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos),
      });
      if (!response.ok) {
        const res = await response.json().catch(() => ({}));
        throw new Error(res.error || "No se pudo guardar.");
      }
      return true;
    } catch (error: any) {
      setErrorProgreso(error.message || "No se pudo guardar. Intenta de nuevo.");
      return false;
    } finally {
      setGuardandoCampo(null);
    }
  };

  // Pide al backend una Checkout Session de Stripe y redirige al cliente a la página
  // hosteada por Stripe para pagar. Stripe lo trae de vuelta solo a /domicilio si el
  // pago sale bien (o a "/" si cancela) — la confirmación real la hace el webhook
  // checkout.session.completed, no esta respuesta.
  const handleIniciarPago = async () => {
    setIniciandoPago(true);
    setPagoError("");
    try {
      const ordenResponse = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/crear-orden-enganche`, {
        method: "POST",
      });
      const ordenRes = await ordenResponse.json();
      if (!ordenResponse.ok) {
        throw new Error(ordenRes.error || "No se pudo iniciar el pago.");
      }
      window.location.href = ordenRes.checkoutUrl;
    } catch (error: any) {
      setPagoError(error.message || "Ocurrió un error al iniciar el pago.");
      setIniciandoPago(false);
    }
  };

  // Bypass TEMPORAL: salta el pago real y avanza igual al paso de Domicilio, para
  // poder seguir probando Skydropx sin cobrar una tarjeta real. Quitar antes de ir a
  // producción definitiva (Trello MX-0061).
  const handleAprobarManual = async () => {
    setAprobandoManual(true);
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/aprobar-pago-manual`, {
        method: "POST",
      });
      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "No se pudo aprobar el pago manualmente.");
      }
      navigate(`/domicilio?solicitud=${solicitudId}&modelo=${encodeURIComponent(planData.modelo)}`);
    } catch (error: any) {
      setPagoError(error.message || "No se pudo continuar. Intenta de nuevo.");
    } finally {
      setAprobandoManual(false);
    }
  };

  // Además de guardar el File localmente (para la vista previa), sube la foto al
  // backend ya mismo — no espera al submit final, así no se pierde si el cliente se
  // cae del formulario a mitad de camino.
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    campoBackend: "ine_frente" | "ine_reverso" | "selfie",
    setGuardado: (v: boolean) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);
    setGuardado(false);
    try {
      const base64 = await compressAndGetBase64(file);
      const ok = await guardarProgreso({ [campoBackend]: `data:image/jpeg;base64,${base64}` }, campoBackend);
      if (ok) setGuardado(true);
    } catch {
      // guardarProgreso ya dejó el error en errorProgreso
    }
  };

  // Dos botones en vez de un solo input cubriendo toda la tarjeta: "Tomar foto" abre la
  // cámara directo en el celular (atributo `capture`), "Subir archivo" abre la galería/
  // explorador normal, sin forzar una sobre la otra.
  const botonCaptura = { flex: 1, textAlign: "center" as const, background: "#F1F5F9", border: "1.5px solid #E2E8F0", padding: "8px 10px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#334155" };

  const renderBotonesCaptura = (
    idPrefix: string,
    captureMode: "environment" | "user",
    setter: (file: File | null) => void,
    campoBackend: "ine_frente" | "ine_reverso" | "selfie",
    setGuardado: (v: boolean) => void,
  ) => (
    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
      <input
        type="file"
        accept="image/*"
        capture={captureMode}
        onChange={(e) => handleFileChange(e, setter, campoBackend, setGuardado)}
        style={{ display: "none" }}
        id={`${idPrefix}-camara`}
      />
      <label htmlFor={`${idPrefix}-camara`} style={botonCaptura}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}><FiCamera /> Tomar foto</span>
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, setter, campoBackend, setGuardado)}
        style={{ display: "none" }}
        id={`${idPrefix}-archivo`}
      />
      <label htmlFor={`${idPrefix}-archivo`} style={botonCaptura}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", justifyContent: "center" }}><FiUpload /> Subir archivo</span>
      </label>
    </div>
  );

  // Todo lo demás (email, INE, selfie) ya se guardó progresivamente vía
  // guardarProgreso — acá solo se cierra el ciclo: corre Verificamex con lo que ya
  // está guardado y decide el estatus final.
  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitudId || !isFormValid) return;

    setStatus("subiendo");
    setErrorMessage("");

    try {
      const response = await fetch(
        `${backendUrl}/api/solicitudes/${solicitudId}/finalizar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aceptaTerminos }),
        },
      );
      const res = await response.json();

      if (!response.ok) {
        throw new Error(
          res.error || "Ocurrió un error al procesar tu solicitud.",
        );
      }

      const fueAprobado = res.solicitud?.estatus === "Aprobado";
      setEsAprobadoDirecto(fueAprobado);

      setStatus("exito");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.message ||
          "Ocurrió un error al procesar tu solicitud de crédito. Por favor intenta de nuevo.",
      );
      setStatus("error");
    }
  };

  const isFormValid =
    otpVerificado &&
    celular.trim().length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    ineFrenteGuardado &&
    ineReversoGuardado &&
    selfieGuardado &&
    aceptaTerminos;

  if (status === "subiendo") {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.spinner}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "exito") {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={esAprobadoDirecto ? styles.badgeOk : styles.badgeInfo}>
                {esAprobadoDirecto ? (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                )}
              </div>
              <div className={styles.et} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {esAprobadoDirecto
                  ? (<><FiAward /> ¡Felicidades, fuiste autorizado!</>)
                  : (<><FiClock /> Tu solicitud está en revisión manual</>)}
              </div>
              <div className={styles.ed} style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {esAprobadoDirecto 
                  ? `Tu identidad quedó validada. El siguiente paso es el pago inicial para procesar el envío de tu ${planData.modelo}:`
                  : `Tu identidad está siendo analizada por nuestro equipo de prevención. Para agilizar el proceso y reservar tu ${planData.modelo}, puedes proceder a realizar tu pago inicial:`}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '12px', borderRadius: '10px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Enganche requerido:</span>
                    <span style={{ fontWeight: '700', color: '#0F172A' }}>${planData.enganche.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Costo de envío:</span>
                    <span style={{ fontWeight: '700', color: planData.envioGratis !== false ? '#10B981' : '#0F172A' }}>
                      {planData.envioGratis !== false ? '¡Gratis!' : `$${(planData.costoEnvio || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px dashed #CBD5E1', margin: '6px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800' }}>
                    <span style={{ color: '#2B6BE4' }}>Total Inicial a pagar:</span>
                    <span style={{ color: '#2B6BE4' }}>
                      ${(planData.enganche + (planData.envioGratis !== false ? 0 : (planData.costoEnvio || 0))).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              {pagoError && <span className={styles.errorMsg}>{pagoError}</span>}
              <button
                className={styles.cta}
                onClick={handleIniciarPago}
                disabled={iniciandoPago || !solicitudId}
              >
                {iniciandoPago ? "Preparando pago..." : "Pagar enganche →"}
              </button>
              {pagoError && (
                <button
                  type="button"
                  className={styles.cta}
                  style={{ background: "#E4E8F1", color: "#5A6688", marginTop: "10px", boxShadow: "none" }}
                  onClick={handleAprobarManual}
                  disabled={aprobandoManual}
                >
                  {aprobandoManual ? "Continuando..." : "Continuar sin pagar (modo prueba) →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.badgeErr}>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="3"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </div>
              <div className={styles.et}>No pudimos verificarte</div>
              <div className={styles.ed}>{errorMessage}</div>
              <button className={styles.cta} onClick={() => setStatus("form")}>
                Volver a intentar
              </button>
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
          <div className={styles.sub}>
            Para autorizar tu crédito requerimos validar tu identidad de forma
            segura.
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.planChip}>
            <div className={styles.ico}></div>
            <div style={{ fontSize: '13px', lineHeight: '1.4' }}>
              Plan elegido: <b>{planData.semanas} semanas</b> de{" "}
              <b>${planData.pagoSemanal}/sem</b> con enganche de{" "}
              <b>${planData.enganche}</b>
              {planData.envioGratis !== false ? ' (¡Envio Gratis!)' : ` (+ $${planData.costoEnvio} costo de envío)`}.
            </div>
          </div>

          <form onSubmit={handleEnviar}>
            <div className={styles.lbl}>Datos de contacto</div>

            <div className={styles.campo}>
              <label htmlFor="celular">Número de Celular (WhatsApp)</label>
              <input
                id="celular"
                type="tel"
                placeholder="55 1234 5678"
                value={celular}
                onChange={(e) => setCelular(e.target.value.replace(/\D/g, ""))}
                maxLength={15}
                disabled={otpVerificado}
                className={celular.length > 0 && celular.length < 10 ? styles.inputError : ""}
                required
              />
              {celular.length > 0 && celular.length < 10 && (
                <span className={styles.errorMsg}>El celular debe contener al menos 10 dígitos</span>
              )}
              <div className={styles.hint}>
                Ahí te enviaremos el seguimiento de tu crédito. Si es de fuera de México, incluí el código de país (ej. 54 para Argentina).
              </div>
            </div>

            {!otpVerificado && !otpEnviado && (
              <button
                type="button"
                className={styles.cta}
                onClick={handleEnviarOtpInicial}
                disabled={celular.length < 10 || otpEnviando}
              >
                {otpEnviando ? "Enviando código..." : "Enviar código"}
              </button>
            )}

            {!otpVerificado && otpEnviado && (
              <div className={styles.campo}>
                <label htmlFor="otpCodigo">Código enviado por WhatsApp al {celular}</label>
                <input
                  id="otpCodigo"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  value={otpCodigo}
                  onChange={(e) => setOtpCodigo(e.target.value.replace(/\D/g, ""))}
                />
                {otpError && <span className={styles.errorMsg}>{otpError}</span>}
                <div className={styles.hint}>El código vence en 10 minutos.</div>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={handleVerificarOtpInicial}
                  disabled={otpEnviando || otpCodigo.length !== 6}
                >
                  {otpEnviando ? "Verificando..." : "Verificar código"}
                </button>
                <button
                  type="button"
                  className={styles.cta}
                  style={{ background: "#E4E8F1", color: "#5A6688", marginTop: "10px", boxShadow: "none" }}
                  onClick={handleEnviarOtpInicial}
                  disabled={otpEnviando}
                >
                  Reenviar código
                </button>
              </div>
            )}

            {otpVerificado && (
              <div style={{ fontSize: "12px", color: "#16A34A", fontWeight: 700, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <FiCheck /> Número verificado
              </div>
            )}

            {otpVerificado && !solicitudId && (
              <div className={styles.campo}>
                {otpError && <span className={styles.errorMsg}>{otpError}</span>}
                <button
                  type="button"
                  className={styles.cta}
                  onClick={crearSolicitudSiHaceFalta}
                >
                  Reintentar
                </button>
              </div>
            )}

            {otpVerificado && (
              <>
            <div className={styles.campo}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    guardarProgreso({ email: email.trim() }, "email");
                  }
                }}
                className={email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? styles.inputError : ""}
                required
              />
              {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <span className={styles.errorMsg}>Ingresa una dirección de correo electrónico válida</span>
              )}
              {guardandoCampo === "email" && <span className={styles.hint}>Guardando...</span>}
            </div>

            {errorProgreso && (
              <div className={styles.errorMsg} style={{ marginBottom: "10px" }}>{errorProgreso}</div>
            )}

            <div className={styles.lbl} style={{ marginTop: "20px" }}>
              Fotografía de tu INE y Selfie
            </div>

            {/* Frente */}
            <div
              className={`${styles.drop} ${(ineFrente || ineFrenteGuardado) ? styles.cargado : ""}`}
              style={{ cursor: "default" }}
            >
              <div className={styles.thumb}>
                {ineFrente ? (
                  <img src={URL.createObjectURL(ineFrente)} alt="Frente INE" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="4"></line>
                    <line x1="8" y1="2" x2="8" y2="4"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Frente de tu INE</div>
                <div className={styles.d}>
                  {guardandoCampo === "ine_frente"
                    ? "Guardando..."
                    : (ineFrente || ineFrenteGuardado)
                    ? "Foto cargada correctamente"
                    : "Haz clic para tomar foto o subir"}
                </div>
              </div>
              <div className={styles.check}><FiCheck /></div>
            </div>
            {renderBotonesCaptura("ine-frente", "environment", setIneFrente, "ine_frente", setIneFrenteGuardado)}

            {/* Reverso */}
            <div
              className={`${styles.drop} ${(ineReverso || ineReversoGuardado) ? styles.cargado : ""}`}
              style={{ cursor: "default" }}
            >
              <div className={styles.thumb}>
                {ineReverso ? (
                  <img
                    src={URL.createObjectURL(ineReverso)}
                    alt="Reverso INE"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="4"></line>
                    <line x1="8" y1="2" x2="8" y2="4"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Reverso de tu INE</div>
                <div className={styles.d}>
                  {guardandoCampo === "ine_reverso"
                    ? "Guardando..."
                    : (ineReverso || ineReversoGuardado)
                    ? "Foto cargada correctamente"
                    : "Haz clic para tomar foto o subir"}
                </div>
              </div>
              <div className={styles.check}><FiCheck /></div>
            </div>
            {renderBotonesCaptura("ine-reverso", "environment", setIneReverso, "ine_reverso", setIneReversoGuardado)}

            {/* Selfie */}
            <div
              className={`${styles.drop} ${(selfie || selfieGuardado) ? styles.cargado : ""}`}
              style={{ cursor: "default" }}
            >
              <div className={styles.thumb}>
                {selfie ? (
                  <img src={URL.createObjectURL(selfie)} alt="Selfie" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="9" r="4"></circle>
                    <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"></path>
                  </svg>
                )}
              </div>
              <div className={styles.txt}>
                <div className={styles.t}>Selfie</div>
                <div className={styles.d}>
                  {guardandoCampo === "selfie"
                    ? "Guardando..."
                    : (selfie || selfieGuardado)
                    ? "Foto cargada correctamente"
                    : "Tu rostro, bien iluminado"}
                </div>
              </div>
              <div className={styles.check}><FiCheck /></div>
            </div>
            {renderBotonesCaptura("selfie", "user", setSelfie, "selfie", setSelfieGuardado)}

            <div className={styles.privacidad}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Tus datos biométricos y fotos se encriptan de extremo a extremo
              conforme a la Ley de Protección de Datos Personales.
            </div>

            <label className={styles.privacidad} style={{ cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{ width: "18px", height: "18px", flexShrink: 0, marginTop: "1px" }}
              />
              Acepto los{" "}
              <a href="/terminos" target="_blank" rel="noopener noreferrer">
                Términos y condiciones
              </a>
              .
            </label>

            <button
              type="submit"
              className={styles.cta}
              disabled={!isFormValid}
            >
              Enviar y Verificar Identidad
            </button>
              </>
            )}

            <button
              type="button"
              className={styles.cta}
              style={{
                background: "#E4E8F1",
                color: "#5A6688",
                marginTop: "10px",
                boxShadow: "none",
              }}
              onClick={onVolver}
            >
              Volver al cotizador
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
