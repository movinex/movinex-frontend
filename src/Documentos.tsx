import React, { useState, useEffect, useRef } from "react";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";

declare global {
  interface Window {
    ConektaCheckoutComponents: any;
  }
}

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
    modelo: string;
    envioGratis?: boolean;
    costoEnvio?: number;
  };
  onPagoConfirmado: (solicitudId: string) => void;
  onVolver: () => void;
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
  onPagoConfirmado,
  onVolver,
}) => {
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [ineFrente, setIneFrente] = useState<File | null>(null);
  const [ineReverso, setIneReverso] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "form" | "subiendo" | "exito" | "error"
  >("form");
  const [errorMessage, setErrorMessage] = useState("");

  const [solicitudId, setSolicitudId] = useState<string>("");
  const [esAprobadoDirecto, setEsAprobadoDirecto] = useState<boolean>(true);

  // Paso de pago del enganche: primero se verifica el celular por OTP de WhatsApp,
  // después se paga con el Checkout Component embebido de Conekta (iframe hosteado
  // por Conekta — la tarjeta del cliente nunca pasa por nuestro servidor).
  const [pagoStep, setPagoStep] = useState<"resumen" | "otp" | "tarjeta">("resumen");
  const [otpCodigo, setOtpCodigo] = useState("");
  const [otpEnviando, setOtpEnviando] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoError, setPagoError] = useState("");
  const submitConektaRef = useRef<(() => void) | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  const handleSolicitarOtp = async () => {
    if (!solicitudId) return;
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
      setPagoStep("otp");
    } catch (error: any) {
      setOtpError(error.message || "Ocurrió un error al enviar el código.");
    } finally {
      setOtpEnviando(false);
    }
  };

  const handleVerificarOtp = async () => {
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

      const ordenResponse = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/crear-orden-enganche`, {
        method: "POST",
      });
      const ordenRes = await ordenResponse.json();
      if (!ordenResponse.ok) {
        throw new Error(ordenRes.error || "No se pudo iniciar el pago.");
      }

      setCheckoutId(ordenRes.checkoutId);
      setPagoStep("tarjeta");
    } catch (error: any) {
      setOtpError(error.message || "Ocurrió un error al verificar el código.");
    } finally {
      setOtpEnviando(false);
    }
  };

  // Inicializa el Checkout Component de Conekta apenas tenemos el checkoutId.
  useEffect(() => {
    if (pagoStep !== "tarjeta" || !checkoutId) return;
    if (!window.ConektaCheckoutComponents || !import.meta.env.VITE_CONEKTA_PUBLIC_KEY) {
      setPagoError("No se pudo cargar el procesador de pagos. Recarga la página e intenta de nuevo.");
      return;
    }

    window.ConektaCheckoutComponents.Integration({
      config: {
        locale: "es",
        publicKey: import.meta.env.VITE_CONEKTA_PUBLIC_KEY,
        targetIFrame: "#conekta-checkout-target",
        checkoutRequestId: checkoutId,
        useExternalSubmit: true,
      },
      callbacks: {
        onUpdateSubmitTrigger: (submitFn: () => void) => {
          submitConektaRef.current = submitFn;
        },
        onFinalizePayment: () => {
          onPagoConfirmado(solicitudId);
        },
        onErrorPayment: (error: any) => {
          setPagoError(error?.message_to_purchaser || error?.message || "La tarjeta fue rechazada. Verifica los datos.");
          setProcesandoPago(false);
        },
      },
    });

    // React.StrictMode monta este efecto dos veces en desarrollo; Integration() no es
    // idempotente, así que sin este cleanup la segunda inicialización pisa a la primera
    // y el iframe queda en blanco. Limpiamos el contenedor antes de cada montaje real.
    return () => {
      submitConektaRef.current = null;
      const target = document.getElementById("conekta-checkout-target");
      if (target) target.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoStep, checkoutId]);

  const handlePagarConTarjeta = () => {
    setPagoError("");
    if (!submitConektaRef.current) {
      setPagoError("El formulario de pago todavía se está cargando. Esperá un segundo e intentá de nuevo.");
      return;
    }
    setProcesandoPago(true);
    submitConektaRef.current();
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!celular || !email || !ineFrente || !ineReverso || !selfie) return;

    setStatus("subiendo");
    setErrorMessage("");

    try {
      const [ineFrenteB64, ineReversoB64, selfieB64] = await Promise.all([
        compressAndGetBase64(ineFrente),
        compressAndGetBase64(ineReverso),
        compressAndGetBase64(selfie),
      ]);

      const formattedFrente = `data:image/jpeg;base64,${ineFrenteB64}`;
      const formattedReverso = `data:image/jpeg;base64,${ineReversoB64}`;
      const formattedSelfie = `data:image/jpeg;base64,${selfieB64}`;

      const response = await fetch(
        `${backendUrl}/api/solicitudes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            celular: celular.trim(),
            email: email.trim(),
            modelo: planData.modelo,
            enganche: planData.enganche,
            semanas: planData.semanas,
            pago_semanal: planData.pagoSemanal,
            ine_frente: formattedFrente,
            ine_reverso: formattedReverso,
            selfie: formattedSelfie,
          }),
        },
      );
      const res = await response.json();

      if (!response.ok) {
        throw new Error(
          res.error || "Ocurrió un error al procesar tu solicitud.",
        );
      }

      if (res.solicitud?.id) {
        setSolicitudId(res.solicitud.id);
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
    celular.trim().length >= 10 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    ineFrente !== null &&
    ineReverso !== null &&
    selfie !== null;

  if (status === "subiendo") {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.body}>
            <div className={styles.estado}>
              <div className={styles.spinner}></div>
              <div className={styles.et}>Verificando Identidad</div>
              <div className={styles.ed}>
                Estamos verificando tu INE ante fuentes oficiales. No cierres
                esta ventana.
              </div>
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
              <div className={styles.et}>
                {esAprobadoDirecto 
                  ? "🎉 ¡Felicidades, fuiste autorizado!"
                  : "⌛ Tu solicitud está en revisión manual"}
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
              {pagoStep === "resumen" && (
                <button
                  className={styles.cta}
                  onClick={handleSolicitarOtp}
                  disabled={otpEnviando || !solicitudId}
                >
                  {otpEnviando ? "Enviando código..." : "Pagar enganche →"}
                </button>
              )}

              {pagoStep === "otp" && (
                <div style={{ textAlign: "left", marginTop: "10px" }}>
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
                  </div>
                  <button
                    className={styles.cta}
                    onClick={handleVerificarOtp}
                    disabled={otpEnviando || otpCodigo.length !== 6}
                  >
                    {otpEnviando ? "Verificando..." : "Verificar código"}
                  </button>
                  <button
                    type="button"
                    className={styles.cta}
                    style={{ background: "#E4E8F1", color: "#5A6688", marginTop: "10px", boxShadow: "none" }}
                    onClick={handleSolicitarOtp}
                    disabled={otpEnviando}
                  >
                    Reenviar código
                  </button>
                </div>
              )}

              {pagoStep === "tarjeta" && (
                <div style={{ textAlign: "left", marginTop: "10px" }}>
                  <div id="conekta-checkout-target" style={{ height: "480px" }}></div>
                  {pagoError && <span className={styles.errorMsg}>{pagoError}</span>}
                  <button className={styles.cta} onClick={handlePagarConTarjeta} disabled={procesandoPago}>
                    {procesandoPago ? "Procesando pago..." : `Pagar $${(planData.enganche + (planData.envioGratis !== false ? 0 : (planData.costoEnvio || 0))).toLocaleString()}`}
                  </button>
                </div>
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
                maxLength={10}
                className={celular.length > 0 && celular.length < 10 ? styles.inputError : ""}
                required
              />
              {celular.length > 0 && celular.length < 10 && (
                <span className={styles.errorMsg}>El celular debe contener exactamente 10 dígitos</span>
              )}
              <div className={styles.hint}>
                Ahí te enviaremos el seguimiento de tu crédito.
              </div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? styles.inputError : ""}
                required
              />
              {email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <span className={styles.errorMsg}>Ingresa una dirección de correo electrónico válida</span>
              )}
            </div>

            <div className={styles.lbl} style={{ marginTop: "20px" }}>
              Fotografía de tu INE y Selfie
            </div>

            {/* Frente */}
            <div
              className={`${styles.drop} ${ineFrente ? styles.cargado : ""}`}
            >
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
                  {ineFrente
                    ? "Foto cargada correctamente"
                    : "Haz clic para tomar foto o subir"}
                </div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

            {/* Reverso */}
            <div
              className={`${styles.drop} ${ineReverso ? styles.cargado : ""}`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setIneReverso)}
                required
              />
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
                  {ineReverso
                    ? "Foto cargada correctamente"
                    : "Haz clic para tomar foto o subir"}
                </div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

            {/* Selfie */}
            <div className={`${styles.drop} ${selfie ? styles.cargado : ""}`}>
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
                  {selfie
                    ? "Foto cargada correctamente"
                    : "Tu rostro, bien iluminado"}
                </div>
              </div>
              <div className={styles.check}>✓</div>
            </div>

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

            <button
              type="submit"
              className={styles.cta}
              disabled={!isFormValid}
            >
              Enviar y Verificar Identidad
            </button>

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
