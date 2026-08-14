import { useLocation } from 'react-router';
import { FaWhatsapp } from 'react-icons/fa6';
import styles from './BotonWhatsapp.module.css';

// Número de atención al cliente (distinto del número desde el que salen los OTP).
const NUMERO_ATENCION = '525555028744';
const MENSAJE = '¡Hola! Tengo una duda sobre Movinex.';

// Rutas donde no tiene sentido mostrarlo: los paneles internos del equipo.
const RUTAS_OCULTAS = ['/sadmin', '/dashboard'];

/**
 * Botón flotante de WhatsApp para atención al cliente. Se muestra en todo el sitio
 * público, incluido el flujo de checkout: buena parte de las dudas (y de los que
 * abandonan antes de pagar) aparecen justo ahí, y así saben a dónde escribir.
 */
export const BotonWhatsapp = () => {
  const location = useLocation();

  if (RUTAS_OCULTAS.some((ruta) => location.pathname.startsWith(ruta))) {
    return null;
  }

  return (
    <a
      className={styles.boton}
      href={`https://wa.me/${NUMERO_ATENCION}?text=${encodeURIComponent(MENSAJE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="¿Tienes dudas? Escríbenos por WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};
