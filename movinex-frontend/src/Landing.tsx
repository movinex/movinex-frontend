import React, { useState, useEffect } from "react";
import styles from "./Landing.module.css";
import type { Phone } from "./types";

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
}

interface Specs {
  pantalla: string;
  procesador: string;
  ramAlmacenamiento: string;
  microSD: string;
  camaraTrasera: string;
  camaraFrontal: string;
  bateria: string;
  sistema: string;
  seguridad: string;
  resistencia: string;
  conectividad: string;
  dimensionesPeso: string;
}

const phoneSpecs: Record<string, Specs> = {
  "samsung-a07": {
    pantalla: '6.7" LCD HD+ (1600×720), 90 Hz',
    procesador: "MediaTek Helio G99 (octa-core)",
    ramAlmacenamiento: "4 GB RAM / 64 GB Almacenamiento",
    microSD: "Sí, hasta 1 TB",
    camaraTrasera: "50 MP principal + 2 MP profundidad",
    camaraFrontal: "8 MP",
    bateria: "5000 mAh · carga rápida 25 W",
    sistema: "Android 15 · One UI 7",
    seguridad: "Huella lateral + reconocimiento facial",
    resistencia: "IP54 (polvo y salpicaduras)",
    conectividad: "4G LTE · Wi-Fi · NFC: No",
    dimensionesPeso: "167.4 × 77.4 × 7.6 mm · 184 g",
  },
  "samsung-s24": {
    pantalla: '6.8" Dynamic AMOLED 2X QHD+ (3120×1440), 120 Hz, Gorilla Armor',
    procesador: "Snapdragon 8 Gen 3 for Galaxy (octa-core)",
    ramAlmacenamiento: "12 GB RAM / 256 GB Almacenamiento",
    microSD: "No",
    camaraTrasera: "200 MP + 50 MP + 12 MP + 10 MP con zoom óptico 100x",
    camaraFrontal: "12 MP",
    bateria: "5000 mAh · carga rápida 45 W",
    sistema: "Android 14 · One UI 6.1 (con Galaxy AI)",
    seguridad:
      "Lector de huella ultrasónico en pantalla + reconocimiento facial",
    resistencia: "IP68 (sumergible hasta 1.5m por 30 min)",
    conectividad: "5G · Wi-Fi 7 · Bluetooth 5.3 · NFC",
    dimensionesPeso: "162.3 × 79.0 × 8.6 mm · 232 g",
  },
  "iphone-15pro": {
    pantalla:
      '6.7" Super Retina XDR OLED (2796×1290), 120 Hz ProMotion, Always-On',
    procesador: "A17 Pro (hexa-core con GPU de 6 núcleos)",
    ramAlmacenamiento: "8 GB RAM / 256 GB Almacenamiento",
    microSD: "No",
    camaraTrasera:
      "48 MP principal + 12 MP ultra gran angular + 12 MP teleobjetivo 5x",
    camaraFrontal: "12 MP TrueDepth",
    bateria: "4441 mAh · carga rápida 20 W (MagSafe 15 W)",
    sistema: "iOS 17 (actualizable a iOS 18 con Apple Intelligence)",
    seguridad: "Face ID (reconocimiento facial 3D)",
    resistencia: "IP68 (sumergible hasta 6m por 30 min)",
    conectividad: "5G · Wi-Fi 6E · Bluetooth 5.3 · NFC · USB-C 3.0",
    dimensionesPeso: "159.9 × 76.7 × 8.25 mm · 221 g",
  },
  "xiaomi-redmi13": {
    pantalla:
      '6.67" AMOLED CrystalRes FHD+ (2712×1220), 120 Hz, Gorilla Glass Victus',
    procesador: "MediaTek Helio G99-Ultra (octa-core)",
    ramAlmacenamiento: "8 GB RAM / 256 GB Almacenamiento",
    microSD: "Sí, hasta 1 TB",
    camaraTrasera: "200 MP principal + 8 MP ultra gran angular + 2 MP macro",
    camaraFrontal: "16 MP",
    bateria: "5000 mAh · carga turbo 67 W",
    sistema: "Android 13 con MIUI 14 (actualizable a HyperOS)",
    seguridad: "Lector de huella en pantalla + reconocimiento facial",
    resistencia: "IP54 (resistencia a salpicaduras)",
    conectividad: "4G LTE · Wi-Fi · Bluetooth 5.2 · NFC",
    dimensionesPeso: "161.1 × 74.2 × 7.98 mm · 187 g",
  },
};

