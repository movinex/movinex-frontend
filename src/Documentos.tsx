import React, { useState, useEffect } from "react";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";
import { FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa6";

export interface ResumenSolicitud {
  id: string;
  celular: string;
  email?: string | null;
  modelo: string;
  enganche: number;
  semanas: number;
  pagoSemanal: number;
  costoEnvio?: number;
  estatus: string;
  pagoConfirmado: boolean;
  nombre?: string | null;
  apellidos?: string | null;
  curp?: string | null;
  fechaNacimiento?: string | null;
  genero?: string | null;
  estadoCivil?: string | null;
  dependientesEconomicos?: number | null;
  nivelEstudios?: string | null;
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  codigoPostal?: string | null;
  colonia?: string | null;
  alcaldiaMunicipio?: string | null;
  estado?: string | null;
  aceptaTerminos: boolean;
}

interface DocumentosProps {
  planData: {
    semanas: number;
    pagoSemanal: number;
    enganche: number;
    modelo: string;
    envioGratis?: boolean;
    costoEnvio?: number;
    // Opcional: solo disponible cuando se llega desde el Cotizador con el catálogo ya
    // cargado — al reanudar por URL el resumen del backend no trae la imagen.
    imagen?: string;
  };
  onVolver: () => void;
  // Presente solo al reanudar una solicitud desde /documentos?solicitud=X — ver
  // DocumentosRoute en App.tsx. Si no viene, arranca desde cero (paso "celular").
  resumenInicial?: ResumenSolicitud;
}

const RESEND_COOLDOWN_S = 32;

type Paso = "celular" | "codigo" | "datos" | "direccion" | "codigo2" | "pago";

const pasoInicialDesdeResumen = (r: ResumenSolicitud): Paso => {
  if (r.estatus === "Lista para pago") return "pago";
  if (!r.nombre || !r.curp) return "datos";
  if (!r.calle) return "direccion";
  return "codigo2";
};

export const Documentos: React.FC<DocumentosProps> = ({ planData, onVolver, resumenInicial }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  const [celular, setCelular] = useState(resumenInicial?.celular || "");
  const [solicitudId, setSolicitudId] = useState<string>(resumenInicial?.id || "");
  const [paso, setPaso] = useState<Paso>(resumenInicial ? pasoInicialDesdeResumen(resumenInicial) : "celular");

  // --- OTP (compartido entre el paso 2 y el paso 5 — el celular es el mismo, solo
  // cambia a dónde avanza al verificarse) ---
  const [otpCodigo, setOtpCodigo] = useState("");
  const [otpEnviando, setOtpEnviando] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpVerificado, setOtpVerificado] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  // Se activan al tocar "Siguiente" con el formulario incompleto — muestran el aviso de
  // "campos requeridos" hasta que se completan, momento en el que datosValidos/
  // direccionValida pasa a true y el aviso desaparece solo (no hace falta resetearlo a mano).
  const [intentoDatos, setIntentoDatos] = useState(false);
  const [intentoDireccion, setIntentoDireccion] = useState(false);
  const [intentoCodigo2, setIntentoCodigo2] = useState(false);

  // --- Paso 3: Datos del cliente ---
  const [nombre, setNombre] = useState(resumenInicial?.nombre || "");
  const [apellidos, setApellidos] = useState(resumenInicial?.apellidos || "");
  const [email, setEmail] = useState(resumenInicial?.email || "");
  const [fechaNacimiento, setFechaNacimiento] = useState(resumenInicial?.fechaNacimiento || "");
  const [curp, setCurp] = useState(resumenInicial?.curp || "");
  const [genero, setGenero] = useState(resumenInicial?.genero || "");
  const [estadoCivil, setEstadoCivil] = useState(resumenInicial?.estadoCivil || "");
  const [dependientesEconomicos, setDependientesEconomicos] = useState(
    resumenInicial?.dependientesEconomicos != null ? String(resumenInicial.dependientesEconomicos) : ""
  );
  const [nivelEstudios, setNivelEstudios] = useState(resumenInicial?.nivelEstudios || "");

  // --- Paso 4: Dirección ---
  const [calle, setCalle] = useState(resumenInicial?.calle || "");
  const [numeroExterior, setNumeroExterior] = useState(resumenInicial?.numeroExterior || "");
  const [numeroInterior, setNumeroInterior] = useState(resumenInicial?.numeroInterior || "");
  const [codigoPostal, setCodigoPostal] = useState(resumenInicial?.codigoPostal || "");
  const [colonia, setColonia] = useState(resumenInicial?.colonia || "");
  const [alcaldiaMunicipio, setAlcaldiaMunicipio] = useState(resumenInicial?.alcaldiaMunicipio || "");
  const [estado, setEstado] = useState(resumenInicial?.estado || "");

  // --- Paso 5: Términos ---
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // --- Paso 6: Pago ---
  const [iniciandoPago, setIniciandoPago] = useState(false);
  const [pagoError, setPagoError] = useState("");

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  const handleEnviarOtp = async () => {
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
      setOtpCodigo("");
      setResendCountdown(RESEND_COOLDOWN_S);
    } catch (error: any) {
      setOtpError(error.message || "Ocurrió un error al enviar el código.");
    } finally {
      setOtpEnviando(false);
    }
  };

  // Crea la solicitud apenas se verifica el OTP inicial (paso 2), para no perder el
  // lead si se cae del formulario a mitad de camino.
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
      window.history.replaceState(null, "", `/documentos?solicitud=${res.solicitud.id}`);
    } catch (error: any) {
      setOtpError(error.message || "No se pudo iniciar tu solicitud. Intenta de nuevo.");
    }
  };

  const handleVerificarOtp = async (alVerificar: () => void | Promise<void>) => {
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
      await alVerificar();
    } catch (error: any) {
      setOtpError(error.message || "Código inválido");
      setResendCountdown(0);
    } finally {
      setOtpEnviando(false);
    }
  };

  // El código se verifica solo apenas se completan los 6 dígitos, sin botón manual.
  useEffect(() => {
    if (otpCodigo.length === 6 && !otpVerificado && !otpEnviando) {
      if (paso === "codigo") {
        handleVerificarOtp(async () => {
          await crearSolicitudSiHaceFalta();
          setPaso("datos");
        });
      } else if (paso === "codigo2") {
        handleVerificarOtp(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpCodigo]);

  // Al entrar al paso 5, se resetea el OTP y se manda un código nuevo automáticamente
  // (ya sabemos el celular, no hace falta que lo vuelva a pedir).
  useEffect(() => {
    if (paso === "codigo2") {
      setOtpVerificado(false);
      setOtpCodigo("");
      setOtpError("");
      handleEnviarOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const curpValida = /^[A-Za-z0-9]{18}$/.test(curp.trim());

  const datosValidos =
    nombre.trim() !== "" &&
    apellidos.trim() !== "" &&
    emailValido &&
    fechaNacimiento !== "" &&
    curpValida &&
    (genero === "Masculino" || genero === "Femenino") &&
    estadoCivil !== "" &&
    dependientesEconomicos !== "" &&
    nivelEstudios !== "";

  const handleGuardarDatos = async () => {
    if (!datosValidos) {
      setIntentoDatos(true);
      return;
    }
    if (!solicitudId) return;
    setGuardando(true);
    setErrorGuardado("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/progreso`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          nombre: nombre.trim(),
          apellidos: apellidos.trim(),
          fecha_nacimiento: fechaNacimiento,
          curp: curp.trim().toUpperCase(),
          genero,
          estado_civil: estadoCivil,
          dependientes_economicos: Number(dependientesEconomicos),
          nivel_estudios: nivelEstudios,
        }),
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || "No se pudo guardar. Intenta de nuevo.");
      setPaso("direccion");
    } catch (error: any) {
      setErrorGuardado(error.message || "No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const direccionValida =
    calle.trim() !== "" &&
    numeroExterior.trim() !== "" &&
    codigoPostal.trim().length === 5 &&
    colonia.trim() !== "" &&
    alcaldiaMunicipio.trim() !== "" &&
    estado.trim() !== "";

  const handleGuardarDireccion = async () => {
    if (!direccionValida) {
      setIntentoDireccion(true);
      return;
    }
    if (!solicitudId) return;
    setGuardando(true);
    setErrorGuardado("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/domicilio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calle: calle.trim(),
          numero_exterior: numeroExterior.trim(),
          numero_interior: numeroInterior.trim() || undefined,
          codigo_postal: codigoPostal.trim(),
          colonia: colonia.trim(),
          alcaldia_municipio: alcaldiaMunicipio.trim(),
          estado: estado.trim(),
        }),
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || "No se pudo guardar tu dirección. Intenta de nuevo.");
      setPaso("codigo2");
    } catch (error: any) {
      setErrorGuardado(error.message || "No se pudo guardar tu dirección. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarTerminos = async () => {
    if (!otpVerificado || !aceptaTerminos) {
      setIntentoCodigo2(true);
      return;
    }
    if (!solicitudId) return;
    setGuardando(true);
    setErrorGuardado("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/confirmar-terminos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aceptaTerminos: true }),
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || "No se pudo confirmar. Intenta de nuevo.");
      setPaso("pago");
    } catch (error: any) {
      setErrorGuardado(error.message || "No se pudo confirmar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  // Pide al backend una Checkout Session de Stripe y redirige al cliente ahí — Stripe lo
  // trae de vuelta a /verificacion (paso 7, biométricos en vivo) una vez que paga.
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

  const fase2Activa = paso !== "pago";

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
        <div className={`${styles.pasoIndicador} ${fase2Activa ? styles.pasoActivo : ""}`}>
          <span className={styles.pasoNum}>{fase2Activa ? "2" : <FiCheck />}</span>
          <span>Tus datos</span>
        </div>
        <div className={`${styles.pasoIndicador} ${!fase2Activa ? styles.pasoActivo : ""}`}>
          <span className={styles.pasoNum}>3</span>
          <span>Pago</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {renderHeader()}
        <div className={styles.body}>
          {paso === "celular" && (
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
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  maxLength={10}
                  className={celular.length > 0 && celular.length < 10 ? styles.inputError : ""}
                  required
                />
                <div className={styles.hint}>Con este numero haremos seguimiento a tu crédito</div>
                {celular.length > 0 && celular.length < 10 && (
                  <span className={styles.errorMsg}>El celular debe contener al menos 10 dígitos</span>
                )}
              </div>
              {otpError && <span className={styles.errorMsg}>{otpError}</span>}
              <div className={styles.botonesFinal}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={async () => { await handleEnviarOtp(); setPaso("codigo"); }}
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

          {paso === "codigo" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Verifica tu número de celular</p>
              </div>
              <div className={styles.avisoWhatsapp}>
                <FaWhatsapp /> Código enviado a tu WhatsApp
              </div>
              <div className={styles.campo}>
                <label>Ingresa el código enviado al <b>{celular}</b></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otpCodigo}
                  onChange={(e) => { setOtpCodigo(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  className={`${styles.otpInput} ${otpError ? styles.inputError : ""}`}
                />
                {otpError && <span className={styles.errorMsg}>{otpError}</span>}
              </div>
              <div className={styles.botonesFinal}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={handleEnviarOtp}
                  disabled={otpEnviando || (resendCountdown > 0 && !otpError)}
                >
                  {otpEnviando ? "Enviando..." : resendCountdown > 0 && !otpError ? `Reenviar Código (${resendCountdown})` : "Reenviar Código"}
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={() => setPaso("celular")}>
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {paso === "datos" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Datos del cliente</p>
                <p className={styles.subtitulo}>Necesitamos estos datos para tu solicitud de crédito</p>
              </div>

              <div className={styles.campo}>
                <label htmlFor="nombre">Nombre(s) <span className={styles.requerido}>*</span></label>
                <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label htmlFor="apellidos">Apellidos <span className={styles.requerido}>*</span></label>
                <input id="apellidos" type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label htmlFor="email">Correo electrónico <span className={styles.requerido}>*</span></label>
                <input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={email.length > 0 && !emailValido ? styles.inputError : ""}
                  required
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="fechaNacimiento">Fecha de nacimiento <span className={styles.requerido}>*</span></label>
                <input id="fechaNacimiento" type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label htmlFor="curp">CURP <span className={styles.requerido}>*</span></label>
                <input
                  id="curp"
                  type="text"
                  maxLength={18}
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  className={curp.length > 0 && !curpValida ? styles.inputError : ""}
                  required
                />
                {curp.length > 0 && !curpValida && (
                  <span className={styles.errorMsg}>La CURP debe tener 18 caracteres</span>
                )}
              </div>
              <div className={styles.campo}>
                <label>Género <span className={styles.requerido}>*</span></label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${genero === "Masculino" ? styles.toggleBtnActivo : ""}`}
                    onClick={() => setGenero("Masculino")}
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${genero === "Femenino" ? styles.toggleBtnActivo : ""}`}
                    onClick={() => setGenero("Femenino")}
                  >
                    Femenino
                  </button>
                </div>
              </div>
              <div className={styles.campo}>
                <label htmlFor="estadoCivil">Estado civil <span className={styles.requerido}>*</span></label>
                <select id="estadoCivil" value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Soltero/a">Soltero/a</option>
                  <option value="Casado/a">Casado/a</option>
                  <option value="Unión libre">Unión libre</option>
                  <option value="Divorciado/a">Divorciado/a</option>
                  <option value="Viudo/a">Viudo/a</option>
                </select>
              </div>
              <div className={styles.campo}>
                <label htmlFor="dependientes">Dependientes económicos <span className={styles.requerido}>*</span></label>
                <input
                  id="dependientes"
                  type="number"
                  min={0}
                  value={dependientesEconomicos}
                  onChange={(e) => setDependientesEconomicos(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="nivelEstudios">Nivel de estudios <span className={styles.requerido}>*</span></label>
                <select id="nivelEstudios" value={nivelEstudios} onChange={(e) => setNivelEstudios(e.target.value)} required>
                  <option value="">Selecciona una opción</option>
                  <option value="Primaria">Primaria</option>
                  <option value="Secundaria">Secundaria</option>
                  <option value="Preparatoria">Preparatoria</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Posgrado">Posgrado</option>
                </select>
              </div>

              {errorGuardado && <span className={styles.errorMsg}>{errorGuardado}</span>}
              {intentoDatos && !datosValidos && (
                <span className={styles.errorMsg}>Completá todos los campos requeridos para continuar.</span>
              )}

              <div className={styles.botonesFinal}>
                <button type="button" className={styles.cta} onClick={handleGuardarDatos} disabled={guardando}>
                  {guardando ? "Guardando..." : "Siguiente"}
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={onVolver}>
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {paso === "direccion" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Agrega tu dirección</p>
                <p className={styles.subtitulo}>La necesitamos para programar el envío de tu celular</p>
              </div>

              <div className={styles.campo}>
                <label htmlFor="calle">Calle <span className={styles.requerido}>*</span></label>
                <input
                  id="calle"
                  type="text"
                  placeholder="Av. Insurgentes Sur"
                  value={calle}
                  onChange={(e) => setCalle(e.target.value.slice(0, 45))}
                  maxLength={45}
                  required
                />
                <span className={styles.hint}>Solo el nombre de la calle, sin número ni referencias (eso va abajo) · {calle.length}/45</span>
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label htmlFor="numeroExterior">No. exterior <span className={styles.requerido}>*</span></label>
                  <input id="numeroExterior" type="text" placeholder="123" value={numeroExterior} onChange={(e) => setNumeroExterior(e.target.value)} required />
                </div>
                <div className={styles.campo} style={{ flex: 1 }}>
                  <label htmlFor="numeroInterior">No. interior (opcional)</label>
                  <input id="numeroInterior" type="text" placeholder="4B" value={numeroInterior} onChange={(e) => setNumeroInterior(e.target.value)} />
                </div>
              </div>
              <div className={styles.campo}>
                <label htmlFor="codigoPostal">Código postal <span className={styles.requerido}>*</span></label>
                <input
                  id="codigoPostal"
                  type="text"
                  placeholder="06600"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ""))}
                  maxLength={5}
                  className={codigoPostal.length > 0 && codigoPostal.length < 5 ? styles.inputError : ""}
                  required
                />
                {codigoPostal.length > 0 && codigoPostal.length < 5 && (
                  <span className={styles.errorMsg}>El código postal debe contener exactamente 5 dígitos</span>
                )}
              </div>
              <div className={styles.campo}>
                <label htmlFor="colonia">Colonia <span className={styles.requerido}>*</span></label>
                <input id="colonia" type="text" placeholder="Roma Norte" value={colonia} onChange={(e) => setColonia(e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label htmlFor="alcaldiaMunicipio">Alcaldía / Municipio <span className={styles.requerido}>*</span></label>
                <input id="alcaldiaMunicipio" type="text" placeholder="Cuauhtémoc" value={alcaldiaMunicipio} onChange={(e) => setAlcaldiaMunicipio(e.target.value)} required />
              </div>
              <div className={styles.campo}>
                <label htmlFor="estado">Estado <span className={styles.requerido}>*</span></label>
                <input id="estado" type="text" placeholder="Ciudad de México" value={estado} onChange={(e) => setEstado(e.target.value)} required />
              </div>

              {errorGuardado && <span className={styles.errorMsg}>{errorGuardado}</span>}
              {intentoDireccion && !direccionValida && (
                <span className={styles.errorMsg}>Completá todos los campos requeridos para continuar.</span>
              )}

              <div className={styles.botonesFinal}>
                <button type="button" className={styles.cta} onClick={handleGuardarDireccion} disabled={guardando}>
                  {guardando ? "Guardando..." : "Siguiente"}
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={() => setPaso("datos")}>
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {paso === "codigo2" && (
            <div className={styles.paso}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>Confirma tu identidad</p>
                <p className={styles.subtitulo}>Te reenviamos un código para confirmar que sigues siendo tú</p>
              </div>
              <div className={styles.avisoWhatsapp}>
                <FaWhatsapp /> Código enviado a tu WhatsApp
              </div>
              <div className={styles.campo}>
                <label>Ingresa el código enviado al <b>{celular}</b></label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • • • •"
                  maxLength={6}
                  value={otpCodigo}
                  onChange={(e) => { setOtpCodigo(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
                  className={`${styles.otpInput} ${otpError ? styles.inputError : ""}`}
                />
                {otpError && <span className={styles.errorMsg}>{otpError}</span>}
                {otpVerificado && <span className={styles.hint}>Código verificado ✓</span>}
              </div>
              <button
                type="button"
                className={styles.pasoAnterior}
                onClick={handleEnviarOtp}
                disabled={otpEnviando || (resendCountdown > 0 && !otpError)}
                style={{ alignSelf: "flex-start" }}
              >
                {otpEnviando ? "Enviando..." : resendCountdown > 0 && !otpError ? `Reenviar Código (${resendCountdown})` : "Reenviar Código"}
              </button>

              <div className={styles.legalBlock}>
                <label className={styles.terminos}>
                  <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
                  Acepto los{" "}
                  <a href="/terminos" target="_blank" rel="noopener noreferrer">
                    Términos y condiciones
                  </a>
                </label>
              </div>

              {errorGuardado && <span className={styles.errorMsg}>{errorGuardado}</span>}
              {intentoCodigo2 && (!otpVerificado || !aceptaTerminos) && (
                <span className={styles.errorMsg}>
                  {!otpVerificado ? "Verificá el código para continuar." : "Aceptá los términos y condiciones para continuar."}
                </span>
              )}

              <div className={styles.botonesFinal}>
                <button
                  type="button"
                  className={styles.cta}
                  onClick={handleConfirmarTerminos}
                  disabled={guardando}
                >
                  {guardando ? "Confirmando..." : "Confirmar y continuar"}
                </button>
                <button type="button" className={styles.pasoAnterior} onClick={() => setPaso("direccion")}>
                  Paso Anterior
                </button>
              </div>
            </div>
          )}

          {paso === "pago" && (
            <div className={styles.estado}>
              <div className={styles.tituloWrap}>
                <p className={styles.titulo}>¡Ya casi estás!</p>
              </div>
              <div className={styles.ed}>
                {`Solo falta el pago inicial para procesar el envío de tu ${planData.modelo}. La verificación de tu identidad es el último paso, después de pagar.`}
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
              <button className={styles.cta} onClick={handleIniciarPago} disabled={iniciandoPago || !solicitudId} style={{ marginTop: 16 }}>
                {iniciandoPago ? "Preparando pago..." : "Pagar enganche →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
