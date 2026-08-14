import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";
import { FiCamera, FiUpload, FiCheck, FiAward, FiInfo, FiTrash2 } from "react-icons/fi";

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
    modelo: string;
    envioGratis?: boolean;
    costoEnvio?: number;
    // Opcional: solo disponible cuando se llega desde el Cotizador con el catálogo
    // ya cargado (ver DocumentosRoute en App.tsx) — al reanudar una solicitud por
    // URL (/documentos?solicitud=X) el resumen del backend no trae la imagen del
    // catálogo, así que el header simplemente no la muestra en ese caso.
    imagen?: string;
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
  // true si la verificación automática ya corrió y no pasó — separado en dos flags
  // porque el backend los computa de forma independiente (ocrOk = lectura del INE,
  // biometricoOk = comparación selfie contra INE): si solo una de las dos fotos es la
  // causa de la revisión manual, la otra no debe mostrarse como fallida también.
  initialIneFrenteFallida?: boolean;
  initialSelfieFallida?: boolean;
  // Si la solicitud ya se finalizó (estatus distinto de "Iniciada"), hay que ir directo
  // a la pantalla de pago/revisión en vez de mostrar el formulario de nuevo — ya no
  // hay nada que completar, solo pagar (o esperar la revisión manual).
  initialStatus?: "form" | "exito";
  initialEsAprobadoDirecto?: boolean;
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

const RESEND_COOLDOWN_S = 32;

