import React, { useState, useEffect, useRef } from "react";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";
import { FiCheck, FiInfo } from "react-icons/fi";

interface VerificacionProps {
  solicitudId: string;
  modelo: string;
  imagen?: string;
  onFinalizado: () => void;
}

type Estado = "cargando" | "redirigiendo" | "esperando" | "revision" | "error" | "sinRespuesta";

// 4s en vez de 3: la pantalla igual se siente instantánea, y baja un 25% las llamadas
// contra nuestro propio rate limit — que pesa porque las operadoras mexicanas hacen NAT
// y varios clientes reales comparten la misma IP saliente.
const POLL_MS = 4000;
// Tras ~2 minutos sin un resultado definitivo se deja de esperar y se le ofrece una
// salida al cliente. Antes el spinner giraba para siempre si la sesión quedaba colgada
// (pasó 2026-08-18) y no había forma de salir sin recargar a mano.
const MAX_ESPERA_MS = 2 * 60 * 1000;

// Paso 7 del flujo: verificación de identidad en vivo con Verificamex (VerificationSession
// hosteada por ellos — nuestra app ya no captura fotos de INE/selfie). Este componente
// cumple tres roles según cuándo se monta: (1) al llegar recién de Stripe, crea la sesión
// y redirige a la página de Verificamex; (2) cuando Verificamex redirige de vuelta acá,
// hace polling hasta tener una respuesta definitiva; (3) si falló (cualquier motivo:
// puntaje bajo, CURP no coincidente, etc.), pasa directo al mensaje de revisión manual
// — decisión explícita del usuario 2026-08-19: nada de reintentos automáticos, el
// primer rechazo ya lo maneja el equipo a mano en /sadmin.
export const Verificacion: React.FC<VerificacionProps> = ({ solicitudId, modelo, imagen, onFinalizado }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
  const [estado, setEstado] = useState<Estado>("cargando");
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Cada sesión de Verificamex es una llamada facturada, así que crear dos por descuido
  // cuesta plata — y peor: la segunda pisa el session_id guardado, dejando la solicitud
  // siguiendo una sesión que el cliente nunca va a completar (pasó 2026-08-18: el
  // StrictMode de React corre el efecto dos veces en desarrollo y se crearon dos sesiones
  // en el mismo instante; el cliente verificó una y el sistema esperaba la otra para
  // siempre). El ref sobrevive al doble montaje del StrictMode, el estado no.
  const creandoSesionRef = useRef(false);
  const inicioEsperaRef = useRef<number>(Date.now());

  const detenerPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const iniciarSesion = async () => {
    if (creandoSesionRef.current) return;
    creandoSesionRef.current = true;
    setEstado("redirigiendo");
    setErrorMsg("");
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/crear-sesion-verificamex`, {
        method: "POST",
      });
      const res = await response.json();
      if (!response.ok) {
        throw new Error(res.error || "No se pudo iniciar la verificación de identidad.");
      }
      if (res.mock) {
        // Modo mock: ya quedó resuelto del lado del backend, no hay página externa que
        // mostrar — se sigue directo a la pantalla de éxito.
        onFinalizado();
        return;
      }
      window.location.href = res.formUrl;
    } catch (error: any) {
      // Se libera la guarda solo si falló: acá el cliente sigue en la pantalla y el
      // botón de reintentar tiene que poder crear una sesión nueva de verdad.
      creandoSesionRef.current = false;
      setEstado("error");
      setErrorMsg(error.message || "Ocurrió un error al iniciar la verificación.");
    }
  };

  const evaluarEstado = (estadoVerif: any) => {
    if (estadoVerif.estatus === "Preparando paquete" || estadoVerif.estatus === "Pendiente de envío" || estadoVerif.estatus === "Enviado" || estadoVerif.estatus === "Entregado" || estadoVerif.estatus === "Aprobado") {
      detenerPolling();
      onFinalizado();
      return;
    }

    // Stripe puede devolver al cliente acá antes de que llegue su propio webhook (el
    // redirect del navegador y el webhook son dos caminos independientes, y el webhook
    // suele tardar un poco más). Sin esperar a que el pago quede confirmado,
    // crear-sesion-verificamex responde 409 y la pantalla muere en un error que en
    // realidad era solo cuestión de esperar un segundo más.
    if (!estadoVerif.pagoConfirmado) {
      setEstado("esperando");
      return;
    }

    if (!estadoVerif.verificamexStatus) {
      // Todavía no se creó ninguna sesión — primera vez que se entra a este paso.
      detenerPolling();
      iniciarSesion();
      return;
    }

    if (estadoVerif.verificamexStatus === "FINISHED") {
      detenerPolling();
      onFinalizado();
      return;
    }

    if (estadoVerif.verificamexStatus === "FAILED") {
      // Sin reintento automático: el backend ya escala a revisión manual desde el
      // primer rechazo (ver procesarResultadoVerificamex en index.ts).
      detenerPolling();
      setEstado("revision");
      return;
    }

    // OPEN / VERIFYING: sigue en curso. Se espera, pero no para siempre.
    if (Date.now() - inicioEsperaRef.current > MAX_ESPERA_MS) {
      detenerPolling();
      setEstado("sinRespuesta");
      return;
    }
    setEstado("esperando");
  };

  // Consulta el estado de la verificación. El backend, además de leer lo guardado, le
  // pregunta a Verificamex si la sesión sigue en curso — así el resultado llega aunque
  // el webhook nunca aparezca (ver GET /:id/estado-verificacion en el backend).
  const consultarEstado = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/solicitudes/${solicitudId}/estado-verificacion`);
      if (!response.ok) throw new Error("No se pudo consultar tu solicitud.");
      const estadoVerif = await response.json();
      evaluarEstado(estadoVerif);
    } catch {
      // Un error de red puntual durante el polling no debe tirar la pantalla — se
      // reintenta solo en el próximo tick.
    }
  };

  useEffect(() => {
    consultarEstado();
    pollRef.current = setInterval(consultarEstado, POLL_MS);
    return () => detenerPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudId]);

  const renderHeader = () => (
    <div className={styles.header}>
      <div className={styles.detallesTelefono}>
        <div className={styles.telefonoCol}>
          <img src={logoBlanco} alt="Movinex" className={styles.logo} />
          <div className={styles.modelo}>{modelo}</div>
        </div>
        {imagen && (
          <div className={styles.imagenTelefonoWrap}>
            <img src={imagen} alt={modelo} />
          </div>
        )}
      </div>
      <div className={styles.progreso}>
        <div className={styles.pasoIndicador}>
          <span className={`${styles.pasoNum} ${styles.pasoNumDone}`}><FiCheck /></span>
          <span>Cotizar celular</span>
        </div>
        <div className={styles.pasoIndicador}>
          <span className={`${styles.pasoNum} ${styles.pasoNumDone}`}><FiCheck /></span>
          <span>Identidad</span>
        </div>
        <div className={`${styles.pasoIndicador} ${styles.pasoActivo}`}>
          <span className={styles.pasoNum}>3</span>
          <span>Envío</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {renderHeader()}
        <div className={styles.body}>
          {(estado === "cargando" || estado === "redirigiendo" || estado === "esperando") && (
            <div className={styles.estado}>
              <div className={styles.spinner} />
              <div className={styles.et}>
                {estado === "redirigiendo" ? "Preparando tu verificación..." : "Confirmando tu verificación..."}
              </div>
              <div className={styles.ed}>
                {estado === "esperando"
                  ? "Esto puede tardar unos segundos. No cierres esta ventana."
                  : "Te vamos a llevar a la página segura de Verificamex para tomar tu INE y una foto en vivo."}
              </div>
            </div>
          )}

          {estado === "sinRespuesta" && (
            <div className={styles.estado}>
              <FiInfo className={styles.infoIcon} />
              <div className={styles.et}>Seguimos esperando tu verificación</div>
              <div className={styles.ed}>
                Puede tardar unos minutos más en confirmarse — no hace falta que hagas nada.
                Si pasa más tiempo, nuestro equipo la revisa a mano y te contactamos por
                WhatsApp.
              </div>
              <div className={styles.cerrarWrap}>
                <p className={styles.cerrarHint}>Puedes cerrar esta ventana</p>
              </div>
            </div>
          )}

          {estado === "revision" && (
            <div className={styles.estado}>
              <FiInfo className={styles.infoIcon} />
              <div className={styles.et}>Tu solicitud está en revisión</div>
              <div className={styles.ed}>
                No pudimos verificar tu identidad de forma automática. Nuestro equipo la
                está revisando a mano y te contactaremos por WhatsApp en cuanto esté lista.
              </div>
              <div className={styles.cerrarWrap}>
                <p className={styles.cerrarHint}>Puedes cerrar esta ventana</p>
              </div>
            </div>
          )}

          {estado === "error" && (
            <div className={styles.estado}>
              <div className={styles.et}>Ocurrió un error</div>
              <div className={styles.ed}>{errorMsg}</div>
              <button className={styles.cta} onClick={iniciarSesion} style={{ marginTop: 16 }}>
                Volver a intentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
