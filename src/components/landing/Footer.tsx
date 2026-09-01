import { Link } from "react-router";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { PiCookieBold } from "react-icons/pi";
import styles from "../../Landing.module.css";
import logoFooter from "../../assets/figma-logo-footer.svg";
import type { LandingPage } from "../../pages/landing/types";

interface FooterProps {
  irA: (p: LandingPage) => void;
}

export function Footer({ irA }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <div className={styles.footerLogoRow}>
            <img src={logoFooter} alt="Movinex" className={styles.footerLogo} />
          </div>
          <div className={styles.socialsWix}>
            <button
              onClick={() => irA("cookies")}
              className={styles.socialIconLink}
              aria-label="Política de cookies"
            >
              <PiCookieBold size={18} />
            </button>
            <a
              href="https://www.facebook.com/profile.php?id=61590577951610"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Movinex en Facebook"
              className={`${styles.socialIconLink} ${styles.socialFacebook}`}
            >
              <FaFacebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/movinex.mx/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Movinex en Instagram"
              className={`${styles.socialIconLink} ${styles.socialInstagram}`}
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://wa.me/525555028744?text=Hola%20Movinex,%20quiero%20comprar%20un%20celular"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Movinex en WhatsApp"
              className={styles.socialIconLink}
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>
        <div className={styles.footerColumn}>
          <h4>Para tí</h4>
          <div className={styles.footerLinks}>
            <Link to="/tienda" className={styles.footerBtnLink}>
              Cotiza Aquí
            </Link>
            <Link to="/movinex" className={styles.footerBtnLink}>
              Quienes somos
            </Link>
          </div>
        </div>
        <div className={styles.footerColumn}>
          <h4>Atención al Cliente</h4>
          <div className={styles.footerLinks}>
            <a
              href="https://wa.me/525555028744?text=Hola%20Movinex"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contáctanos
            </a>
          </div>
        </div>
        <div className={styles.footerColumn}>
          <h4>Legal</h4>
          <div className={styles.footerLinks}>
            <Link to="/envios" className={styles.footerBtnLink}>
              Envío y devoluciones
            </Link>
            <Link to="/terminos" className={styles.footerBtnLink}>
              Términos y condiciones
            </Link>
            <Link to="/privacidad" className={styles.footerBtnLink}>
              Aviso de privacidad
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.footerBottomRow}>
        <p>© 2026 Movinex. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
