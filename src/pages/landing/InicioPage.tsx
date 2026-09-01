import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Phone } from "../../types";
import styles from "../../Landing.module.css";
import { BannerPromo } from "../../components/landing/BannerPromo";
import { FaqSection } from "../../components/landing/FaqSection";
import heroVideo from "../../assets/hero-video.mp4";
import imgPasoElQueTuElijas from "../../assets/carrusel-el-que-tu-elijas.webp";
import imgPasoElQueTuElijasMovil from "../../assets/carrusel-el-que-tu-elijas-movil.webp";
import imgPasoSinFilas from "../../assets/carrusel-sin-filas.webp";
import imgPasoSinFilasMovil from "../../assets/carrusel-sin-filas-movil.webp";
import imgPasoPagaCadaSemana from "../../assets/carrusel-paga-cada-semana.webp";
import imgPasoPagaCadaSemanaMovil from "../../assets/carrusel-paga-cada-semana-movil.webp";
import imgPasoDondeTuElijas from "../../assets/carrusel-donde-tu-elijas.webp";
import imgPasoDondeTuElijasMovil from "../../assets/carrusel-donde-tu-elijas-movil.webp";
import logoSamsung from "../../assets/figma-logo-samsung.svg";
import logoXiaomi from "../../assets/figma-logo-xiaomi.svg";
import logoHonor from "../../assets/figma-logo-honor.svg";
import logoMotorola from "../../assets/figma-logo-motorola.svg";
import logoMarca5 from "../../assets/figma-logo-5.svg";
import imgPorQue1 from "../../assets/figma-card1.webp";
import imgPorQue2 from "../../assets/figma-card2.webp";
import imgPorQue3 from "../../assets/figma-card3.webp";

const pasos = [
  {
    titulo: "El que tú elijas",
    descripcion:
      "Elige el celular que quieras de nuestro catálogo y llévatelo con tan solo el 15% de enganche.",
    imagenDesktop: imgPasoElQueTuElijas,
    imagenMovil: imgPasoElQueTuElijasMovil,
  },
  {
    titulo: "Sin filas ni papeleos",
    descripcion:
      "Obtén tu cupo en minutos, solo con tu INE y WhatsApp. Cero papeleo, cero complicaciones.",
    imagenDesktop: imgPasoSinFilas,
    imagenMovil: imgPasoSinFilasMovil,
  },
  {
    titulo: "Paga cada semana",
    descripcion: "Elige tu plazo: 26 o 52 pagos semanales. Sin sorpresas.",
    imagenDesktop: imgPasoPagaCadaSemana,
    imagenMovil: imgPasoPagaCadaSemanaMovil,
  },
  {
    titulo: "Donde tú elijas",
    descripcion:
      "Sin filas ni esperas. Pide en línea y recíbelo en la puerta de tu casa.",
    imagenDesktop: imgPasoDondeTuElijas,
    imagenMovil: imgPasoDondeTuElijasMovil,
  },
];

const PASO_DURACION_MS = 5000;

interface InicioPageProps {
  ultimoCelular: Phone | undefined;
  activa: boolean;
}

