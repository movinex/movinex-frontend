import React, { useState, useEffect } from 'react';
import styles from './Landing.module.css';
import type { Phone } from './types';

// Mockup local images
import samsungImg from './assets/samsung_s24.png';
import iphoneImg from './assets/iphone15_pro.png';
import xiaomiImg from './assets/xiaomi_redmi.png';

// Carousel images
import banner1 from './assets/Copia de Degradado horizontal izquierda a derecha.png';
import banner2 from './assets/Copia de Degradado horizontal izquierda a derecha 2.png';
import banner3 from './assets/Copia de Degradado horizontal izquierda a derecha 3.png';
import banner4 from './assets/Copia de Diseño sin título (81) 2.png';
import banner5 from './assets/Copia de Diseño sin título (81) 3.png';

// Brand logos
import brandSamsung from './assets/Samsung Logo Black PNG.jpeg';
import brandXiaomi from './assets/Xiaomi Font Logo PNG Vector (SVG) Free Download_edited.png';
import brandRealme from './assets/Diseño sin título (80).png';

// Payment methods
import logoColor from './assets/movinex_color.png';
import oxxoLogo from './assets/Oxxo_Logo.svg.png';
import sevenLogo from './assets/7-eleven_logo.svg.png';
import speiLogo from './assets/spei.png';
import mpLogo from './assets/images mercado.png';
import ahorroLogo from './assets/66e332240412cb710d3532c4_Farmacias del Ahorro.png';

// Help section mockup
import chatMockup from './assets/ChatGPT Image 9 jun 2026, 11_17_48 a.m..png';

interface LandingProps {
  onSelectPhone: (phone: Phone) => void;
}

