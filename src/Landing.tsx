import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import styles from "./Landing.module.css";
import type { Phone } from "./types";
import { LegalContent } from "./LegalContent";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { PiCookieBold } from "react-icons/pi";

const LANDING_SUBPAGES = ["movinex", "tienda", "privacidad", "terminos", "cookies", "envios"] as const;
type LandingPage = "inicio" | (typeof LANDING_SUBPAGES)[number];

// Hero (video en loop, entregado por la diseñadora)
import heroVideo from "./assets/hero-video.mp4";

// "Cómo funciona" — imagen del paso activo (Figma)
import imgComoFunciona from "./assets/figma-carrusel-paso2.webp";

// "Por qué Movinex" — imágenes de las 3 tarjetas (Figma)
import imgPorQue1 from "./assets/figma-card1.webp";
import imgPorQue2 from "./assets/figma-card2.webp";
import imgPorQue3 from "./assets/figma-card3.webp";

// Logo en monocromo, para el footer sobre fondo azul marino (Figma)
import logoMoviMono from "./assets/logo-movi-mono.svg";
import logoNexMono from "./assets/logo-nex-mono.svg";

// Brand logos (imágenes nuevas del usuario)
import marca1 from "./assets/marca1.webp";
import marca2 from "./assets/marca2.webp";
import marca3 from "./assets/marca3.webp";
import marca4 from "./assets/marca4.webp";
import marca5 from "./assets/marca5.webp";

// Payment methods
import logoColor from "./assets/movinex_color.webp";
import sevenLogo from "./assets/7-eleven_logo.svg.webp";
import speiLogo from "./assets/spei.webp";
import mpLogo from "./assets/images mercado.webp";
import ahorroLogo from "./assets/66e332240412cb710d3532c4_Farmacias del Ahorro.webp";

interface LandingProps {
  onSelectPhone: (phone: Phone) => void;
  onNavigateAdmin: () => void;
  showAdminButton?: boolean;
}

