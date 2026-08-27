import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import styles from "./Landing.module.css";
import type { Phone } from "./types";
import { LegalContent } from "./LegalContent";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { FiMenu, FiX } from "react-icons/fi";
import { PiCookieBold } from "react-icons/pi";

const LANDING_SUBPAGES = ["movinex", "tienda", "privacidad", "terminos", "cookies", "envios"] as const;
type LandingPage = "inicio" | (typeof LANDING_SUBPAGES)[number];

// Preguntas frecuentes de la portada: contenido visible (no palabras escondidas) que de
// paso captura las búsquedas largas — "¿checan buró?", "¿qué necesito?", etc. — que el
// título y la descripción no alcanzan a cubrir. Alimenta el <section> de abajo y su
// FAQPage JSON-LD, para que Google pueda mostrarlas como resultado enriquecido.
const FAQ_INICIO: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: "¿Necesito tener buen historial crediticio para calificar?",
    respuesta:
      "No. En Movinex no consultamos tu historial en buró de crédito. Solo necesitamos tu INE vigente y un número de WhatsApp para darte una respuesta en minutos.",
  },
  {
    pregunta: "¿Qué necesito para poder pedir mi celular?",
    respuesta:
      "Solo tu INE vigente, un WhatsApp donde te podamos contactar y el enganche del equipo que elijas (generalmente el 15% del precio). Todo el trámite se hace desde tu celular, sin ir a ninguna sucursal.",
  },
  {
    pregunta: "¿Cuánto tengo que dar de enganche?",
    respuesta:
      "El enganche depende del equipo, pero en la mayoría de los casos es el 15% del precio del celular. Lo ves reflejado antes de confirmar tu pedido, sin sorpresas.",
  },
  {
    pregunta: "¿Cada cuánto pago y por cuánto tiempo?",
    respuesta:
      "Pagas cuotas semanales fijas durante el plazo que elijas: 26 o 52 semanas. El monto de cada pago no cambia durante todo el plazo, así sabes exactamente cuánto vas a pagar cada semana.",
  },
  {
    pregunta: "¿Hay algún cobro extra?",
    respuesta:
      "No. Lo que ves al cotizar es lo que pagas: enganche más tu cuota semanal. No cobramos comisiones ocultas ni intereses moratorios extra si te atrasas.",
  },
  {
    pregunta: "¿Qué pasa si no puedo pagar una semana?",
    respuesta:
      "Te avisamos por WhatsApp antes de cada cobro y también si se nos complica cobrarte. No cobramos intereses moratorios extra por un atraso, pero si se acumula podemos suspender el servicio del equipo hasta que te pongas al corriente.",
  },
  {
    pregunta: "¿Los celulares son nuevos?",
    respuesta:
      "Sí, todos nuestros equipos son nuevos, sellados de fábrica y con garantía del fabricante.",
  },
  {
    pregunta: "¿En cuánto tiempo me llega el celular después de pedirlo?",
    respuesta:
      "En cuanto confirmamos tu identidad y tu pago inicial, preparamos tu equipo para envío. La mayoría de los pedidos llega en un plazo de 2 a 5 días hábiles, dependiendo de tu ubicación.",
  },
  {
    pregunta: "¿Envían a cualquier parte de México?",
    respuesta:
      "Sí, enviamos a domicilio a todo el país, en la mayoría de los casos sin costo de envío.",
  },
  {
    pregunta: "¿Es seguro dar mis datos?",
    respuesta:
      "Sí. Tus datos se manejan bajo nuestro Aviso de Privacidad, con cifrado en tránsito y en reposo, y solo se usan para verificar tu identidad y darte seguimiento a tu crédito. Nunca los compartimos con fines distintos a los autorizados por ti.",
  },
  {
    pregunta:
      "¿Los celulares vienen liberados para usarlos con cualquier compañía?",
    respuesta:
      "Sí, los equipos vienen liberados de fábrica y funcionan con la SIM de cualquier compañía telefónica en México.",
  },
];