export const Landing: React.FC<LandingProps> = ({ onSelectPhone }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: banner1,
      title: 'Tu próximo celular, a tu ritmo',
      subtitle: 'Estrena con solo 15% de enganche y paga semanalmente. Sin tarjeta de crédito ni buró.'
    },
    {
      image: banner2,
      title: 'Elige entre las mejores marcas',
      subtitle: 'Modelos de Samsung, Xiaomi, Apple, Motorola y más con financiamiento a tu medida.'
    },
    {
      image: banner3,
      title: 'Solicitud rápida con tu INE',
      subtitle: 'Obtén la aprobación en minutos y estrena de inmediato con un proceso 100% digital.'
    },
    {
      image: banner4,
      title: 'Enganche mínimo garantizado',
      subtitle: 'Conoce nuestros planes flexibles y págalo a 26 o 52 semanas.'
    },
    {
      image: banner5,
      title: 'Envío express a todo México',
      subtitle: 'Recibe tu smartphone en la puerta de tu hogar de forma rápida y segura.'
    }
  ];

  // Auto-play carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const phones: Phone[] = [
    {
      id: 'samsung-a07',
      modelo: 'Samsung Galaxy A07',
      marca: 'Samsung',
      precioBase: 2999,
      enganche: 375,
      montoSemanal26: 167,
      montoSemanal52: 99,
      totalPagar26: 4342,
      totalPagar52: 5148,
      ahorro26: 250,
      imagen: samsungImg
    },
    {
      id: 'samsung-s24',
      modelo: 'Samsung Galaxy S24 Ultra',
      marca: 'Samsung',
      precioBase: 12999,
      enganche: 2999,
      montoSemanal26: 425,
      montoSemanal52: 235,
      totalPagar26: 11050,
      totalPagar52: 12220,
      ahorro26: 1200,
      imagen: samsungImg
    },
    {
      id: 'iphone-15pro',
      modelo: 'iPhone 15 Pro Max',
      marca: 'Apple',
      precioBase: 15999,
      enganche: 3699,
      montoSemanal26: 520,
      montoSemanal52: 285,
      totalPagar26: 13520,
      totalPagar52: 14820,
      ahorro26: 1500,
      imagen: iphoneImg
    },
    {
      id: 'xiaomi-redmi13',
      modelo: 'Xiaomi Redmi Note 13 Pro',
      marca: 'Xiaomi',
      precioBase: 5999,
      enganche: 1399,
      montoSemanal26: 195,
      montoSemanal52: 110,
      totalPagar26: 5070,
      totalPagar52: 5720,
      ahorro26: 600,
      imagen: xiaomiImg
    }
  ];

  const faqs = [
    {
      q: '¿Qué requisitos necesito para obtener mi crédito?',
      a: 'Solo necesitas tener a la mano tu identificación oficial vigente (INE) y tu celular con WhatsApp para recibir las notificaciones. No requerimos tarjetas bancarias ni consulta de historial en buró de crédito.'
    },
    {
      q: '¿De cuánto es el pago inicial (enganche)?',
      a: 'El enganche es equivalente a aproximadamente el 15% del valor total del teléfono seleccionado. Se paga una sola vez al momento de autorizar tu crédito para poder apartar y enviar tu equipo.'
    },
    {
      q: '¿Cómo y dónde realizo mis pagos semanales?',
      a: 'Puedes realizar tus pagos de forma presencial en cualquier tienda OXXO o 7-Eleven de la República Mexicana, o bien de forma digital mediante transferencia electrónica (SPEI).'
    },
    {
      q: '¿Cuánto tiempo tarda en llegar mi celular?',
      a: 'El envío es express y totalmente gratuito a cualquier parte de México. Tarda entre 2 y 5 días hábiles en llegar directamente a tu domicilio después de confirmarse el pago del enganche.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img src={logoColor} alt="Movinex Logo" className={styles.logo} />
          <nav className={styles.nav}>
            <a href="#inicio">Inicio</a>
            <a href="#beneficios">Movinex</a>
            <a href="#tienda" className={styles.btnTienda}>Tienda</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION / CAROUSEL */}
      <section id="inicio" className={styles.heroCarousel}>
        <div className={styles.slidesContainer}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`${styles.slide} ${currentSlide === index ? styles.slideActive : ''}`}
              style={{ backgroundImage: `linear-gradient(to right, rgba(11, 27, 60, 0.9) 35%, rgba(11, 27, 60, 0.4) 100%), url("${slide.image}")` }}
            >
              <div className={styles.slideContent}>
                <span className={styles.eyebrow}>FINANCIAMIENTO A TU MEDIDA</span>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <a href="#tienda" className={styles.ctaButton}>Ver Celulares</a>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel controls */}
        <button onClick={prevSlide} className={`${styles.carouselBtn} ${styles.prevBtn}`} aria-label="Anterior">
          &#10094;
        </button>
        <button onClick={nextSlide} className={`${styles.carouselBtn} ${styles.nextBtn}`} aria-label="Siguiente">
          &#10095;
        </button>

        {/* Carousel indicators */}
        <div className={styles.indicators}>
          {slides.map((_, index) => (
            <span
              key={index}
              className={`${styles.indicator} ${currentSlide === index ? styles.indicatorActive : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* BENEFICIOS / SERVICE BADGES */}
      <section id="beneficios" className={styles.beneficios}>
        <div className={styles.badgesWrapper}>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon}>🚚</div>
            <div className={styles.badgeText}>
              <h4>Envío gratis</h4>
              <p>A todo México</p>
            </div>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon}>🕒</div>
            <div className={styles.badgeText}>
              <h4>Págalo a tu ritmo</h4>
              <p>Plazos semanales</p>
            </div>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon}>🛡️</div>
            <div className={styles.badgeText}>
              <h4>Sin buró de crédito</h4>
              <p>Aprobación inmediata</p>
            </div>
          </div>
          <div className={styles.badgeItem}>
            <div className={styles.badgeIcon}>📝</div>
            <div className={styles.badgeText}>
              <h4>Solo con tu INE</h4>
              <p>Sin trámites complejos</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIENDA (CATÁLOGO) */}
      <section id="tienda" className={styles.tienda}>
        <h2 className={styles.sectionTitle}>Los mejores celulares con financiamiento a tu medida</h2>
        <p className={styles.sectionSubtitle}>Selecciona el modelo de tu agrado para cotizar tu enganche y pagos semanales:</p>
        
        <div className={styles.catalogo}>
          {phones.map((phone, idx) => (
            <div key={phone.id} className={styles.productCard} onClick={() => onSelectPhone(phone)}>
              <div className={styles.imgWrap}>
                <img src={phone.imagen} alt={phone.modelo} />
                {idx === 0 && (
                  <div className={styles.engancheBadge}>
                    <span>Enganche</span>
                    <strong>Mínimo</strong>
                  </div>
                )}
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
                <button className={styles.cotizarBtn}>Cotizar Ahora</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARCAS */}
      <section className={styles.marcasSection}>
        <h3 className={styles.marcasTitle}>Marcas que financiamos</h3>
        <div className={styles.marcasGrid}>
          <div className={styles.marcaItem}><img src={brandSamsung} alt="Samsung" /></div>
          <div className={styles.marcaItem}><img src={brandXiaomi} alt="Xiaomi" /></div>
          <div className={styles.marcaItem}><img src={brandRealme} alt="Realme" /></div>
          <div className={styles.marcaItem}><span className={styles.marcaTexto}>Motorola</span></div>
          <div className={styles.marcaItem}><span className={styles.marcaTexto}>Honor</span></div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (FAQ Accordion) */}
      <section id="faq" className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>Preguntas Frecuentes</h2>
        <div className={styles.faqContainer}>
          {faqs.map((faq, idx) => (
            <div key={idx} className={`${styles.faqItem} ${openFaq === idx ? styles.activeFaq : ''}`}>
              <button className={styles.faqQuestion} onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <svg className={styles.faqIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <div className={styles.faqAnswer}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHATSAPP DUDAS / CHAT MOCKUP */}
      <section className={styles.dudas}>
        <div className={styles.dudasContent}>
          <div className={styles.dudasText}>
            <h2>¿Tienes dudas?</h2>
            <p>Escríbenos por WhatsApp y con gusto te explicamos el proceso para obtener tu crédito, definir tus plazos y recibir tu equipo hoy mismo.</p>
            <a href="https://wa.me/525555028744?text=Hola%20Movinex,%20quiero%20comprar%20un%20celular" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.039.98 11.412.982 5.976.982 1.554 5.353 1.55 10.781c-.001 1.702.462 3.364 1.343 4.877l-.982 3.582 3.736-.966z"/>
              </svg>
              Chatear por WhatsApp
            </a>
          </div>
          <div className={styles.dudasMockup}>
            <img src={chatMockup} alt="WhatsApp Chat Mockup" className={styles.mockupImg} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <img src={logoColor} alt="Movinex Logo" className={styles.footerLogo} />
            <p className={styles.copyright}>&copy; {new Date().getFullYear()} Movinex. Todos los derechos reservados.</p>
          </div>
          
          <div className={styles.footerColumn}>
            <h4>Métodos de Pago</h4>
            <div className={styles.metodosPago}>
              <img src={oxxoLogo} alt="Oxxo" />
              <img src={sevenLogo} alt="7 Eleven" />
              <img src={speiLogo} alt="SPEI" />
              <img src={mpLogo} alt="Mercado Pago" />
              <img src={ahorroLogo} alt="Farmacias del Ahorro" className={styles.ahorroLogoImg} />
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>Legal</h4>
            <div className={styles.footerLinks}>
              <a href="#">Envío y devoluciones</a>
              <a href="#">Términos y condiciones</a>
              <a href="#">Aviso de privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
