import { useState, useEffect } from "react";
import { Link } from "react-router";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { PiCookieBold } from "react-icons/pi";
import styles from "../../Landing.module.css";
import logoColor from "../../assets/movinex_color.webp";
import type { LandingPage } from "../../pages/landing/types";

interface HeaderProps {
  page: LandingPage;
  irA: (p: LandingPage) => void;
  showAdminButton?: boolean;
  onNavigateAdmin: () => void;
}

export function Header({ page, irA, showAdminButton, onNavigateAdmin }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  return (
    <>
      {/* HEADER — en Tienda es blanco sólido (sin el efecto vidrio), así lo
          marca el Figma del catálogo, seguramente porque las tarjetas de
          colores debajo se verían muy cargadas a través del blur. */}
      <header className={`${styles.header} ${page === "tienda" ? styles.headerSolido : ""}`}>
        <div className={styles.headerContent}>
          <img
            src={logoColor}
            alt="Movinex Logo"
            className={styles.logo}
            onClick={() => irA("inicio")}
            style={{ cursor: "pointer" }}
          />
          <nav className={styles.nav}>
            <Link
              to="/"
              className={`${styles.navLink} ${page === "inicio" ? styles.navLinkActive : ""}`}
            >
              Inicio
            </Link>
            <Link
              to="/movinex"
              className={`${styles.navLink} ${page === "movinex" ? styles.navLinkActive : ""}`}
            >
              Quienes Somos
            </Link>
            <Link to="/tienda" className={styles.ctaCotizar}>
              <span className={styles.ctaCotizarDot}>•</span> Cotiza aquí
            </Link>
            {showAdminButton && (
              <button onClick={onNavigateAdmin} className={styles.adminBtn}>
                Backoffice
              </button>
            )}
          </nav>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </header>

      {/* MENÚ MÓVIL */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileMenuLinks}>
            <button onClick={() => irA("inicio")} className={styles.mobileMenuLink}>
              Inicio
            </button>
            <button onClick={() => irA("movinex")} className={styles.mobileMenuLink}>
              Quienes Somos
            </button>
            <button onClick={() => irA("tienda")} className={styles.mobileMenuCta}>
              Cotiza aquí
            </button>
          </nav>
          <div className={styles.mobileMenuSocial}>
            <span>Visítanos en nuestras redes</span>
            <div className={styles.mobileMenuSocialIcons}>
              <button
                onClick={() => irA("cookies")}
                className={styles.socialIconBtn}
                aria-label="Política de cookies"
              >
                <PiCookieBold size={20} />
              </button>
              <a
                href="https://www.facebook.com/profile.php?id=61590577951610"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Movinex en Facebook"
                className={styles.socialIconBtn}
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/movinex.mx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Movinex en Instagram"
                className={styles.socialIconBtn}
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="https://wa.me/525555028744?text=Hola%20Movinex,%20quiero%20comprar%20un%20celular"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Movinex en WhatsApp"
                className={styles.socialIconBtn}
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