// Título y descripción únicos por página: evita que Google indexe todas las
// rutas con el mismo <title>/<meta description> (los estáticos de index.html).
const PAGE_META: Record<LandingPage, { title: string; description: string }> = {
  inicio: {
    title: "Movinex | Celulares a Crédito Semanal Sin Buró, Sin Aval Ni Tarjeta",
    description:
      "Estrena celular en México a pagos semanales chiquitos, sin checar buró de crédito, sin tarjeta y sin aval. Olvídate de las mensualidades: con tu INE y WhatsApp, aprobación en minutos y envío a domicilio a todo el país.",
  },
  tienda: {
    title: "Catálogo de Celulares Nuevos a Crédito Sin Buró | Movinex",
    description:
      "Elige tu celular nuevo y llévatelo hoy con solo el 15% de enganche, pagando semana a semana con pagos chiquitos. iPhone, Samsung y más a crédito sin checar buró, sin tarjeta y solo con tu INE.",
  },
  movinex: {
    title: "Quiénes Somos | Movinex",
    description:
      "Conoce Movinex, la plataforma mexicana que te permite estrenar celular pagando semanalmente, sin buró de crédito, sin tarjeta y sin aval.",
  },
  terminos: {
    title: "Términos y Condiciones | Movinex",
    description: "Consulta los términos y condiciones de venta a crédito de Movinex.",
  },
  privacidad: {
    title: "Aviso de Privacidad | Movinex",
    description: "Aviso de privacidad integral de NVX Technologies (Movinex) sobre el tratamiento de tus datos personales.",
  },
  cookies: {
    title: "Política de Cookies | Movinex",
    description: "Cómo Movinex utiliza cookies y tecnologías similares, y cómo configurar tus preferencias.",
  },
  envios: {
    title: "Política de Envíos, Garantías y Devoluciones | Movinex",
    description: "Condiciones de envío, entrega, garantía, reposición y devoluciones de los equipos de Movinex.",
  },
};

// Hero (video en loop, entregado por la diseñadora — actualizado con el
// diseño "Pagina Inicial" de Figma, nodo 708:9046, agosto 2026)
import heroVideo from "./assets/hero-video.mp4";

// "Cómo funciona" — una imagen distinta por cada paso del carrusel (así lo
// marca la anotación de desarrollo de Figma: "La imagen a la derecha cambia
// dependiendo del elemento activo"), con su versión para el frame móvil.
import imgPasoElQueTuElijas from "./assets/carrusel-el-que-tu-elijas.webp";
import imgPasoElQueTuElijasMovil from "./assets/carrusel-el-que-tu-elijas-movil.webp";
import imgPasoSinFilas from "./assets/carrusel-sin-filas.webp";
import imgPasoSinFilasMovil from "./assets/carrusel-sin-filas-movil.webp";
import imgPasoPagaCadaSemana from "./assets/carrusel-paga-cada-semana.webp";
import imgPasoPagaCadaSemanaMovil from "./assets/carrusel-paga-cada-semana-movil.webp";
import imgPasoDondeTuElijas from "./assets/carrusel-donde-tu-elijas.webp";
import imgPasoDondeTuElijasMovil from "./assets/carrusel-donde-tu-elijas-movil.webp";

// "Por qué Movinex" — imágenes de las 3 tarjetas (Figma)
import imgPorQue1 from "./assets/figma-card1.webp";
import imgPorQue2 from "./assets/figma-card2.webp";
import imgPorQue3 from "./assets/figma-card3.webp";

// Logo en monocromo, para el footer sobre fondo azul marino (Figma)
import logoMoviMono from "./assets/logo-movi-mono.svg";
import logoNexMono from "./assets/logo-nex-mono.svg";

// Logos de marcas para la banda "Las marcas que ya conoces" (versión mono
// blanca, exportada de Figma — reemplazan los logos a color anteriores)
import logoSamsung from "./assets/figma-logo-samsung.svg";
import logoXiaomi from "./assets/figma-logo-xiaomi.svg";
import logoHonor from "./assets/figma-logo-honor.svg";
import logoMotorola from "./assets/figma-logo-motorola.svg";
import logoMarca5 from "./assets/figma-logo-5.svg";

// Payment methods
import logoColor from "./assets/movinex_color.webp";

