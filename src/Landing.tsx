import React from 'react';
import styles from './Landing.module.css';
import type { Phone } from './types';

// Importar imágenes de mockup locales
import samsungImg from './assets/samsung_s24.png';
import iphoneImg from './assets/iphone15_pro.png';
import xiaomiImg from './assets/xiaomi_redmi.png';

interface LandingProps {
  onSelectPhone: (phone: Phone) => void;
}

export const Landing: React.FC<LandingProps> = ({ onSelectPhone }) => {
  // Lista de teléfonos disponibles en la tienda (maqueta)
  const phones: Phone[] = [
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

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <svg className={styles.logo} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 15 L35 45 L50 15 L65 45 L80 15" stroke="#0B1B3C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="95" y="42" fill="#0B1B3C" fontSize="32" fontWeight="bold" fontFamily="'Outfit', sans-serif">Movinex</text>
          </svg>
          <nav className={styles.nav}>
            <a href="#inicio">Inicio</a>
            <a href="#beneficios">Nosotros</a>
            <a href="#tienda" className={styles.btnTienda}>Tienda</a>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>FINANCIAMIENTO DE CELULARES</span>
            <h1>Tu próximo celular, a tu ritmo</h1>
            <p>Estrena con solo 15% de enganche y paga por semana. Sin tarjeta, sin buró de crédito. Solo necesitas tu INE.</p>
            <a href="#tienda" className={styles.ctaButton}>Ver Celulares</a>
          </div>
          <div className={styles.heroImageContainer}>
            <img src={samsungImg} alt="Samsung S24 Ultra Mockup" className={styles.heroImage} />
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className={styles.beneficios}>
        <h2 className={styles.sectionTitle}>¿Por qué elegir Movinex?</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.iconContainer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="8" cy="11" r="2"></circle><path d="M14 10h4M14 13h4"></path></svg>
            </div>
            <h3>Solo con tu INE</h3>
            <p>Te aprobamos con tu pura identificación. Sin buró de crédito ni tarjetas bancarias.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.iconContainer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3>A tu ritmo</h3>
            <p>Tú decides los plazos. Elige pagar cómodamente a 26 o 52 semanas.</p>
          </div>
          <div className={styles.card}>
            <div className={styles.iconContainer}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h3>Envío a todo México</h3>
            <p>Recibe tu equipo de forma rápida y segura en tu domicilio, de 2 a 5 días hábiles.</p>
          </div>
        </div>
      </section>

      {/* TIENDA (CATÁLOGO) */}
      <section id="tienda" className={styles.tienda}>
        <h2 className={styles.sectionTitle}>Celulares Disponibles</h2>
        <p className={styles.sectionSubtitle}>Los mejores celulares con financiamiento a tu medida. Selecciona uno para cotizar:</p>
        <div className={styles.catalogo}>
          {phones.map((phone) => (
            <div key={phone.id} className={styles.productCard} onClick={() => onSelectPhone(phone)}>
              <div className={styles.imgWrap}>
                <img src={phone.imagen} alt={phone.modelo} />
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

      {/* SOPORTE / DUDAS */}
      <section className={styles.dudas}>
        <h2>¿Tienes dudas?</h2>
        <p>Escríbenos por WhatsApp y con gusto te explicamos cómo funciona, los plazos y cómo estrenar de inmediato.</p>
        <a href="https://wa.me/525555028744?text=Hola%20Movinex,%20quiero%20comprar%20un%20celular" target="_blank" rel="noopener noreferrer" className={styles.whatsappBtn}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.039.98 11.412.982 5.976.982 1.554 5.353 1.55 10.781c-.001 1.702.462 3.364 1.343 4.877l-.982 3.582 3.736-.966z"/>
          </svg>
          Chatear por WhatsApp
        </a>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; {new Date().getFullYear()} Movinex. Todos los derechos reservados.</p>
          <div className={styles.footerLinks}>
            <a href="#">Envío y devoluciones</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Preguntas frecuentes</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
