import type { Phone } from "../../types";
import styles from "../../Landing.module.css";
import { CATALOGO_FONDOS, CATALOGO_FOTOS_POPUP, FONDO_DEFAULT, getFotosCelular, getNombreCelular } from "../../pages/landing/catalogo-data";
import { useCarrusel } from "../../hooks/useCarrusel";

interface QuickViewModalProps {
  phone: Phone;
  onClose: () => void;
  onSolicitar: (phone: Phone) => void;
}

export function QuickViewModal({ phone, onClose, onSolicitar }: QuickViewModalProps) {
  const { activo, irAFoto } = useCarrusel();
  const fotos = getFotosCelular(phone);
  // El pop-up usa fotos SIN el fondo (mismo orden/índice que `fotos`),
  // mostradas con `contain` para no recortar al celular — el fondo lo
  // pone el gradiente del wrap. Prioridad: lo cargado en el sadmin
  // (`phone.imagenesPopup`), después el fallback local por id.
  const fotosPopupTransp =
    (phone.imagenesPopup && phone.imagenesPopup.length > 0 ? phone.imagenesPopup : undefined) ||
    CATALOGO_FOTOS_POPUP[phone.id];
  const fotosPopup = fotosPopupTransp || fotos;
  const activa = activo(phone.id, fotos.length);
  const irAFotoDe = (i: number) => irAFoto(phone.id, i, fotos.length);
  const specsTodas: [string, string][] = [
    ["Pantalla", phone.specsPantalla || ""],
    ["Procesador", phone.specsProcesador || ""],
    ["Almacenamiento", phone.specsRamAlmacenamiento || ""],
    ["MicroSD", phone.specsMicrosd || ""],
    ["Cámara trasera", phone.specsCamaraTrasera || ""],
    ["Cámara frontal", phone.specsCamaraFrontal || ""],
    ["Batería", phone.specsBateria || ""],
    ["Sistema", phone.specsSistema || ""],
    ["Seguridad", phone.specsSeguridad || ""],
    ["Resistencia", phone.specsResistencia || ""],
    ["Conectividad", phone.specsConectividad || ""],
    ["Dimensiones", phone.specsDimensionesPeso || ""],
  ];
  const specs = specsTodas.filter(([, val]) => val);
  const nombreModal = getNombreCelular(phone);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
          &times;
        </button>
        <div
          className={styles.modalImgWrap}
          style={{
            background:
              phone.gradienteInicio && phone.gradienteFin
                ? `linear-gradient(230.54deg, ${phone.gradienteInicio} 33.766%, ${phone.gradienteFin} 97.531%)`
                : CATALOGO_FONDOS[phone.id] || FONDO_DEFAULT,
          }}
        >
          {fotosPopup[activa] && (
            <img
              src={fotosPopup[activa]}
              alt={phone.modelo}
              className={fotosPopupTransp ? styles.modalImgTransparente : undefined}
            />
          )}
          {fotos.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeIzq}`}
                onClick={() => irAFotoDe(activa - 1)}
                aria-label="Foto anterior"
              />
              <button
                type="button"
                className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeDer}`}
                onClick={() => irAFotoDe(activa + 1)}
                aria-label="Foto siguiente"
              />
              <div className={styles.modalDots}>
                {fotos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.modalDot} ${i === activa ? styles.modalDotActiva : ""}`}
                    onClick={() => irAFotoDe(i)}
                    aria-label={`Ver foto ${i + 1} de ${phone.modelo}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.modalContent}>
          <div className={styles.modalTop}>
            <div className={styles.modalTexto}>
              <div className={styles.modalTitulo}>
                <h2 className={styles.modalTitle}>{nombreModal}</h2>
                <span className={styles.modalBadge}>
                  Desde ${phone.montoSemanal52}/sem
                </span>
              </div>
              <div className={styles.modalPrecios}>
                <p>Precio original ${phone.precioBase.toLocaleString()}</p>
                {phone.precioDescuento != null && (
                  <p>
                    Precio con descuento $
                    {phone.precioDescuento.toLocaleString()}
                  </p>
                )}
                <p>Enganche ${phone.enganche.toLocaleString()}</p>
              </div>
            </div>
            <button className={styles.solicitarBtn} onClick={() => onSolicitar(phone)}>
              Solicitar Crédito
            </button>
          </div>
          <div className={styles.specsScroll}>
            {specs.map(([label, value]) => (
              <div key={label} className={styles.specRow}>
                <span>{label}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