// "Quienes Somos" — foto del hero (desktop + móvil, distintas) y la foto ya
// recortada/enmascarada de "Cómo funciona Movinex" (viene con transparencia
// directo de Figma, no hace falta aplicarle una máscara en CSS)
import imgQsHero from "./assets/quienes-hero.webp";
import imgQsHeroMovil from "./assets/quienes-hero-movil.webp";
import imgQsComoFunciona from "./assets/quienes-como-funciona.webp";

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
  const ultimoCelular = phones[0];

  // Smooth scroll to top when page changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, [page]);

  // Cargar catálogo de celulares desde el backend. También se pide en
  // "inicio" y "movinex", porque el banner "Último Celular" (compartido por
  // ambas páginas) muestra el primero del catálogo (el backend ya lo
  // devuelve ordenado por updated_at desc).
  useEffect(() => {
    if (page === "tienda" || page === "inicio" || page === "movinex") {
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
            precioDescuento: p.precio_descuento != null ? Number(p.precio_descuento) : undefined,
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
      imgPasoSinFilas,
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

  // Banner "Último Celular" y Preguntas Frecuentes son idénticos en Inicio y
  // Quienes Somos (mismo diseño, mismo contenido) — se arman una sola vez acá
  // para no duplicar el JSX (y el JSON-LD) en las dos páginas.
  const bannerPromoSection = ultimoCelular && (
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
            <Link
              to={`/cotizar/${ultimoCelular.id}`}
              className={styles.bannerPromoBtn}
            >
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

  const faqSection = (
    <>
      <section className={styles.faq}>
        <div className={styles.faqBlob1} aria-hidden="true" />
        <div className={styles.faqBlob2} aria-hidden="true" />
        <h2 className={styles.faqTitle}>Preguntas frecuentes</h2>
        <div className={styles.faqCard}>
          {FAQ_INICIO.map((item) => (
            <details className={styles.faqItem} key={item.pregunta}>
              <summary className={styles.faqPregunta}>
                <span>{item.pregunta}</span>
              </summary>
              <p className={styles.faqRespuesta}>{item.respuesta}</p>
            </details>
          ))}
        </div>
        <div className={styles.faqCta}>
          <p>¿Necesitas Asesoría?</p>
          <a
            href="https://wa.me/525555028744?text=Hola%20Movinex,%20tengo%20una%20duda"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp size={18} />
            Habla con nosotros
          </a>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_INICIO.map((item) => ({
              "@type": "Question",
              name: item.pregunta,
              acceptedAnswer: { "@type": "Answer", text: item.respuesta },
            })),
          }),
        }}
      />
    </>
  );

  const canonicalPath = page === "inicio" ? "" : page;

  return (
    <div className={styles.container}>
      <title>{PAGE_META[page].title}</title>
      <meta name="description" content={PAGE_META[page].description} />
      <link rel="canonical" href={`https://www.movinex.mx/${canonicalPath}`} />

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
                  <img
                    src={imgPorQue3}
                    alt="Te lo enviamos directo a tu puerta"
                  />
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

          {bannerPromoSection}
          {faqSection}
        </>
      )}

      {/* ===================== MOVINEX (Quienes Somos) ===================== */}
      {page === "movinex" && (
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
                  Llevamos tecnología a las manos de todos los{" "}
                  <span>mexicanos</span>
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
            <img
              src={imgQsComoFunciona}
              alt=""
              aria-hidden="true"
              className={styles.qsComoFuncionaPhoto}
            />
            <div className={styles.qsComoFuncionaInner}>
              <div className={styles.qsComoFuncionaHead}>
                <h2>
                  Como funciona <span>Movinex</span>
                </h2>
                <p>Estas a tan solo 4 pasos de tener tu nuevo celular</p>
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

          {bannerPromoSection}
          {faqSection}
        </>
      )}

      {/* ===================== TIENDA ===================== */}
      {page === "tienda" && (
        <section className={styles.tienda} style={{ marginTop: "40px" }}>
          <div className={styles.shopHeader}>
            <span className={styles.eyebrow}>CATÁLOGO COMPLETO</span>
            <h1 className={styles.sectionTitle}>Nuestra Tienda</h1>
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
                      {/* <Link> y no <button>: renderiza un <a href> real, que es la
                          única forma de que Google descubra las páginas de cada
                          celular (antes eran huérfanas). La navegación sigue siendo
                          del lado del cliente, y /cotizar/:id ya sabe reconstruir el
                          teléfono desde la URL, así que no hace falta onSelectPhone. */}
                      <Link
                        to={`/cotizar/${phone.id}`}
                        className={styles.cotizarBtn}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Cotizar Ahora
                      </Link>
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
                  {selectedQuickView.precioDescuento ? (
                    <>
                      <span className={styles.originalPrice}>
                        ${selectedQuickView.precioBase.toLocaleString()}
                      </span>
                      <span className={styles.offerPrice}>
                        ${selectedQuickView.precioDescuento.toLocaleString()}
                      </span>
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
    </div>
  );
};
