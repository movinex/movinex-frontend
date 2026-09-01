export const LANDING_SUBPAGES = ["movinex", "tienda", "privacidad", "terminos", "cookies", "envios"] as const;
export type LandingPage = "inicio" | (typeof LANDING_SUBPAGES)[number];

// Título y descripción únicos por página: evita que Google indexe todas las
// rutas con el mismo <title>/<meta description> (los estáticos de index.html).
export const PAGE_META: Record<LandingPage, { title: string; description: string }> = {
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
