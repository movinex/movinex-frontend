import type { Phone } from "../../types";
import styles from "../../Landing.module.css";
import { PhoneCard } from "../../components/landing/PhoneCard";

interface TiendaPageProps {
  phones: Phone[];
  loading: boolean;
  fotosListas: boolean;
  onVerDetalles: (phone: Phone) => void;
}

export function TiendaPage({ phones, loading, fotosListas, onVerDetalles }: TiendaPageProps) {
  return (
    <section className={styles.tiendaFigma}>
      <div className={styles.tiendaTitulo}>
        <h1>Elige tu próximo celular</h1>
        <p>Escoge tu celular de nuestro catálogo y nosotros te lo enviamos a casa</p>
      </div>
      <div className={styles.tiendaGrid}>
        {loading || !fotosListas
          ? Array.from({ length: 6 }).map((_, idx) => (
              <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
                <div className={styles.skeletonImg}></div>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonSubtext}></div>
                <div className={styles.skeletonButton}></div>
              </div>
            ))
          : phones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} onVerDetalles={onVerDetalles} />
            ))}
      </div>
    </section>
  );
}
