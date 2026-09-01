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
      "Solo tu número de WhatsApp y tu INE vigente. Nada de comprobantes de ingresos, ni cartas laborales o papeleo extra.",
  },
  {
    pregunta: "¿Cuánto tengo que dar de enganche?",
    respuesta:
      "El enganche es el 15% del valor del celular que elijas. Es el único pago que necesitas para asegurar tu equipo.",
  },
  {
    pregunta: "¿Cada cuánto pago y por cuánto tiempo?",
    respuesta:
      "Pagas cada semana, y tú eliges si prefieres terminar en 26 o 52 semanas. Desde el primer momento sabes exactamente cuánto vas a pagar cada semana y cuándo terminas.",
  },
  {
    pregunta: "¿Hay algún cobro extra?",
    respuesta:
      "No. Lo que ves al elegir tu plan es lo que pagas, sin sorpresas ni cargos adicionales.",
  },
  {
    pregunta: "¿Qué pasa si no puedo pagar una semana?",
    respuesta:
      "Te avisamos por WhatsApp antes de cada cobro y también si se nos complica cobrarte. No cobramos intereses moratorios extra por un atraso, pero si se acumula podemos suspender el servicio del equipo hasta que te pongas al corriente.",
  },
  {
    pregunta: "¿Los celulares son nuevos?",
    respuesta: "Sí, todos nuestros celulares son nuevos y están sellados.",
  },
  {
    pregunta: "¿En cuánto tiempo me llega el celular después de pedirlo?",
    respuesta:
      "Después de realizar el pago de tu enganche te enviaremos tu número de guía. Tu celular puede llegar de 3 a 5 días hábiles.",
  },
  {
    pregunta: "¿Envían a cualquier parte de México?",
    respuesta: "Sí, hacemos envío a domicilio a todo el país.",
  },
  {
    pregunta: "¿Es seguro dar mis datos?",
    respuesta:
      "Sí es seguro, tus datos estarán encriptados de extremo a extremo.",
  },
  {
    pregunta:
      "¿Los celulares vienen liberados para usarlos con cualquier compañía?",
    respuesta:
      "Sí. Todos los equipos que financiamos vienen liberados de fábrica, por lo que puedes usarlos con la compañía telefónica de tu preferencia (Telcel, AT&T, Movistar, etc.).",
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

// Logo blanco combinado (Movi+nex en un solo SVG), para el footer sobre fondo azul
// marino — exportado de Figma (assets diseño/logo.svg), reemplaza los dos SVG mono sueltos.
import logoFooter from "./assets/figma-logo-footer.svg";

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

// Catálogo (Tienda) — las 3 tarjetas de cada celular, recompuestas 1:1 desde el
// Figma: se tomó el celular recortado con transparencia de los frames de
// variantes (grupos "imagenes <celular>", nodos 708:9401/9408/9415/9422 y
// 773:6037..6059) y se lo colocó sobre su degradado en la posición y tamaño
// exactos que indica el diseño para cada vista. Ya vienen en el orden del
// carrusel: la combo va en el MEDIO.
// Tarjeta de la Tienda: ya con el gradiente pegado, tal cual las exportó la
// diseñadora (carpetas "assets diseño/<celular>/t{l,f,a}.png").
import catE151 from "./assets/cat-e15-1.webp";
import catE152 from "./assets/cat-e15-2.webp";
import catE153 from "./assets/cat-e15-3.webp";
import catA171 from "./assets/cat-a17-1.webp";
import catA172 from "./assets/cat-a17-2.webp";
import catA173 from "./assets/cat-a17-3.webp";
import catTabA111 from "./assets/cat-taba11-1.webp";
import catTabA112 from "./assets/cat-taba11-2.webp";
import catTabA113 from "./assets/cat-taba11-3.webp";
import catG351 from "./assets/cat-g35-1.webp";
import catG352 from "./assets/cat-g35-2.webp";
import catG353 from "./assets/cat-g35-3.webp";
import catG061 from "./assets/cat-g06-1.webp";
import catG062 from "./assets/cat-g06-2.webp";
import catG063 from "./assets/cat-g06-3.webp";
import catG151 from "./assets/cat-g15-1.webp";
import catG152 from "./assets/cat-g15-2.webp";
import catG153 from "./assets/cat-g15-3.webp";
import catA071 from "./assets/cat-a07-1.webp";
import catA072 from "./assets/cat-a07-2.webp";
import catA073 from "./assets/cat-a07-3.webp";
import catHonor1 from "./assets/cat-honor-1.webp";
import catHonor2 from "./assets/cat-honor-2.webp";
import catHonor3 from "./assets/cat-honor-3.webp";

// Pop-up de Detalles: el celular SOLO, transparente, alta resolución
// (carpetas "assets diseño/<celular>/d{l,f,a}.png") — el gradiente de fondo
// lo pone CATALOGO_FONDOS por CSS.
import popG061 from "./assets/pop-g06-1.webp";
import popG062 from "./assets/pop-g06-2.webp";
import popG063 from "./assets/pop-g06-3.webp";
import popG151 from "./assets/pop-g15-1.webp";
import popG152 from "./assets/pop-g15-2.webp";
import popG153 from "./assets/pop-g15-3.webp";
import popE151 from "./assets/pop-e15-1.webp";
import popE152 from "./assets/pop-e15-2.webp";
import popE153 from "./assets/pop-e15-3.webp";
import popHonor1 from "./assets/pop-honor-1.webp";
import popHonor2 from "./assets/pop-honor-2.webp";
import popHonor3 from "./assets/pop-honor-3.webp";
import popA071 from "./assets/pop-a07-1.webp";
import popA072 from "./assets/pop-a07-2.webp";
import popA073 from "./assets/pop-a07-3.webp";
import popG351 from "./assets/pop-g35-1.webp";
import popG352 from "./assets/pop-g35-2.webp";
import popG353 from "./assets/pop-g35-3.webp";
import popA171 from "./assets/pop-a17-1.webp";
import popA172 from "./assets/pop-a17-2.webp";
import popA173 from "./assets/pop-a17-3.webp";
import popTabA111 from "./assets/pop-taba11-1.webp";
import popTabA112 from "./assets/pop-taba11-2.webp";
import popTabA113 from "./assets/pop-taba11-3.webp";

// Las 3 vistas de cada celular, ya en el orden del carrusel: la combo (la foto
// "hero", mitad cámara / mitad pantalla) va en el PUNTO DEL MEDIO.
// Fallback local: `phone.imagenes` (cargado desde el sadmin) tiene prioridad.
const CATALOGO_FOTOS: Record<string, string[]> = {
  Motorolag06: [catG061, catG062, catG063],
  Motorolag15: [catG151, catG152, catG153],
  "samsung-a07": [catA071, catA072, catA073],
  "HONOR Play10": [catHonor1, catHonor2, catHonor3],
  "Motorola g35": [catG351, catG352, catG353],
  samsunga17: [catA171, catA172, catA173],
  "Samsung A11 tab": [catTabA111, catTabA112, catTabA113],
  "Motorola E15": [catE151, catE152, catE153],
};

// Degradado de fondo de cada celular, copiado exacto del Figma (nodos 708:9060,
// 708:9076, 708:9091, 708:9107, 773:6218, 773:6221, 773:6280, 773:6283).
const CATALOGO_FONDOS: Record<string, string> = {
  Motorolag06:
    "linear-gradient(230.54deg, rgb(17, 153, 175) 33.766%, rgb(28, 117, 131) 97.531%)",
  Motorolag15:
    "linear-gradient(155.51deg, rgb(20, 31, 85) 19.875%, rgb(52, 72, 200) 72.663%)",
  "samsung-a07":
    "linear-gradient(184.46deg, rgb(86, 64, 250) 29.83%, rgb(11, 27, 58) 95.031%)",
  "HONOR Play10":
    "linear-gradient(178.97deg, rgb(0, 166, 112) 21.064%, rgb(28, 117, 131) 98.128%)",
  "Motorola g35":
    "linear-gradient(236deg, rgb(243, 84, 77) 31.247%, rgb(82, 16, 15) 96.113%)",
  samsunga17:
    "linear-gradient(231.59deg, rgb(55, 109, 197) 31.798%, rgb(9, 56, 140) 93.108%)",
  "Samsung A11 tab":
    "linear-gradient(222.54deg, rgb(41, 215, 216) 17.003%, rgb(187, 255, 245) 69.675%)",
  "Motorola E15":
    "linear-gradient(-36.56deg, rgb(104, 125, 138) 3.6926%, rgb(50, 52, 122) 49.663%)",
};

const FONDO_DEFAULT =
  "linear-gradient(230.54deg, rgb(17, 153, 175) 33.766%, rgb(28, 117, 131) 97.531%)";

// Fotos del celular SIN el fondo, para el pop-up de Detalles — el fondo lo
// pone CATALOGO_FONDOS por CSS. Mismo orden que CATALOGO_FOTOS (combo al medio).
const CATALOGO_FOTOS_POPUP: Record<string, string[]> = {
  Motorolag06: [popG061, popG062, popG063],
  Motorolag15: [popG151, popG152, popG153],
  "Motorola E15": [popE151, popE152, popE153],
  "HONOR Play10": [popHonor1, popHonor2, popHonor3],
  "samsung-a07": [popA071, popA072, popA073],
  "Motorola g35": [popG351, popG352, popG353],
  samsunga17: [popA171, popA172, popA173],
  "Samsung A11 tab": [popTabA111, popTabA112, popTabA113],
};

// Nombre de vitrina prolijo — la base tiene marca/modelo con mayúsculas y
// espacios inconsistentes (p. ej. modelo "SAMSUNG A07" repitiendo la marca,
// o "Play10" sin espacio), así que para el catálogo se muestra este nombre
// fijo en vez de concatenar marca+modelo a lo bruto.
const CATALOGO_NOMBRES: Record<string, string> = {
  "Motorola E15": "Motorola E15",
  samsunga17: "Samsung A17",
  "Samsung A11 tab": "Samsung Tab A11",
  "Motorola g35": "Motorola G35",
  Motorolag06: "Motorola G06",
  Motorolag15: "Motorola G15",
  "samsung-a07": "Samsung A07",
  "HONOR Play10": "Honor Play 10",
};

// Las 3 fotos de un celular, en orden [lateral, combo (la principal), lateral u
// atrás] — usada tanto por la tarjeta de la grilla como por el pop-up de detalles,
// para que ambos compartan exactamente el mismo criterio de fallback.
const getFotosCelular = (phone: Phone): string[] =>
  phone.imagenes && phone.imagenes.length > 0
    ? phone.imagenes
    : CATALOGO_FOTOS[phone.id] || (phone.imagen ? [phone.imagen] : []);

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
  // Índice de la foto activa del mini-carrusel de cada tarjeta del catálogo,
  // por id de celular — sin entrada acá, se usa el índice del medio (la foto
  // de frente), no el 0.
  const [carruselTienda, setCarruselTienda] = useState<Record<string, number>>({});
  // Mismo criterio pero para el pop-up de Detalles — estado APARTE a propósito:
  // cambiar de foto en el pop-up no debe mover el punto activo de la tarjeta
  // de la grilla, ni al revés.
  const [carruselPopup, setCarruselPopup] = useState<Record<string, number>>({});

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
  // Además de esperar los datos (`loading`), la grilla de la Tienda espera a que
  // las fotos (tarjeta + pop-up) terminen de precargar — así al mover el
  // carrusel la foto siguiente ya está en caché y no se ve "trabado".
  const [fotosListas, setFotosListas] = useState(false);
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
            imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
            imagenesPopup: Array.isArray(p.imagenes_popup) ? p.imagenes_popup : [],
            gradienteInicio: p.gradiente_inicio || undefined,
            gradienteFin: p.gradiente_fin || undefined,
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

  // Precarga las 3 fotos de tarjeta + las 3 del pop-up de cada celular antes de
  // mostrar la grilla — si se dejan cargar recién al hacer click en un puntito,
  // cambiar de foto se ve "frenado" (esperando la red) porque las fotos viven
  // en Supabase Storage, no empaquetadas con el frontend. La grilla queda en
  // skeleton (mismo loading que el fetch de datos) hasta que todas terminan.
  useEffect(() => {
    if (page !== "tienda" || phones.length === 0) {
      if (page !== "tienda") setFotosListas(false);
      return;
    }
    setFotosListas(false);
    const urls = new Set<string>();
    phones.forEach((phone) => {
      getFotosCelular(phone).forEach((url) => urls.add(url));
      const fotosPopup = phone.imagenesPopup && phone.imagenesPopup.length > 0 ? phone.imagenesPopup : undefined;
      (fotosPopup || CATALOGO_FOTOS_POPUP[phone.id] || []).forEach((url) => urls.add(url));
    });
    let cancelado = false;
    Promise.all(
      Array.from(urls).map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          })
      )
    ).then(() => {
      if (!cancelado) setFotosListas(true);
    });
    return () => {
      cancelado = true;
    };
  }, [page, phones]);

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
                <svg
                  className={styles.faqIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect width="24" height="24" rx="6" fill="#0B1B3A" />
                  {/* El signo: "+" cuando está cerrado, "–" cuando está abierto
                      (la barra vertical se oculta por CSS con [open]). */}
                  <rect
                    className={styles.faqIconV}
                    x="11"
                    y="5"
                    width="2"
                    height="14"
                    fill="white"
                  />
                  <rect x="5" y="11" width="14" height="2" fill="white" />
                </svg>
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

          {bannerPromoSection}
          {faqSection}
        </>
      )}

      {/* ===================== TIENDA (Catálogo) ===================== */}
      {page === "tienda" && (
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
              : phones.map((phone) => {
                  const fotos = getFotosCelular(phone);
                  // La foto principal (la combo, mitad cámara/mitad pantalla) vive en el
                  // medio del array — arranca ahí, no en la 0.
                  const activaDefault = Math.floor((fotos.length - 1) / 2);
                  const activa = carruselTienda[phone.id] ?? activaDefault;
                  const nombre = CATALOGO_NOMBRES[phone.id] || `${(phone.marca || "").trim()} ${phone.modelo}`.trim();
                  const irAFoto = (i: number) =>
                    setCarruselTienda((prev) => ({
                      ...prev,
                      [phone.id]: (i + fotos.length) % fotos.length,
                    }));
                  return (
                    <div className={styles.tiendaCard} key={phone.id}>
                      <div className={styles.tiendaCardImgWrap}>
                        {fotos[activa] && <img src={fotos[activa]} alt={nombre} />}
                        {fotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeIzq}`}
                              onClick={() => irAFoto(activa - 1)}
                              aria-label={`Foto anterior de ${nombre}`}
                            />
                            <button
                              type="button"
                              className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeDer}`}
                              onClick={() => irAFoto(activa + 1)}
                              aria-label={`Foto siguiente de ${nombre}`}
                            />
                          </>
                        )}
                      </div>
                      {fotos.length > 1 && (
                        <div className={styles.tiendaCardDots}>
                          {fotos.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              className={`${styles.tiendaCardDot} ${i === activa ? styles.tiendaCardDotActiva : ""}`}
                              onClick={() => irAFoto(i)}
                              aria-label={`Ver foto ${i + 1} de ${nombre}`}
                            />
                          ))}
                        </div>
                      )}
                      <div className={styles.tiendaCardInfo}>
                        <h3>{nombre}</h3>
                        <div className={styles.tiendaCardPrecio}>
                          <p className={styles.tiendaCardDesde}>
                            Desde ${phone.montoSemanal52}/sem
                          </p>
                          <p className={styles.tiendaCardEnganche}>
                            Enganche ${phone.enganche}
                          </p>
                        </div>
                      </div>
                      <div className={styles.tiendaCardBotones}>
                        <button
                          type="button"
                          className={styles.tiendaCardBtnDetalles}
                          onClick={() => handleQuickView(phone)}
                        >
                          Detalles
                        </button>
                        {/* <Link> y no <button>: renderiza un <a href> real, que es la
                            única forma de que Google descubra las páginas de cada
                            celular (antes eran huérfanas). La navegación sigue siendo
                            del lado del cliente, y /cotizar/:id ya sabe reconstruir el
                            teléfono desde la URL, así que no hace falta onSelectPhone. */}
                        <Link
                          to={`/cotizar/${phone.id}`}
                          className={styles.tiendaCardBtnSolicitar}
                        >
                          Solicitar crédito
                        </Link>
                      </div>
                    </div>
                  );
                })}
          </div>
        </section>
      )}

      {/* ===================== LEGAL PAGES ===================== */}
      {["privacidad", "terminos", "cookies", "envios"].includes(page) && (
        <LegalContent page={page as any} />
      )}

      {/* QUICK VIEW MODAL */}
      {selectedQuickView &&
        (() => {
          const phone = selectedQuickView;
          const fotos = getFotosCelular(phone);
          // El pop-up usa fotos SIN el fondo (mismo orden/índice que `fotos`),
          // mostradas con `contain` para no recortar al celular — el fondo lo
          // pone el gradiente del wrap. Prioridad: lo cargado en el sadmin
          // (`phone.imagenesPopup`), después el fallback local por id.
          const fotosPopupTransp =
            (phone.imagenesPopup && phone.imagenesPopup.length > 0 ? phone.imagenesPopup : undefined) ||
            CATALOGO_FOTOS_POPUP[phone.id];
          const fotosPopup = fotosPopupTransp || fotos;
          const activaDefault = Math.floor((fotos.length - 1) / 2);
          const activa = carruselPopup[phone.id] ?? activaDefault;
          const irAFoto = (i: number) =>
            setCarruselPopup((prev) => ({
              ...prev,
              [phone.id]: (i + fotos.length) % fotos.length,
            }));
          const specsTodas: [string, string][] = [
            ["Pantalla", phone.specsPantalla || ""],
            ["Procesador", phone.specsProcesador || ""],
            ["Almacenamiento", phone.specsRamAlmacenamiento || ""],
            ["MicroSD", phone.specsMicrosd || ""],
            ["Cámara trasera", phone.specsCamaraTrasera || ""],
            ["Cámara frontal", phone.specsCamaraFrontal || ""],
            ["Batería", phone.specsBateria || ""],
            ["Sistema", phone.specsSistema || ""],
            ["Seguridad", phone.specsSeguridad || ""],
            ["Resistencia", phone.specsResistencia || ""],
            ["Conectividad", phone.specsConectividad || ""],
            ["Dimensiones", phone.specsDimensionesPeso || ""],
          ];
          const specs = specsTodas.filter(([, val]) => val);
          // Mismo nombre de vitrina que la tarjeta ("Motorola G06", no "G06"):
          // el Figma muestra marca + modelo en el título del pop-up.
          const nombreModal =
            CATALOGO_NOMBRES[phone.id] ||
            `${(phone.marca || "").trim()} ${phone.modelo}`.trim();

          return (
            <div className={styles.modalOverlay} onClick={handleCloseQuickView}>
              <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.closeBtn}
                  onClick={handleCloseQuickView}
                  aria-label="Cerrar modal"
                >
                  &times;
                </button>
                <div
                  className={styles.modalImgWrap}
                  style={{
                    background:
                      phone.gradienteInicio && phone.gradienteFin
                        ? `linear-gradient(230.54deg, ${phone.gradienteInicio} 33.766%, ${phone.gradienteFin} 97.531%)`
                        : CATALOGO_FONDOS[phone.id] || FONDO_DEFAULT,
                  }}
                >
                  {fotosPopup[activa] && (
                    <img
                      src={fotosPopup[activa]}
                      alt={phone.modelo}
                      className={fotosPopupTransp ? styles.modalImgTransparente : undefined}
                    />
                  )}
                  {fotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeIzq}`}
                        onClick={() => irAFoto(activa - 1)}
                        aria-label="Foto anterior"
                      />
                      <button
                        type="button"
                        className={`${styles.tiendaCardBorde} ${styles.tiendaCardBordeDer}`}
                        onClick={() => irAFoto(activa + 1)}
                        aria-label="Foto siguiente"
                      />
                      <div className={styles.modalDots}>
                        {fotos.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`${styles.modalDot} ${i === activa ? styles.modalDotActiva : ""}`}
                            onClick={() => irAFoto(i)}
                            aria-label={`Ver foto ${i + 1} de ${phone.modelo}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.modalContent}>
                  <div className={styles.modalTop}>
                    <div className={styles.modalTexto}>
                      <div className={styles.modalTitulo}>
                        <h2 className={styles.modalTitle}>{nombreModal}</h2>
                        <span className={styles.modalBadge}>
                          Desde ${phone.montoSemanal52}/sem
                        </span>
                      </div>
                      <div className={styles.modalPrecios}>
                        <p>Precio original ${phone.precioBase.toLocaleString()}</p>
                        {phone.precioDescuento != null && (
                          <p>
                            Precio con descuento $
                            {phone.precioDescuento.toLocaleString()}
                          </p>
                        )}
                        <p>Enganche ${phone.enganche.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      className={styles.solicitarBtn}
                      onClick={() => handleProcederCotizar(phone)}
                    >
                      Solicitar Crédito
                    </button>
                  </div>
                  <div className={styles.specsScroll}>
                    {specs.map(([label, value]) => (
                      <div key={label} className={styles.specRow}>
                        <span>{label}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* FOOTER */}
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
    </div>
  );
};