export const Landing: React.FC<LandingProps> = ({
  onSelectPhone,
  onNavigateAdmin,
}) => {
  const [page, setPage] = useState<"inicio" | "movinex" | "tienda">("inicio");
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

  // Cargar catálogo de celulares desde el backend
  useEffect(() => {
    if (page === "tienda") {
      setLoading(true);
      fetch("https://movinex-backend-production.up.railway.app/api/celulares")
        .then((res) => res.json())
        .then((data) => {
          // Mapear campos de base de datos snake_case a camelCase si es necesario
          const celularesMapeados = data.map((p: any) => ({
            id: p.id,
            modelo: p.modelo,
            marca: p.marca,
            precioBase: p.precio_base,
            enganche: p.enganche,
            montoSemanal26: p.monto_semanal_26,
            montoSemanal52: p.monto_semanal_52,
            totalPagar26: p.total_pagar_26,
            totalPagar52: p.total_pagar_52,
            ahorro26: p.ahorro_26,
            imagen: p.imagen,
          }));
          setPhones(celularesMapeados);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error al cargar catálogo de celulares:", err);
          // Fallback en caso de error
          setPhones([
            {
              id: "samsung-a07",
              modelo: "SAMSUNG A07",
              marca: "Samsung",
              precioBase: 2999,
              enganche: 375,
              montoSemanal26: 167,
              montoSemanal52: 119,
              totalPagar26: 4342,
              totalPagar52: 6188,
              ahorro26: 250,
              imagen:
                "https://chjkpezpqwqdsiulwrdf.supabase.co/storage/v1/object/public/celulares/samsung_a07.webp",
            },
            {
              id: "samsung-s24",
              modelo: "Samsung Galaxy S24 Ultra",
              marca: "Samsung",
              precioBase: 12999,
              enganche: 2999,
              montoSemanal26: 425,
              montoSemanal52: 235,
              totalPagar26: 11050,
              totalPagar52: 12220,
              ahorro26: 1200,
              imagen:
                "https://chjkpezpqwqdsiulwrdf.supabase.co/storage/v1/object/public/celulares/samsung_s24.webp",
            },
            {
              id: "iphone-15pro",
              modelo: "iPhone 15 Pro Max",
              marca: "Apple",
              precioBase: 15999,
              enganche: 3699,
              montoSemanal26: 520,
              montoSemanal52: 285,
              totalPagar26: 13520,
              totalPagar52: 14820,
              ahorro26: 1500,
              imagen:
                "https://chjkpezpqwqdsiulwrdf.supabase.co/storage/v1/object/public/celulares/iphone15_pro.webp",
            },
            {
              id: "xiaomi-redmi13",
              modelo: "Xiaomi Redmi Note 13 Pro",
              marca: "Xiaomi",
              precioBase: 5999,
              enganche: 1399,
              montoSemanal26: 195,
              montoSemanal52: 110,
              totalPagar26: 5070,
              totalPagar52: 5720,
              ahorro26: 600,
              imagen:
                "https://chjkpezpqwqdsiulwrdf.supabase.co/storage/v1/object/public/celulares/xiaomi_redmi.webp",
            },
          ]);
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

  return (
    <div className={styles.container}>
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
            <button onClick={onNavigateAdmin} className={styles.adminBtn}>
              Backoffice
            </button>
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
                      const specs = phoneSpecs[selectedQuickView.id];
                      if (!specs) return null;
                      const entries: [string, string][] = [
                        ["Pantalla", specs.pantalla],
                        ["Procesador", specs.procesador],
                        ["RAM / Almacenamiento", specs.ramAlmacenamiento],
                        ["MicroSD", specs.microSD],
                        ["Cámara Trasera", specs.camaraTrasera],
                        ["Cámara Frontal", specs.camaraFrontal],
                        ["Batería", specs.bateria],
                        ["Sistema", specs.sistema],
                        ["Seguridad", specs.seguridad],
                        ["Resistencia", specs.resistencia],
                        ["Conectividad", specs.conectividad],
                        ["Dimensiones / Peso", specs.dimensionesPeso],
                      ];
                      return entries.map(([label, value]) => (
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
              <a href="#" className={styles.socialIconLink}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.525.02c1.31-.03 2.625-.01 3.935-.002.08.73.53 1.34 1.18 1.7 1.05.6 2.25.72 3.42.74v3.52c-.8-.01-1.61-.16-2.39-.37a4.9 4.9 0 01-2.21-1.34v7.7c-.02 2.11-.93 4.14-2.58 5.43a6.83 6.83 0 01-7.85.62A6.87 6.87 0 013.1 12.7c.07-2.92 2.14-5.59 5.04-6.07a6.9 6.9 0 016.14 2.13c.01-.84.004-1.68.006-2.52C12.18 5.6 10 5.03 8.35 6.07c-2.35 1.5-3.3 4.67-2.18 7.23a6.85 6.85 0 007.82 4.1c1.86-.54 3.16-2.3 3.16-4.24V.02z" />
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
              <button
                onClick={() => setPage("movinex")}
                className={styles.footerBtnLink}
              >
                Acerca de
              </button>
            </div>
          </div>
          <div className={styles.footerColumn}>
            <h4>Política</h4>
            <div className={styles.footerLinks}>
              <a href="#">Envío y devoluciones</a>
              <a href="#">Términos y condiciones</a>
              <a href="#">FAQ</a>
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
