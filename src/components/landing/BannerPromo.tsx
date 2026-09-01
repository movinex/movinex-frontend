import { Link } from "react-router";
import type { Phone } from "../../types";
import styles from "../../Landing.module.css";

interface BannerPromoProps {
  ultimoCelular: Phone | undefined;
}

export function BannerPromo({ ultimoCelular }: BannerPromoProps) {
  if (!ultimoCelular) return null;

  return (
    <section className={styles.bannerPromo}>
      <div className={styles.bannerPromoCard}>
        <div className={styles.bannerPromoInfo}>
          <span className={styles.bannerPromoTag}>
            <span className={styles.bannerPromoDot}>•</span> Último Celular
          </span>
          <div>
            <p className={styles.bannerPromoModelo}>
              {ultimoCelular.marca} {ultimoCelular.modelo}
            </p>
            <Link to={`/cotizar/${ultimoCelular.id}`} className={styles.bannerPromoBtn}>
              Desde ${ultimoCelular.montoSemanal52}/Sem
            </Link>
          </div>
        </div>
        <div className={styles.bannerPromoImgWrap}>
          <img
            src={ultimoCelular.imagen}
            alt={`${ultimoCelular.marca} ${ultimoCelular.modelo}`}
          />
        </div>
      </div>
    </section>
  );
}
