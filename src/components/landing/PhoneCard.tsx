import { Link } from "react-router";
import type { Phone } from "../../types";
import styles from "../../Landing.module.css";
import { getFotosCelular, getNombreCelular } from "../../pages/landing/catalogo-data";
import { useCarrusel } from "../../hooks/useCarrusel";

interface PhoneCardProps {
  phone: Phone;
  onVerDetalles: (phone: Phone) => void;
}

export function PhoneCard({ phone, onVerDetalles }: PhoneCardProps) {
  const { activo, irAFoto } = useCarrusel();
  const fotos = getFotosCelular(phone);
  const activa = activo(phone.id, fotos.length);
  const nombre = getNombreCelular(phone);
  const irAFotoDe = (i: number) => irAFoto(phone.id, i, fotos.length);

  return (
    <div className={styles.tiendaCard}>
      <div className={styles.tiendaCardImgWrap}>
        {fotos[activa] && <img src={fotos[activa]} alt={nombre} />}
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeIzq}`}
              onClick={() => irAFotoDe(activa - 1)}
              aria-label={`Foto anterior de ${nombre}`}
            />
            <button
              type="button"
              className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeDer}`}
              onClick={() => irAFotoDe(activa + 1)}
              aria-label={`Foto siguiente de ${nombre}`}
            />
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className={styles.tiendaCardDots}>
          {fotos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.tiendaCardDot} ${i === activa ? styles.tiendaCardDotActiva : ""}`}
              onClick={() => irAFotoDe(i)}
              aria-label={`Ver foto ${i + 1} de ${nombre}`}
            />
          ))}
        </div>
      )}
      <div className={styles.tiendaCardInfo}>
        <h3>{nombre}</h3>
        <div className={styles.tiendaCardPrecio}>
          <p className={styles.tiendaCardDesde}>
            Desde ${phone.montoSemanal52}/sem
          </p>
          <p className={styles.tiendaCardEnganche}>
            Enganche ${phone.enganche}
          </p>
        </div>
      </div>
      <div className={styles.tiendaCardBotones}>
        <button
          type="button"
          className={styles.tiendaCardBtnDetalles}
          onClick={() => onVerDetalles(phone)}
        >
          Detalles
        </button>
        {/* <Link> y no <button>: renderiza un <a href> real, que es la
            única forma de que Google descubra las páginas de cada
            celular (antes eran huérfanas). La navegación sigue siendo
            del lado del cliente, y /cotizar/:id ya sabe reconstruir el
            teléfono desde la URL, así que no hace falta onSelectPhone. */}
        <Link to={`/cotizar/${phone.id}`} className={styles.tiendaCardBtnSolicitar}>
          Solicitar crédito
        </Link>
      </div>
    </div>
  );
}