export const Documentos: React.FC<DocumentosProps> = ({
  planData,
  onVolver,
  initialSolicitudId,
  initialCelular,
  initialEmail,
  initialOtpVerificado,
  initialDocsGuardados,
  initialIneFrenteFallida,
  initialSelfieFallida,
  initialStatus,
  initialEsAprobadoDirecto,
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
  // El frente del INE y la selfie no se pueden mostrar como "cargada correctamente"
  // (verde) cuando la verificación automática ya corrió y no pasó — confunde, porque
  // esas dos fotos son justo la causa de que la solicitud haya quedado en revisión.
  // Separados porque el backend los computa de forma independiente: si solo una de
  // las dos fotos falló, la otra no debe quedar marcada como fallida también (bug
  // reportado 2026-08-14 — con un solo flag compartido, resubir la foto que sí estaba
  // mal nunca "limpiaba" del todo la pantalla porque la otra seguía en rojo).
  const [ineFrenteFallida, setIneFrenteFallida] = useState(initialIneFrenteFallida || false);
  const [selfieFallida, setSelfieFallida] = useState(initialSelfieFallida || false);

  const [status, setStatus] = useState<
    "form" | "subiendo" | "exito" | "error"
  >(initialStatus || "form");
  const [errorMessage, setErrorMessage] = useState("");

  const [solicitudId, setSolicitudId] = useState<string>(initialSolicitudId || "");
  const [esAprobadoDirecto, setEsAprobadoDirecto] = useState<boolean>(initialEsAprobadoDirecto ?? true);

  // Verificación del celular por OTP de WhatsApp, ANTES de poder llenar el resto del
  // formulario — evita que un bot/script mande INE y selfie falsos sin un WhatsApp real
  // detrás. El código vence a los 10 minutos (WhatsappOtpService del backend).
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [otpVerificado, setOtpVerificado] = useState(initialOtpVerificado || false);
  const [otpCodigo, setOtpCodigo] = useState("");
  const [otpEnviando, setOtpEnviando] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  // Cuenta regresiva antes de poder pedir un nuevo código — se salta apenas el código
  // ingresado da error, para no hacer esperar a alguien que ya sabe que lo necesita.
  const [resendCountdown, setResendCountdown] = useState(0);

  // Pago del enganche con Stripe Checkout (página hosteada por Stripe — la tarjeta del
  // cliente nunca pasa por nuestro servidor). El celular ya quedó verificado más
  // arriba, así que acá no se vuelve a pedir OTP.
  const [iniciandoPago, setIniciandoPago] = useState(false);
  const [pagoError, setPagoError] = useState("");

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
      setResendCountdown(RESEND_COOLDOWN_S);
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
        throw new Error(res.error || "Código inválido");
      }
      setOtpVerificado(true);
      await crearSolicitudSiHaceFalta();
    } catch (error: any) {
      setOtpError(error.message || "Código inválido");
      setResendCountdown(0);
    } finally {
      setOtpEnviando(false);
    }
  };

  // El código se verifica solo apenas se completan los 6 dígitos — sin botón manual
  // de "Verificar", según el diseño de Figma (Paso 3).
  useEffect(() => {
    if (otpCodigo.length === 6 && !otpVerificado && !otpEnviando) {
      handleVerificarOtpInicial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCodigo]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // Guarda un campo (email, o una foto ya en base64) apenas está listo, sin esperar al
  // submit final — así no se pierde nada si el cliente se cae del formulario a mitad
  // de camino. Se puede llamar varias veces, cada vez con lo que corresponda.
  const guardarProgreso = async (campos: Record<string, string>, nombreCampo: string): Promise<any | null> => {
    if (!solicitudId) return null;
    setGuardandoCampo(nombreCampo);
    setErrorProgreso("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/progreso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campos),
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(res.error || "No se pudo guardar.");
      }
      return res.solicitud || null;
    } catch (error: any) {
      setErrorProgreso(error.message || "No se pudo guardar. Intenta de nuevo.");
      return null;
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
      const solicitudActualizada = await guardarProgreso({ [campoBackend]: `data:image/jpeg;base64,${base64}` }, campoBackend);
      if (solicitudActualizada) {
        setGuardado(true);
        // El backend ya no espera a Verificamex para responder acá (por eso esto es
        // rápido) — corre OCR/biométrico en segundo plano, así que el resultado fresco
        // todavía no está en esta respuesta. Se consulta una vez, unos segundos
        // después, para que el aviso ámbar se actualice solo sin tener que recargar.
        if (campoBackend === "ine_frente" || campoBackend === "selfie") {
          setTimeout(() => {
            fetch(`${backendUrl}/api/solicitudes/${solicitudId}/resumen`)
              .then((r) => (r.ok ? r.json() : null))
              .then((resumen) => {
                if (resumen) {
                  setIneFrenteFallida(resumen.ocrOk === false);
                  setSelfieFallida(resumen.biometricoOk === false);
                }
              })
              .catch(() => {});
          }, 2500);
        }
      }
    } catch {
      // guardarProgreso ya dejó el error en errorProgreso
    }
  };

  // "Eliminar foto" (aparece una vez subida, según el diseño de Figma) — vuelve a
  // mostrar los botones de "Tomar foto"/"Subir archivo" para reintentar. No hace falta
  // borrar nada del backend: la próxima foto que se suba pisa el valor guardado.
  const handleEliminarFoto = (
    setFile: (file: File | null) => void,
    setGuardado: (v: boolean) => void,
  ) => {
    setFile(null);
    setGuardado(false);
  };

  // Dos botones en vez de un solo input cubriendo toda la tarjeta: "Tomar foto" abre la
  // cámara directo en el celular (atributo `capture`), "Subir archivo" abre la galería/
  // explorador normal, sin forzar una sobre la otra.
  const renderBotonesCaptura = (
    idPrefix: string,
    captureMode: "environment" | "user",
    setter: (file: File | null) => void,
    campoBackend: "ine_frente" | "ine_reverso" | "selfie",
    setGuardado: (v: boolean) => void,
  ) => (
    <div className={styles.docBotones}>
      <input
        type="file"
        accept="image/*"
        capture={captureMode}
        onChange={(e) => handleFileChange(e, setter, campoBackend, setGuardado)}
        style={{ display: "none" }}
        id={`${idPrefix}-camara`}
      />
      <label htmlFor={`${idPrefix}-camara`} className={styles.docBoton}>
        <FiCamera /> Tomar foto
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, setter, campoBackend, setGuardado)}
        style={{ display: "none" }}
        id={`${idPrefix}-archivo`}
      />
      <label htmlFor={`${idPrefix}-archivo`} className={styles.docBoton}>
        <FiUpload /> Subir archivo
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

  // "Paso 2" (celular), "Paso 3" (código) y "Paso 4" (documentos) del diseño de Figma
  // — todas comparten el mismo header con "Identidad" como paso activo.
  const vista: "celular" | "codigo" | "documentos" = !otpVerificado
    ? (otpEnviado ? "codigo" : "celular")
    : "documentos";

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.detallesTelefono}>
        <div className={styles.telefonoCol}>
          <img src={logoBlanco} alt="Movinex" className={styles.logo} />
          <div>
            <div className={styles.modelo}>{planData.modelo}</div>
            <div className={styles.planLinea}>${planData.pagoSemanal} semanal</div>
          </div>
        </div>
        {planData.imagen && (
          <div className={styles.imagenTelefonoWrap}>
            <img src={planData.imagen} alt={planData.modelo} />
          </div>
        )}
      </div>
      <div className={styles.progreso}>
        <div className={styles.pasoIndicador}>
          <span className={`${styles.pasoNum} ${styles.pasoNumDone}`}>
            <FiCheck />
          </span>
          <span>Cotizar celular</span>
        </div>
        <div className={`${styles.pasoIndicador} ${styles.pasoActivo}`}>
          <span className={styles.pasoNum}>2</span>
          <span>Identidad</span>
        </div>
        <div className={styles.pasoIndicador}>
          <span className={styles.pasoNum}>3</span>
          <span>Envío</span>
        </div>
      </div>
    </div>
  );

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
          {renderHeader()}
          <div className={styles.body}>
            {esAprobadoDirecto ? (
              <div className={styles.estado}>
                <div className={styles.badgeOk}>
                  <FiAward />
                </div>
                <div className={styles.et}>¡Felicidades, fuiste autorizado!</div>
                <div className={styles.ed}>
                  {`Tu identidad quedó validada. El siguiente paso es el pago inicial para procesar el envío de tu ${planData.modelo}:`}
                </div>
                <div className={styles.resumenPago}>
                  <div className={styles.filaResumen}>
                    <span>Enganche requerido:</span>
                    <b>${planData.enganche.toLocaleString()}</b>
                  </div>
                  <div className={styles.filaResumen}>
                    <span>Costo de envío:</span>
                    <b className={planData.envioGratis !== false ? styles.gratis : undefined}>
                      {planData.envioGratis !== false ? "¡Gratis!" : `$${(planData.costoEnvio || 0).toLocaleString()}`}
                    </b>
                  </div>
                  <div className={styles.dividerResumen} />
                  <div className={`${styles.filaResumen} ${styles.filaTotal}`}>
                    <span>Total Inicial a pagar:</span>
                    <b>${(planData.enganche + (planData.envioGratis !== false ? 0 : (planData.costoEnvio || 0))).toLocaleString()}</b>
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
              </div>
            ) : (
              // Paso 5 de Figma: "solicitud en revisión" — se muestra cuando la
              // identidad no quedó validada automática y hace falta revisión manual;
              // no tiene sentido cobrarle antes de esa revisión.
              <div className={styles.estado}>
                <FiInfo className={styles.infoIcon} />
                <div className={styles.et}>Tu solicitud está en revisión</div>
                <div className={styles.ed}>
                  {`Tu identidad está siendo validada por nuestro equipo. Te contactaremos por Whatsapp en cuanto tu solicitud del ${planData.modelo} esté aprobada para continuar con el pago.`}
                </div>
                <div className={styles.cerrarWrap}>
                  <p className={styles.cerrarHint}>Puedes cerrar esta ventana ó</p>
                  <button type="button" className={styles.linkVolver} onClick={onVolver}>
                    Volver a la tienda →
                  </button>
                </div>
              </div>
            )}
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
        {renderHeader()}
        <div className={styles.body}>
          {vista === "celular" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Verifica tu número de celular</p>
              </div>
              <div className={styles.campo}>
                <label htmlFor="celular">Número de celular (WhatsApp)</label>
                <input
                  id="celular"
                  type="tel"
                  placeholder="123 456 7891"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, ""))}
                  maxLength={15}
                  className={celular.length > 0 && celular.length < 10 ? styles.inputError : ""}
                  required
                />
                <div className={styles.hint}>Con este número haremos seguimiento a tu crédito. Si es de fuera de México, incluí el código de país (ej. 54 para Argentina).</div>
                {celular.length > 0 && celular.length < 10 && (
                  <span className={styles.errorMsg}>El celular debe contener al menos 10 dígitos</span>
                )}
              </div>
              {otpError && <span className={styles.errorMsg}>{otpError}</span>}
              <div className={styles.botonesFinal}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={handleEnviarOtpInicial}
                  disabled={celular.length < 10 || otpEnviando}
                >
                  {otpEnviando ? "Enviando..." : "Enviar Código"}
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={onVolver}>
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {vista === "codigo" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Verifica tu número de celular</p>
              </div>
              <div className={styles.campo}>
                <label>Ingresa el código enviado al <b>{celular}</b></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCodigo}
                  onChange={(e) => {
                    setOtpCodigo(e.target.value.replace(/\D/g, ""));
                    setOtpError("");
                  }}
                  className={otpError ? styles.inputError : ""}
                />
                {otpError && <span className={styles.errorMsg}>{otpError}</span>}
              </div>
              <div className={styles.botonesFinal}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={handleEnviarOtpInicial}
                  disabled={otpEnviando || (resendCountdown > 0 && !otpError)}
                >
                  {otpEnviando
                    ? "Enviando..."
                    : resendCountdown > 0 && !otpError
                    ? `Reenviar Código (${resendCountdown})`
                    : "Reenviar Código"}
                </button>
                <button
                  type="button"
                  className={styles.pasoAnterior}
                  onClick={() => {
                    setOtpEnviado(false);
                    setOtpCodigo("");
                    setOtpError("");
                  }}
                >
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {vista === "documentos" && (
            <form className={styles.paso} onSubmit={handleEnviar}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Sube tus documentos</p>
                <p className={styles.subtitulo}>Para autorizar tu crédito requerimos validar tu identidad</p>
              </div>

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
                  <span className={styles.errorMsg}>Ingresa un correo electrónico válido</span>
                )}
                {guardandoCampo === "email" && <span className={styles.hint}>Guardando...</span>}
              </div>

              {errorProgreso && (
                <div className={styles.errorMsg} style={{ marginBottom: "10px" }}>{errorProgreso}</div>
              )}

              <div className={styles.divider} />

              {/* Frente */}
              {(() => {
                const cargada = !!(ineFrente || ineFrenteGuardado);
                const necesitaRevision = cargada && ineFrenteFallida;
                const verificado = cargada && !necesitaRevision;
                return (
                  <div className={styles.docCampo}>
                    <div className={styles.docEtiqueta}>
                      <span>Frente de tu INE</span>
                      {verificado && <FiCheck className={styles.docCheckOk} />}
                    </div>
                    <div
                      className={`${styles.docBox} ${verificado ? styles.docBoxOk : ""} ${necesitaRevision ? styles.docBoxWarn : ""}`}
                    >
                      {ineFrente && <img src={URL.createObjectURL(ineFrente)} alt="Frente INE" className={styles.docThumb} />}
                      {!cargada && guardandoCampo !== "ine_frente" && renderBotonesCaptura("ine-frente", "environment", setIneFrente, "ine_frente", setIneFrenteGuardado)}
                      {guardandoCampo === "ine_frente" && <div className={styles.docGuardando}>Guardando...</div>}
                    </div>
                    {necesitaRevision && (
                      <span className={styles.errorMsg}>No se pudo verificar — vuelve a tomarla bien iluminada y sin reflejos</span>
                    )}
                    {cargada && guardandoCampo !== "ine_frente" && (
                      <button type="button" className={styles.eliminarFoto} onClick={() => handleEliminarFoto(setIneFrente, setIneFrenteGuardado)}>
                        Eliminar foto <FiTrash2 />
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className={styles.divider} />

              {/* Reverso */}
              {(() => {
                const cargada = !!(ineReverso || ineReversoGuardado);
                return (
                  <div className={styles.docCampo}>
                    <div className={styles.docEtiqueta}>
                      <span>Reverso de tu INE</span>
                      {cargada && <FiCheck className={styles.docCheckOk} />}
                    </div>
                    <div className={`${styles.docBox} ${cargada ? styles.docBoxOk : ""}`}>
                      {ineReverso && <img src={URL.createObjectURL(ineReverso)} alt="Reverso INE" className={styles.docThumb} />}
                      {!cargada && guardandoCampo !== "ine_reverso" && renderBotonesCaptura("ine-reverso", "environment", setIneReverso, "ine_reverso", setIneReversoGuardado)}
                      {guardandoCampo === "ine_reverso" && <div className={styles.docGuardando}>Guardando...</div>}
                    </div>
                    {cargada && guardandoCampo !== "ine_reverso" && (
                      <button type="button" className={styles.eliminarFoto} onClick={() => handleEliminarFoto(setIneReverso, setIneReversoGuardado)}>
                        Eliminar foto <FiTrash2 />
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className={styles.divider} />

              {/* Selfie */}
              {(() => {
                const cargada = !!(selfie || selfieGuardado);
                const necesitaRevision = cargada && selfieFallida;
                const verificado = cargada && !necesitaRevision;
                return (
                  <div className={styles.docCampo}>
                    <div className={styles.docEtiqueta}>
                      <span>Selfie</span>
                      {verificado && <FiCheck className={styles.docCheckOk} />}
                    </div>
                    <div
                      className={`${styles.docBox} ${verificado ? styles.docBoxOk : ""} ${necesitaRevision ? styles.docBoxWarn : ""}`}
                    >
                      {selfie && <img src={URL.createObjectURL(selfie)} alt="Selfie" className={styles.docThumb} />}
                      {!cargada && guardandoCampo !== "selfie" && renderBotonesCaptura("selfie", "user", setSelfie, "selfie", setSelfieGuardado)}
                      {guardandoCampo === "selfie" && <div className={styles.docGuardando}>Guardando...</div>}
                    </div>
                    {!cargada && <div className={styles.hintSelfie}>Tu rostro, bien iluminado</div>}
                    {necesitaRevision && (
                      <span className={styles.errorMsg}>No se pudo verificar contra tu INE — vuelve a tomarla de frente y bien iluminada</span>
                    )}
                    {cargada && guardandoCampo !== "selfie" && (
                      <button type="button" className={styles.eliminarFoto} onClick={() => handleEliminarFoto(setSelfie, setSelfieGuardado)}>
                        Eliminar foto <FiTrash2 />
                      </button>
                    )}
                  </div>
                );
              })()}

              <div className={styles.legalBlock}>
                <div className={styles.privacidad}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Tus datos biométricos y fotos se encriptan de extremo a extremo conforme a la Ley de Protección de Datos Personales.
                </div>

                <label className={styles.terminos}>
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                  />
                  Acepto los{" "}
                  <a href="/terminos" target="_blank" rel="noopener noreferrer">
                    Términos y condiciones
                  </a>
                </label>
              </div>

              <div className={styles.botonesFinal}>
                <button type="submit" className={styles.cta} disabled={!isFormValid}>
                  Enviar y Verificar la Identidad
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={onVolver}>
                  Paso Anterior
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