export const Landing: React.FC<LandingProps> = ({
  onSelectPhone,
  onNavigateAdmin,
  showAdminButton = false,
}) => {
  const { page: pageParam } = useParams<{ page?: string }>();
  const navigate = useNavigate();
  const page: LandingPage = (LANDING_SUBPAGES as readonly string[]).includes(pageParam || "")
    ? (pageParam as LandingPage)
    : "inicio";
  const irA = (p: LandingPage) => navigate(p === "inicio" ? "/" : `/${p}`);
  const [selectedQuickView, setSelectedQuickView] = useState<Phone | null>(
    null,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent TS6133 unused prop error while Backoffice is commented
  ((_x: any) => {})(onNavigateAdmin);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  const pasos = [
    {
      titulo: "El que tú elijas",
      descripcion:
        "Elige el celular que quieras de nuestro catálogo y llévatelo con tan solo el 15% de enganche.",
    },
    {
      titulo: "Sin filas ni papeleos",
      descripcion:
        "Obtén tu aprobación en minutos, solo con tu INE y WhatsApp. Cero papeleo, cero complicaciones.",
    },
    {
      titulo: "Paga cada semana",
      descripcion: "Elige tu plazo: 26 o 52 pagos semanales. Sin sorpresas.",
    },
    {
      titulo: "Donde tú elijas",
      descripcion:
        "Sin filas ni esperas. Pide en línea y recíbelo en la puerta de tu casa.",
    },
  ];
  const PASO_DURACION_MS = 5000;
  const [pasoActivo, setPasoActivo] = useState(1);

  // Avanza automáticamente al siguiente paso; se reinicia cada vez que
  // pasoActivo cambia, ya sea por el timer o por un click manual.
  useEffect(() => {
    if (page !== "inicio") return;
    const timer = setTimeout(() => {
      setPasoActivo((prev) => (prev + 1) % pasos.length);
    }, PASO_DURACION_MS);
    return () => clearTimeout(timer);
  }, [page, pasoActivo, pasos.length]);

  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  // Smooth scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [page]);

  // Cargar catálogo de celulares desde el backend
  useEffect(() => {
    if (page === "tienda") {
      setLoading(true);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
      fetch(`${backendUrl}/api/celulares`)
        .then((res) => res.json())
        .then((data) => {
          // Mapear campos de base de datos snake_case a camelCase si es necesario
          const celularesMapeados = data.map((p: any) => ({
            id: p.id,
            modelo: p.modelo,
            marca: p.marca,
            precioBase: Number(p.precio_base),
            enganche: Number(p.enganche),
            montoSemanal26: Number(p.monto_semanal_26),
            montoSemanal52: Number(p.monto_semanal_52),
            totalPagar26: Number(p.monto_semanal_26) * 26 + Number(p.enganche),
            totalPagar52: Number(p.monto_semanal_52) * 52 + Number(p.enganche),
            ahorro26: 0,
            imagen: p.imagen_url || p.imagen || '',
            envioGratis: p.envio_gratis !== false,
            costoEnvio: Number(p.costo_envio || 0),
            specsPantalla: p.specs_pantalla || '',
            specsProcesador: p.specs_procesador || '',
            specsRamAlmacenamiento: p.specs_ram_almacenamiento || '',
            specsMicrosd: p.specs_microsd || '',
            specsCamaraTrasera: p.specs_camara_trasera || '',
            specsCamaraFrontal: p.specs_camara_frontal || '',
            specsBateria: p.specs_bateria || '',
            specsSistema: p.specs_sistema || '',
            specsSeguridad: p.specs_seguridad || '',
            specsResistencia: p.specs_resistencia || '',
            specsConectividad: p.specs_conectividad || '',
            specsDimensionesPeso: p.specs_dimensiones_peso || ''
          }));
          setPhones(celularesMapeados);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar catálogo de celulares:", err);
          setPhones([]);
          setLoading(false);
        });
    }
  }, [page]);

  const handleQuickView = (phone: Phone) => {
    setSelectedQuickView(phone);
  };

  const handleCloseQuickView = () => {
    setSelectedQuickView(null);
  };

  const handleProcederCotizar = (phone: Phone) => {
    setSelectedQuickView(null);
    onSelectPhone(phone);
  };

  // State to track if all heavy main page images are loaded
  const [criticalImagesLoaded, setCriticalImagesLoaded] = useState(false);

  useEffect(() => {
    // List of initial images that need to be preloaded
    const criticalUrls = [
      logoColor,
      imgComoFunciona,
      imgPorQue1,
      imgPorQue2,
      imgPorQue3,
    ];

    let loadedCount = 0;
    const totalToLoad = criticalUrls.length;

    criticalUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) {
          setCriticalImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) {
          setCriticalImagesLoaded(true);
        }
      };
    });
  }, []);

  return (
    <div className={styles.container}>
      {/* Full Page Loader Overlay */}
      {!criticalImagesLoaded && (
        <div className={styles.pageLoaderOverlay}>
          <div className={styles.loaderContent}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img
            src={logoColor}
            alt="Movinex Logo"
            className={styles.logo}
            onClick={() => irA("inicio")}
            style={{ cursor: "pointer" }}
          />
          <nav className={styles.nav}>
            <button
              onClick={() => irA("inicio")}
              className={`${styles.navLink} ${page === "inicio" ? styles.navLinkActive : ""}`}
            >
              Inicio
            </button>
            <button
              onClick={() => irA("movinex")}
              className={`${styles.navLink} ${page === "movinex" ? styles.navLinkActive : ""}`}
            >
              Quienes Somos
            </button>
            <button onClick={() => irA("tienda")} className={styles.ctaCotizar}>
              Cotiza aquí
            </button>
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
            <button
              onClick={() => irA("tienda")}
              className={styles.mobileMenuCta}
            >
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

      {/* ===================== INICIO ===================== */}
      {page === "inicio" && (
        <>
          {/* HERO */}
          <section className={styles.hero}>
            <div className={styles.heroLeft}>
              <div className={styles.heroTextBlock}>
                <h1 className={styles.heroTitle}>
                  El celular que necesitas, a tu ritmo
                </h1>
                <p className={styles.heroSubtitle}>
                  Sin trámites burocráticos ni tarjeta de crédito. Tú eliges el
                  equipo, nosotros lo enviamos a tu puerta.
                </p>
              </div>
              <button
                onClick={() => irA("tienda")}
                className={styles.ctaPrimary}
              >
                Elige tu celular
              </button>
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
            <div className={styles.marcasHeading}>
              <h2>Las marcas que ya conoces</h2>
              <p>
                Equipos originales de las marcas que confías, listos para
                trabajar y conectarte.
              </p>
            </div>
            <div className={styles.marquee}>
              <div className={styles.marqueeTrack}>
                {[marca1, marca2, marca3, marca4, marca5, marca1, marca2, marca3, marca4, marca5].map(
                  (logo, idx) => (
                    <div className={styles.marqueeItem} key={idx}>
                      <img src={logo} alt="" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>

          {/* CÓMO FUNCIONA */}
          <section className={styles.comoFunciona}>
            <h2 className={styles.comoFuncionaTitle}>
              Sin esperas,
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
                          <p className={styles.pasoDescripcion}>
                            {paso.descripcion}
                          </p>
                          <div className={styles.pasoBarra}>
                            <div key={idx} className={styles.pasoBarraFill} />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => irA("tienda")}
                  className={styles.ctaPrimary}
                >
                  Solicita tú cupo
                </button>
              </div>
              <div className={styles.comoFuncionaImgWrap}>
                <img src={imgComoFunciona} alt="Cómo funciona Movinex" />
              </div>
            </div>
          </section>

          {/* POR QUÉ MOVINEX */}
          <section className={styles.porQueMovinex}>
            <h2 className={styles.porQueTitle}>Aprobación en minutos</h2>
            <div className={styles.porQueGrid}>
              <div className={styles.porQueCard}>
                <div className={styles.porQueImgWrap}>
                  <img src={imgPorQue1} alt="Con nosotros si calificas" />
                </div>
                <h3>Con nosotros si calificas</h3>
                <p className={styles.porQueDesc}>
                  Olvídate del papeleo, aquí es sin historial bancario, sin
                  tarjetas, sin aval.
                </p>
              </div>
              <div className={styles.porQueCard}>
                <div className={styles.porQueImgWrap}>
                  <img src={imgPorQue2} alt="Números claros desde el día uno" />
                </div>
                <h3>Números claros desde el día uno</h3>
                <p className={styles.porQueDesc}>
                  Lo que ves es lo que pagas. Sin cobros extra y si te
                  atrasas, no te cobramos de más.
                </p>
              </div>
              <div className={styles.porQueCard}>
                <div className={styles.porQueImgWrap}>
                  <img
                    src={imgPorQue3}
                    alt="Te lo enviamos directo a tu puerta"
                  />
                </div>
                <h3>Te lo enviamos directo a tu puerta</h3>
                <p className={styles.porQueDesc}>
                  Nada de filas ni de perder el tiempo en tiendas físicas. Tú
                  lo pides, nosotros lo enviamos.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===================== MOVINEX ===================== */}
      {page === "movinex" && (
        <section className={styles.aboutSection}>
          <div className={styles.aboutContent}>
            <span className={styles.eyebrow}>SOBRE NOSOTROS</span>
            <h2>Acerca de Movinex</h2>
            <p>
              En Movinex creemos que tener un buen celular no debería depender
              de tener tarjeta de crédito.
            </p>
            <p>
              Somos una empresa mexicana que hace posible que más personas
              estrenen el smartphone que necesitan, con un enganche accesible y
              pagos semanales pensados para su bolsillo. Sin trámites eternos,
              sin checar buró y sin sucursales: todo desde tu hogar, con envío a
              domicilio a todo el país.
            </p>
            <p>
              Todo con reglas claras que entiendes desde el primer momento:
              sabes cuánto pagas de enganche, cuánto por semana y en cuántas
              semanas terminas. Sin letras chiquitas, sin intereses moratorios y
              sin sorpresas.
            </p>
            <p className={styles.aboutHighlight}>
              Nuestra misión es acercar tecnología a quienes el sistema
              tradicional suele dejar fuera, de forma simple, honesta y a su
              ritmo.
            </p>
          </div>
        </section>
      )}

      {/* ===================== TIENDA ===================== */}
      {page === "tienda" && (
        <section className={styles.tienda} style={{ marginTop: "40px" }}>
          <div className={styles.shopHeader}>
            <span className={styles.eyebrow}>CATÁLOGO COMPLETO</span>
            <h2 className={styles.sectionTitle}>Nuestra Tienda</h2>
            <p className={styles.sectionSubtitle}>
              Los mejores celulares con financiamiento a tu medida. Estrena hoy
              mismo con 15% de enganche.
            </p>
          </div>
          <div className={styles.catalogo}>
            {loading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
                    <div className={styles.skeletonImg}></div>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonSubtext}></div>
                    <div className={styles.skeletonButton}></div>
                  </div>
                ))
              : phones.map((phone, idx) => (
                  <div
                    key={phone.id}
                    className={styles.productCard}
                    onClick={() => handleQuickView(phone)}
                  >
                    <div className={styles.imgWrap}>
                      <img src={phone.imagen} alt={phone.modelo} />
                      {idx === 0 && (
                        <div className={styles.engancheBadge}>
                          <span>Enganche</span>
                          <strong>Mínimo</strong>
                        </div>
                      )}
                      <div className={styles.quickViewOverlay}>
                        <span>Vista Rápida</span>
                      </div>
                    </div>
                    <div className={styles.prodInfo}>
                      <span className={styles.brand}>{phone.marca}</span>
                      <h3>{phone.modelo}</h3>
                      <div className={styles.priceInfo}>
                        <div className={styles.semanal}>
                          <span>Desde</span>
                          <strong>${phone.montoSemanal52}/sem</strong>
                        </div>
                        <div className={styles.enganche}>
                          <span>Enganche</span>
                          <strong>${phone.enganche}</strong>
                        </div>
                      </div>
                      <button
                        className={styles.cotizarBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPhone(phone);
                        }}
                      >
                        Cotizar Ahora
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </section>
      )}

      {/* ===================== LEGAL PAGES ===================== */}
      {["privacidad", "terminos", "cookies", "envios"].includes(page) && (
        <LegalContent page={page as any} />
      )}

      {/* QUICK VIEW MODAL */}
      {selectedQuickView && (
        <div className={styles.modalOverlay} onClick={handleCloseQuickView}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={handleCloseQuickView}
              aria-label="Cerrar modal"
            >
              &times;
            </button>
            <div className={styles.modalGrid}>
              <div className={styles.modalLeft}>
                <div className={styles.modalImgWrap}>
                  <img
                    src={selectedQuickView.imagen}
                    alt={selectedQuickView.modelo}
                  />
                </div>
                <div className={styles.modalFinanceCard}>
                  <h3>Financiamiento</h3>
                  <div className={styles.financeRow}>
                    <span>Enganche Inicial (15%):</span>
                    <strong>${selectedQuickView.enganche}</strong>
                  </div>
                  <div className={styles.financeRow}>
                    <span>Pago semanal desde:</span>
                    <strong style={{ color: "#2B6BE4" }}>
                      ${selectedQuickView.montoSemanal52}/sem
                    </strong>
                  </div>
                  <p className={styles.financeNote}>
                    Paga a 26 o 52 semanas sin tarjeta de crédito ni aval.
                    Aprobación express con tu INE.
                  </p>
                </div>
              </div>
              <div className={styles.modalRight}>
                <span className={styles.modalBrand}>
                  {selectedQuickView.marca}
                </span>
                <h2 className={styles.modalTitle}>
                  {selectedQuickView.modelo}
                </h2>
                <div className={styles.priceContainer}>
                  {selectedQuickView.id === "samsung-a07" ? (
                    <>
                      <span className={styles.originalPrice}>$2,999.00</span>
                      <span className={styles.offerPrice}>$2,499.00</span>
                      <span className={styles.discountBadge}>
                        Oferta Especial
                      </span>
                    </>
                  ) : (
                    <span className={styles.offerPrice}>
                      ${selectedQuickView.precioBase.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className={styles.specsContainer}>
                  <h3>Ficha Técnica</h3>
                  <div className={styles.specsTable}>
                    {(() => {
                      const entries: [string, string][] = [
                        ["Pantalla", selectedQuickView.specsPantalla || ''],
                        ["Procesador", selectedQuickView.specsProcesador || ''],
                        ["RAM / Almacenamiento", selectedQuickView.specsRamAlmacenamiento || ''],
                        ["MicroSD", selectedQuickView.specsMicrosd || ''],
                        ["Cámara Trasera", selectedQuickView.specsCamaraTrasera || ''],
                        ["Cámara Frontal", selectedQuickView.specsCamaraFrontal || ''],
                        ["Batería", selectedQuickView.specsBateria || ''],
                        ["Sistema", selectedQuickView.specsSistema || ''],
                        ["Seguridad", selectedQuickView.specsSeguridad || ''],
                        ["Resistencia", selectedQuickView.specsResistencia || ''],
                        ["Conectividad", selectedQuickView.specsConectividad || ''],
                        ["Dimensiones / Peso", selectedQuickView.specsDimensionesPeso || ''],
                      ];
                      return entries.filter(([_, val]) => val).map(([label, value]) => (
                        <div key={label} className={styles.specRow}>
                          <span>{label}</span>
                          <span>{value}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.solicitarBtn}
                    onClick={() => handleProcederCotizar(selectedQuickView)}
                  >
                    Solicitar Crédito Ahora
                  </button>
                  <button
                    className={styles.cancelarBtn}
                    onClick={handleCloseQuickView}
                  >
                    Volver a la tienda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <div className={styles.footerLogoRow}>
              <img src={logoMoviMono} alt="" className={styles.footerLogoMovi} />
              <img src={logoNexMono} alt="" className={styles.footerLogoNex} />
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
              <button
                onClick={() => irA("tienda")}
                className={styles.footerBtnLink}
              >
                Cotiza Aquí
              </button>
              <button
                onClick={() => irA("movinex")}
                className={styles.footerBtnLink}
              >
                Quienes somos
              </button>
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
            <h4>Para tí</h4>
            <div className={styles.footerLinks}>
              <button
                onClick={() => irA("envios")}
                className={styles.footerBtnLink}
              >
                Envío y devoluciones
              </button>
              <button
                onClick={() => irA("terminos")}
                className={styles.footerBtnLink}
              >
                Términos y condiciones
              </button>
              <button
                onClick={() => irA("privacidad")}
                className={styles.footerBtnLink}
              >
                Aviso de privacidad
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footerBottomRow}>
          <p>© 2026 Movinex. Todos los derechos reservados.</p>
        </div>
        <div className={styles.footerPaymentSection}>
          <h4>Aceptamos los siguientes métodos de pago</h4>
          <div className={styles.metodosPagoWix}>
            <div className={styles.paymentLogoWix}>
              <svg
                viewBox="0 0 24 15"
                width="40"
                height="25"
                style={{ borderRadius: "2px" }}
              >
                <rect width="24" height="15" fill="#1A1F71" />
                <text
                  x="50%"
                  y="60%"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="bold"
                  fontStyle="italic"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  VISA
                </text>
              </svg>
            </div>
            <div className={styles.paymentLogoWix}>
              <svg viewBox="0 0 24 15" width="40" height="25">
                <circle cx="8" cy="7.5" r="6" fill="#EB001B" opacity="0.9" />
                <circle cx="16" cy="7.5" r="6" fill="#F79E1B" opacity="0.9" />
                <path
                  d="M12 3.8a6 6 0 0 1 2.2 3.7A6 6 0 0 1 12 11.2a6 6 0 0 1-2.2-3.7A6 6 0 0 1 12 3.8z"
                  fill="#FF5F00"
                />
              </svg>
            </div>
            <div className={styles.paymentLogoWix}>
              <svg
                viewBox="0 0 24 15"
                width="40"
                height="25"
                style={{ borderRadius: "2px" }}
              >
                <rect width="24" height="15" fill="#0070CD" />
                <text
                  x="50%"
                  y="60%"
                  fill="#FFFFFF"
                  fontSize="6.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  AMEX
                </text>
              </svg>
            </div>
            <img src={speiLogo} alt="SPEI" />
            <img
              src={ahorroLogo}
              alt="Farmacias del Ahorro"
              className={styles.ahorroLogoImg}
            />
            <img src={sevenLogo} alt="7 Eleven" />
            <img src={mpLogo} alt="Mercado Pago" />
          </div>
        </div>
      </footer>
    </div>
  );
};
