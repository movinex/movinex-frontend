import { FaWhatsapp } from "react-icons/fa6";
import styles from "../../Landing.module.css";

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

// Banner "Último Celular" y Preguntas Frecuentes son idénticos en Inicio y
// Quienes Somos (mismo diseño, mismo contenido) — se comparte este componente
// para no duplicar el JSX (y el JSON-LD) en las dos páginas.
export function FaqSection() {
  return (
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
}
