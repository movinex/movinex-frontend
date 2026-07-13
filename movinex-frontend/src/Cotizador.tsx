import React, { useState } from 'react';
import styles from './Cotizador.module.css';
import type { Phone } from './types';
import logoBlanco from './assets/movinex_blanco.png';

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
  const precioFinanciado = precioBase - enganche;

  // Opciones de plazos basadas en el teléfono seleccionado
  const plazos: PlazoOption[] = [
    { semanas: 26, montoSemanal: phone.montoSemanal26, totalPagar: phone.totalPagar26, ahorro: phone.ahorro26 },
    { semanas: 52, montoSemanal: phone.montoSemanal52, totalPagar: phone.totalPagar52 }
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
      <div className={styles.card}>
        <div className={styles.hero}>
          <img src={logoBlanco} alt="Movinex Logo" className={styles.logo} />
          <div className={styles.eyebrow}>Tu próximo celular</div>
          <div className={styles.modelo}>{modelo}</div>
          <div className={styles.precioBase}>
            Precio original <b>${precioBase.toLocaleString()}</b>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.lbl}>Elige tu plazo preferido:</div>
          <div className={styles.plazos}>
            {plazos.map((plazo) => (
              <div
                key={plazo.semanas}
                className={`${styles.plazo} ${plazoSeleccionado === plazo.semanas ? styles.activo : ''}`}
                onClick={() => setPlazoSeleccionado(plazo.semanas)}
              >
                <div className={styles.sem}>{plazo.semanas} Semanas</div>
                <div className={styles.cuota}>
                  <small>$</small>{plazo.montoSemanal}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.resumen}>
            <div className={styles.fila}>
              <div className={styles.k}>Pago inicial (Enganche)</div>
              <div className={styles.v}>
                ${enganche.toLocaleString()}
                <span className={styles.engancheTag}>Requerido</span>
              </div>
            </div>
            <div className={styles.fila}>
              <div className={styles.k}>Financiado por {opcionActiva.semanas} semanas</div>
              <div className={styles.v}>${precioFinanciado.toLocaleString()}</div>
            </div>
            <div className={styles.fila}>
              <div className={styles.k}>Pago semanal</div>
              <div className={styles.v}>${opcionActiva.montoSemanal}</div>
            </div>
            <div className={`${styles.fila} ${styles.total}`}>
              <div className={styles.k}>Total a pagar</div>
              <div className={styles.v}>${opcionActiva.totalPagar.toLocaleString()}</div>
            </div>
          </div>

          {opcionActiva.ahorro && (
            <div className={styles.leyenda}>
              <div className={styles.grande}>
                ¡Ahorras <span>${opcionActiva.ahorro}</span> al liquidar a {opcionActiva.semanas} semanas!
              </div>
              <div className={styles.cat}>
                Costo Anual Total (CAT) promedio 45% sin IVA. Sujeto a aprobación de crédito.
              </div>
            </div>
          )}

          <button className={styles.cta} onClick={handleSiguiente}>
            Solicitar crédito ahora
          </button>

          <button className={styles.cta} style={{ background: '#E4E8F1', color: '#5A6688', marginTop: '10px', boxShadow: 'none' }} onClick={onVolver}>
            Volver a la tienda
          </button>

          <div className={styles.nota}>
            Al dar clic aceptas la consulta de tu <b>Buro de Crédito</b>.
          </div>

          <div className={styles.pasos}>
            <div className={styles.paso}>
              <div className={styles.n}>1</div> Cotizar celular <span className={styles.arrow}>→</span>
            </div>
            <div className={styles.paso} style={{ opacity: 0.5 }}>
              <div className={styles.n}>2</div> Identidad <span className={styles.arrow}>→</span>
            </div>
            <div className={styles.paso} style={{ opacity: 0.5 }}>
              <div className={styles.n}>3</div> Contrato
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
