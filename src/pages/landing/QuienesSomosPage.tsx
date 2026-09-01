import { Link } from "react-router";
import type { Phone } from "../../types";
import styles from "../../Landing.module.css";
import { BannerPromo } from "../../components/landing/BannerPromo";
import { FaqSection } from "../../components/landing/FaqSection";
import imgQsHero from "../../assets/quienes-hero.webp";
import imgQsHeroMovil from "../../assets/quienes-hero-movil.webp";
import imgQsComoFunciona from "../../assets/quienes-como-funciona.webp";

const pasosQuienesSomos = [
  {
    numero: 1,
    items: [
      "Escoge el celular que más te guste de nuestro catálogo y elige.",
      "Elige el plazo semanal que mejor se adapte a tu bolsillo: 26 o 52 semanas.",
      "Tú decides cuánto pagar cada semana, sin sorpresas.",
    ],
  },
  {
    numero: 2,
    items: [
      "Ingresa tu número de WhatsApp para comenzar tu solicitud en un par de minutos.",
      "Ten tu INE a la mano, la vas a necesitar más adelante. Todo es digital, sin papeleos ni vueltas.",
    ],
  },
  {
    numero: 3,
    items: [
      "Realiza el pago de tu enganche, equivalente al 15% del valor de tu celular.",
      "Es el único pago que necesitas hacer para asegurar tu equipo.",
    ],
  },
  {
    numero: 4,
    items: [
      "Sube tu INE para validar tu identidad de forma rápida.",
      "Llena el formulario con tus datos y listo: te llevamos el celular hasta la puerta de tu casa, sin que tengas que moverte.",
    ],
  },
];

interface QuienesSomosPageProps {
  ultimoCelular: Phone | undefined;
}

export function QuienesSomosPage({ ultimoCelular }: QuienesSomosPageProps) {
  return (
    <>
      {/* HERO */}
      <section className={styles.qsHero}>
        <div className={styles.qsHeroBlob} aria-hidden="true" />
        <div className={styles.qsHeroImgWrap}>
          <picture>
            <source media="(max-width: 900px)" srcSet={imgQsHeroMovil} />
            <img src={imgQsHero} alt="Movinex" />
          </picture>
        </div>
        <div className={styles.qsHeroContent}>
          <div className={styles.qsHeroLeft}>
            <h1 className={styles.qsHeroTitle}>
              Llevamos tecnología a las manos de todos los <span>mexicanos</span>
            </h1>
            <div className={styles.qsHeroChecks}>
              <span>✓ Rapido</span>
              <span>✓ Facil</span>
              <span>✓ Sin Papeleo</span>
            </div>
          </div>
          <div className={styles.qsHeroRight}>
            <p>
              En Movinex le decimos que sí a todos los mexicanos. Te
              financiamos el celular que necesitas y te lo llevamos hasta
              la puerta de tu casa. Sin avales, sin Buró y sin papeleo
              interminable.
            </p>
            <Link to="/tienda" className={styles.ctaSmall}>
              Elige tu Celular Ya
            </Link>
          </div>
        </div>
      </section>

      {/* FRASE (banda diagonal) */}
      <section className={styles.qsQuote}>
        <div className={styles.qsQuoteBandBg} aria-hidden="true" />
        <p>
          Somos una fintech 100% mexicana con el objetivo de facilitar el
          acceso a celulares a todos los mexicanos sin importar su
          historial crediticio.
        </p>
      </section>

      {/* COMO FUNCIONA MOVINEX */}
      <section className={styles.qsComoFunciona}>
        <div className={styles.qsComoFuncionaInner}>
          <div className={styles.qsComoFuncionaTop}>
            <div className={styles.qsComoFuncionaHead}>
              <h2>
                Como funciona <span>Movinex</span>
              </h2>
              <p>Estas a tan solo 4 pasos de tener tu nuevo celular</p>
            </div>
            <img
              src={imgQsComoFunciona}
              alt=""
              aria-hidden="true"
              className={styles.qsComoFuncionaPhoto}
            />
          </div>
          <div className={styles.qsPasosGrid}>
            {pasosQuienesSomos.map((paso) => (
              <div className={styles.qsPasoCard} key={paso.numero}>
                <div className={styles.qsPasoNumero}>{paso.numero}</div>
                <div className={styles.qsPasoItems}>
                  {paso.items.map((item, idx) => (
                    <p className={styles.qsPasoItem} key={idx}>
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Link to="/tienda" className={styles.ctaSmall}>
          Cotiza Aquí
        </Link>
      </section>

      <BannerPromo ultimoCelular={ultimoCelular} />
      <FaqSection />
    </>
  );
}
