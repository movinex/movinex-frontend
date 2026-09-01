import React, { useState } from 'react';
import { Link } from 'react-router';
import styles from './Cotizador.module.css';
import type { Phone } from './types';
import logoBlanco from './assets/figma-logo-footer.svg';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

interface PlazoOption {
  semanas: number;
  montoSemanal: number;
  totalPagar: number;
  ahorro?: number;
}

interface CotizadorProps {
  phone: Phone;
  onSiguiente: (data: { semanas: number; pagoSemanal: number; enganche: number }) => void;
  onVolver: () => void;
}

export const Cotizador: React.FC<CotizadorProps> = ({ phone, onSiguiente, onVolver }) => {
  const modelo = phone.modelo;
  const precioBase = phone.precioBase;
  const enganche = phone.enganche;

  // El catálogo guarda la marca aparte del modelo ("Motorola" + "G15") y algunos
  // registros vienen con espacios de sobra. El nombre completo es la señal principal
  // para búsquedas tipo "movinex g15": antes no aparecía en ningún lado de la página.
  const marca = (phone.marca || '').trim();
  const nombreCompleto = [marca, modelo].filter(Boolean).join(' ');

  // Opciones de plazos basadas en el teléfono seleccionado
  const plazos: PlazoOption[] = [
    { semanas: 52, montoSemanal: phone.montoSemanal52, totalPagar: phone.totalPagar52 },
    { semanas: 26, montoSemanal: phone.montoSemanal26, totalPagar: phone.totalPagar26, ahorro: phone.ahorro26 }
  ];

  const [plazoSeleccionado, setPlazoSeleccionado] = useState<number>(26);

  const opcionActiva = plazos.find(p => p.semanas === plazoSeleccionado) || plazos[0];

  const handleSiguiente = () => {
    onSiguiente({
      semanas: opcionActiva.semanas,
      pagoSemanal: opcionActiva.montoSemanal,
      enganche: enganche
    });
  };

  return (
    <div className={styles.wrap}>
      <title>{`${nombreCompleto} a pagos semanales sin buró ni tarjeta | Movinex`}</title>
      <meta
        name="description"
        content={`Estrena el ${nombreCompleto} con $${enganche.toLocaleString()} de enganche y pagos semanales desde $${opcionActiva.montoSemanal}, sin buró de crédito, sin tarjeta y sin aval. Envío a todo México.`}
      />
      <link rel="canonical" href={`https://www.movinex.mx/cotizar/${phone.id}`} />
      {/* Datos estructurados del producto: permiten que Google muestre precio y
          disponibilidad en el resultado, no solo el texto. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: nombreCompleto,
            image: phone.imagen,
            description: `${nombreCompleto} a pagos semanales en Movinex, sin buró de crédito, sin tarjeta y sin aval.`,
            ...(marca ? { brand: { '@type': 'Brand', name: marca } } : {}),
            offers: {
              '@type': 'Offer',
              url: `https://www.movinex.mx/cotizar/${phone.id}`,
              priceCurrency: 'MXN',
              price: precioBase,
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: 'Movinex' }
            }
          })
        }}
      />
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.detallesTelefono}>
            <div className={styles.telefonoCol}>
              <img src={logoBlanco} alt="Movinex" className={styles.logo} />
              <h1 className={styles.modelo}>{nombreCompleto}</h1>
            </div>
            <div className={styles.imagenTelefonoWrap}>
              <img src={phone.imagen} alt={`${nombreCompleto} a pagos semanales en Movinex`} />
            </div>
          </div>
          <div className={styles.progreso}>
            <div className={`${styles.pasoIndicador} ${styles.pasoActivo}`}>
              <span className={styles.pasoNum}>1</span>
              <span>Cotizar celular</span>
            </div>
            <div className={styles.pasoIndicador}>
              <span className={styles.pasoNum}>2</span>
              <span>Identidad</span>
            </div>
            <div className={styles.pasoIndicador}>
              <span className={styles.pasoNum}>3</span>
              <span>Envío</span>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.titulo}>Elige tu plazo preferido</div>

          <div className={styles.plazos}>
            {plazos.map((plazo) => (
              <div
                key={plazo.semanas}
                className={`${styles.plazo} ${plazoSeleccionado === plazo.semanas ? styles.activo : ''}`}
                onClick={() => setPlazoSeleccionado(plazo.semanas)}
              >
                <div className={styles.cuota}>
                  <small>$</small>{plazo.montoSemanal}
                </div>
                <div className={styles.sem}>{plazo.semanas} Semanas</div>
                {plazoSeleccionado === plazo.semanas && (
                  <span className={styles.checkIcon}>
                    <FiCheck />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className={styles.detalles}>
            <div className={styles.fila}>
              <span className={styles.k}>Precio original</span>
              <span className={styles.v}>${precioBase.toLocaleString()}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.fila}>
              <span className={styles.k}>Pago inicial (Requerido)</span>
              <span className={styles.v}>${enganche.toLocaleString()}</span>
            </div>
          </div>

          {/* <p className={styles.resumenTexto}>
            Llévate el {nombreCompleto} pagando ${enganche.toLocaleString()} de enganche y{' '}
            {opcionActiva.semanas} pagos semanales de ${opcionActiva.montoSemanal} en Movinex:
            sin checar buró de crédito, sin tarjeta y sin aval. Solo necesitas tu INE y tu
            WhatsApp, la aprobación es en minutos y te lo enviamos a tu domicilio en todo México.
          </p> */}

          <div className={styles.botones}>
            <button className={styles.cta} onClick={handleSiguiente}>
              Solicitar Crédito Ahora <FiArrowRight />
            </button>
            <button className={styles.volver} onClick={onVolver}>
              Volver a la tienda
            </button>
          </div>

          <div className={styles.legal}>
            Al dar clic aceptas nuestros <Link to="/terminos"><b>Términos y condiciones</b></Link>.
          </div>
        </div>
      </div>
    </div>
  );
};
