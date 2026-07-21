import React, { useState, useEffect } from "react";
import styles from "./Landing.module.css";
import type { Phone } from "./types";
import { LegalContent } from "./LegalContent";

// Carousel Banners (imágenes nuevas del usuario)
import banner1 from "./assets/carrusel1.avif";
import banner2 from "./assets/carrusel2.avif";
import banner3 from "./assets/carrusel3.avif";

// Fold assets (imágenes nuevas del usuario)
import imgFoldEnganche from "./assets/los mejores celulares.avif";
import imgFoldDudas from "./assets/tienes dudas.avif";

// Card backgrounds (existing PNGs como fallback para las tarjetas dobles)
import imgCardIne from "./assets/Copia de Degradado horizontal izquierda a derecha 3.png";
import imgCardRitmo from "./assets/Copia de Que se degrade de menos a mas 3.png";

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
  const [page, setPage] = useState<"inicio" | "movinex" | "tienda" | "privacidad" | "terminos" | "cookies" | "envios">("inicio");
  const [selectedQuickView, setSelectedQuickView] = useState<Phone | null>(
    null,
  );
  const [currentSlide, setCurrentSlide] = useState(0);

  // Prevent TS6133 unused prop error while Backoffice is commented
  ((_x: any) => {})(onNavigateAdmin);

  const slides = [
    {
      image: banner1,
      title: "Tu próximo celular, a tu ritmo",
      subtitle:
        "Estrena con solo 15% de enganche y paga por semana. Sin tarjeta, sin buró. Solo tu INE.",
    },
    {
      image: banner2,
      title: "Solo con tu INE",
      subtitle:
        "Te aprobamos con tu pura identificación. Estrena con 15% de enganche. Sin buró, sin tarjeta.",
    },
    {
      image: banner3,
      title: "A tu ritmo",
      subtitle: "Elige pagar en 26 o 52 semanas. Paga por semana.",
    },
  ];

  // Auto-play slides
  useEffect(() => {
    if (page !== "inicio") return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [page, slides.length]);

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
      banner1,
      banner2,
      banner3,
      logoColor,
      imgCardIne,
      imgCardRitmo,
      imgFoldEnganche,
      imgFoldDudas
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
            onClick={() => setPage("inicio")}
            style={{ cursor: "pointer" }}
          />
          <nav className={styles.nav}>
            <button
              onClick={() => setPage("inicio")}
              className={`${styles.navLink} ${page === "inicio" ? styles.navLinkActive : ""}`}
            >
              Inicio
            </button>
            <button
              onClick={() => setPage("movinex")}
              className={`${styles.navLink} ${page === "movinex" ? styles.navLinkActive : ""}`}
            >
              Movinex
            </button>
            <button
              onClick={() => setPage("tienda")}
              className={`${styles.navLink} ${page === "tienda" ? styles.navLinkActive : ""}`}
            >
              Tienda
            </button>
            {showAdminButton && (
              <button onClick={onNavigateAdmin} className={styles.adminBtn}>
                Backoffice
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ===================== INICIO ===================== */}
      {page === "inicio" && (
        <>
          {/* HERO CAROUSEL */}
          <section className={styles.heroCarousel}>
            <div className={styles.slidesContainer}>
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`${styles.slide} ${currentSlide === index ? styles.slideActive : ""}`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={styles.slideBgImage}
                  />
                  <div className={styles.slideContent}>
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <button
                      onClick={() => setPage("tienda")}
                      className={styles.ctaButtonWixSlide}
                    >
                      Cotizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.indicators}>
              {slides.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.indicator} ${currentSlide === index ? styles.indicatorActive : ""}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </section>

          {/* TARJETAS LADO A LADO */}
          <section className={styles.foldDoubleCards}>
            <div className={styles.doubleCardsGrid}>
              <div
                className={styles.sideCard}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(11, 27, 60, 0.92) 0%, rgba(11, 27, 60, 0.5) 60%, rgba(11,27,60,0.2) 100%), url(${imgCardIne})`,
                }}
              >
                <div className={styles.sideCardContent}>
                  <span className={styles.eyebrow}>Solo con tu INE</span>
                  <h2>Sin buró, sin tarjeta</h2>
                  <p>
                    Te aprobamos con tu pura identificación. Estrena con 15% de
                    enganche.
                  </p>
                  <button
                    onClick={() => setPage("tienda")}
                    className={styles.ctaButtonSide}
                  >
                    Cotizar
                  </button>
                </div>
              </div>
              <div
                className={styles.sideCard}
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(11, 27, 60, 0.92) 0%, rgba(11, 27, 60, 0.5) 60%, rgba(11,27,60,0.2) 100%), url(${imgCardRitmo})`,
                }}
              >
                <div className={styles.sideCardContent}>
                  <span className={styles.eyebrow}>A tu ritmo</span>
                  <h2>Paga por semana</h2>
                  <p>Elige pagar en 26 o 52 semanas.</p>
                  <button
                    onClick={() => setPage("tienda")}
                    className={styles.ctaButtonSide}
                  >
                    Cotizar
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* BADGES DE SERVICIO */}
          <section className={styles.foldBadgesSection}>
            <div className={styles.badgesHorizontalRow}>
              <div className={styles.badgeCol}>
                <div className={styles.badgeIconBox}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    width="28"
                    height="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5" rx="1"></rect>
                    <polyline points="10 12 12 14 16 10"></polyline>
                  </svg>
                </div>
                <div className={styles.badgeTextContent}>
                  <h4>Envío a todo México</h4>
                  <p>Te lo mandamos a domicilio, de 2 a 5 días hábiles.</p>
                </div>
              </div>
              <div
                className={styles.badgeCol}
                style={{ justifyContent: "flex-end" }}
              >
                <div
                  className={styles.badgeTextContent}
                  style={{ textAlign: "right" }}
                >
                  <h4>Págalo a tu ritmo</h4>
                  <p>Pagos chiquitos cada semana.</p>
                </div>
                <div
                  className={styles.badgeIconBox}
                  style={{ marginLeft: "16px" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    width="28"
                    height="28"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* ENGANCHE MÍNIMO + MARCAS */}
          <section className={styles.foldEngancheMedida}>
            <div className={styles.medidaGrid}>
              <div className={styles.medidaLeft}>
                <div className={styles.stackedPhonesContainer}>
                  <img
                    src={imgFoldEnganche}
                    alt="Los mejores celulares"
                    className={styles.stackedImg}
                  />
                  <div className={styles.engancheBadgeCircle}>
                    <span>Enganche</span>
                    <strong>mínimo</strong>
                  </div>
                </div>
              </div>
              <div className={styles.medidaRight}>
                <h2>Los mejores celulares con financiamiento a tu medida</h2>
                <p>
                  Marcas de calidad que cambiaran tu vida, sin complicaciones y
                  con pagos accesibles.
                </p>
                <small className={styles.medidaTcs}>
                  Aplican los términos y condiciones
                </small>
              </div>
            </div>
            <div className={styles.marcasGridSection}>
              <h3 className={styles.marcasSectionTitle}>Marcas</h3>
              <div className={styles.marcasGrid}>
                <div className={styles.marcaItem}>
                  <img src={marca1} alt="Samsung" />
                </div>
                <div className={styles.marcaItem}>
                  <img src={marca2} alt="Xiaomi" />
                </div>
                <div className={styles.marcaItem}>
                  <img src={marca3} alt="Honor" />
                </div>
                <div className={styles.marcaItem}>
                  <img src={marca4} alt="Motorola" />
                </div>
                <div className={styles.marcaItem}>
                  <img src={marca5} alt="Realme" />
                </div>
              </div>
            </div>
          </section>

          {/* ¿TIENES DUDAS? */}
          <section className={styles.foldDudasWix}>
            <div className={styles.dudasWixGrid}>
              <div className={styles.dudasBlueCard}>
                <h2>¿Tienes dudas?</h2>
                <p>
                  Escríbenos por WhatsApp y con gusto te explicamos cómo
                  funciona, los plazos y cómo estrenar de inmediato.
                </p>
                <a
                  href="https://wa.me/525555028744?text=Hola%20Movinex,%20quiero%20comprar%20un%20celular"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappWixBtn}
                >
                  Whatsapp
                </a>
              </div>
              <div className={styles.dudasImgCol}>
                <img
                  src={imgFoldDudas}
                  alt="Tienes dudas"
                  className={styles.handImg}
                />
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
            <div className={styles.socialsWix}>
              <a href="#" className={styles.socialIconLink}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a href="#" className={styles.socialIconLink}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4>Tienda</h4>
            <div className={styles.footerLinks}>
              <button
                onClick={() => setPage("inicio")}
                className={styles.footerBtnLink}
              >
                Inicio
              </button>
              <button
                onClick={() => setPage("movinex")}
                className={styles.footerBtnLink}
              >
                Movinex
              </button>
              <button
                onClick={() => setPage("tienda")}
                className={styles.footerBtnLink}
              >
                Tienda
              </button>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4>Atención al cliente</h4>
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
            <h4>Política</h4>
            <div className={styles.footerLinks}>
              <button
                onClick={() => setPage("envios")}
                className={styles.footerBtnLink}
              >
                Envío y devoluciones
              </button>
              <button
                onClick={() => setPage("terminos")}
                className={styles.footerBtnLink}
              >
                Términos y condiciones
              </button>
              <button
                onClick={() => setPage("privacidad")}
                className={styles.footerBtnLink}
              >
                Aviso de Privacidad
              </button>
              <button
                onClick={() => setPage("cookies")}
                className={styles.footerBtnLink}
              >
                Política de Cookies
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footerPaymentSection}>
          <h4>Aceptamos los siguientes métodos de pago</h4>
          <div className={styles.metodosPagoWix}>
            <div className={styles.paymentLogoWix}>
              <svg viewBox="0 0 24 15" width="40" height="25">
                <path
                  d="M10.155 1.026L7.744 12.064h2.247l2.411-11.038zM18.665 1.026l-1.748 7.828-.75-3.957c-.443-1.503-1.802-3.136-3.376-3.871h.063l3.076 11.038h2.381l3.541-11.038zM2.87 1.026C1.229 2.052.483 3.328.483 4.887c0 2.213 2.508 2.656 2.508 3.738 0 .426-.452.802-1.424.802-.924 0-1.722-.38-2.312-.662l-.427 1.968c.613.279 1.636.533 2.7.533 2.378 0 3.916-1.127 3.916-2.873 0-2.353-2.516-2.73-2.516-3.882 0-.352.368-.69 1.258-.69.761 0 1.488.243 1.936.438l.424-1.954C6.182 1.979 5.097 1.706 2.87 1.026M13.626 1.026c-.52 0-.964.298-1.168.784L8.98 12.064h2.359l.47-1.295h2.884l.272 1.295h2.079zM12.441 8.94l1.171-3.218.675 3.218z"
                  fill="#1A1F71"
                />
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