export function InicioPage({ ultimoCelular, activa }: InicioPageProps) {
  const [pasoActivo, setPasoActivo] = useState(1);

  // Avanza automáticamente al siguiente paso; se reinicia cada vez que
  // pasoActivo cambia, ya sea por el timer o por un click manual.
  useEffect(() => {
    if (!activa) return;
    const timer = setTimeout(() => {
      setPasoActivo((prev) => (prev + 1) % pasos.length);
    }, PASO_DURACION_MS);
    return () => clearTimeout(timer);
  }, [activa, pasoActivo]);

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBlob} aria-hidden="true" />
        <div className={styles.heroLeft}>
          <div className={styles.heroTextBlock}>
            <h1 className={styles.heroTitle}>
              El celular que necesitas, <span>a tu ritmo</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Sin trámites burocráticos ni tarjeta de crédito.
              <br />
              Elige tu equipo y recíbelo en tu puerta.
            </p>
          </div>
          <Link to="/tienda" className={styles.ctaPrimary}>
            Elige tu celular
          </Link>
        </div>
        <div className={styles.heroVideoWrap}>
          <video
            className={styles.heroVideoTag}
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </section>

      {/* MARCAS VENDIDAS */}
      <section className={styles.marcasVendidas}>
        <div className={styles.marcasBandBg} aria-hidden="true" />
        <div className={styles.marcasHeading}>
          <h2>
            Las marcas que
            <br className={styles.marcasHeadingBreak} />
            <span> ya conoces</span>
          </h2>
          <p>
            Equipos originales de las marcas que confías, listos para
            trabajar y conectarte.
          </p>
        </div>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[
              logoSamsung,
              logoXiaomi,
              logoHonor,
              logoMotorola,
              logoMarca5,
              logoSamsung,
              logoXiaomi,
              logoHonor,
              logoMotorola,
              logoMarca5,
            ].map((logo, idx) => (
              <div className={styles.marqueeItem} key={idx}>
                <img src={logo} alt="" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className={styles.comoFunciona}>
        <h2 className={styles.comoFuncionaTitle}>
          <span>Sin esperas,</span>
          <br />
          sin trámites, sin filas.
        </h2>
        <div className={styles.comoFuncionaGrid}>
          <div className={styles.pasosColumn}>
            <div className={styles.pasosList}>
              {pasos.map((paso, idx) => (
                <div
                  key={idx}
                  className={`${styles.paso} ${pasoActivo === idx ? styles.pasoActivo : ""}`}
                  onClick={() => setPasoActivo(idx)}
                >
                  <p className={styles.pasoTitulo}>{paso.titulo}</p>
                  {pasoActivo === idx && (
                    <>
                      <p className={styles.pasoDescripcion}>{paso.descripcion}</p>
                      <div className={styles.pasoBarra}>
                        <div key={idx} className={styles.pasoBarraFill} />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <Link to="/tienda" className={styles.ctaPrimary}>
              Solicita tú crédito
            </Link>
          </div>
          <div className={styles.comoFuncionaImgWrap}>
            <img
              src={pasos[pasoActivo].imagenDesktop}
              alt={pasos[pasoActivo].titulo}
              className={styles.comoFuncionaImgDesktop}
            />
            <img
              src={pasos[pasoActivo].imagenMovil}
              alt={pasos[pasoActivo].titulo}
              className={styles.comoFuncionaImgMovil}
            />
          </div>
        </div>
      </section>

      {/* POR QUÉ MOVINEX */}
      <section className={styles.porQueMovinex}>
        <div className={styles.porQueBlob} aria-hidden="true" />
        <h2 className={styles.porQueTitle}>
          Aprobación <span>en minutos</span>
        </h2>
        <div className={styles.porQueGrid}>
          <div className={styles.porQueCard}>
            <div className={styles.porQueImgWrap}>
              <img src={imgPorQue1} alt="Con nosotros si calificas" />
            </div>
            <div className={styles.porQueTextWrap}>
              <h3>Con nosotros si calificas</h3>
              <p className={styles.porQueDesc}>
                Olvídate del papeleo, aquí es sin historial bancario, sin
                tarjetas, sin aval.
              </p>
            </div>
          </div>
          <div className={styles.porQueCard}>
            <div className={styles.porQueImgWrap}>
              <img src={imgPorQue2} alt="Números claros desde el día uno" />
            </div>
            <div className={styles.porQueTextWrap}>
              <h3>Números claros desde el día uno</h3>
              <p className={styles.porQueDesc}>
                Lo que ves es lo que pagas. Sin cobros extra y si te
                atrasas, no te cobramos de más.
              </p>
            </div>
          </div>
          <div className={styles.porQueCard}>
            <div className={styles.porQueImgWrap}>
              <img src={imgPorQue3} alt="Te lo enviamos directo a tu puerta" />
            </div>
            <div className={styles.porQueTextWrap}>
              <h3>Te lo enviamos directo a tu puerta</h3>
              <p className={styles.porQueDesc}>
                Nada de filas ni de perder el tiempo en tiendas físicas. Tú
                lo pides, nosotros lo enviamos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <BannerPromo ultimoCelular={ultimoCelular} />
      <FaqSection />
    </>
  );
}
