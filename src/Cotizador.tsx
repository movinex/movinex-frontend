import React, { useState } from 'react';
import styles from './Cotizador.module.css';

interface PlazoOption {
  semanas: number;
  montoSemanal: number;
  totalPagar: number;
  ahorro?: number;
}

interface CotizadorProps {
  onSiguiente: (data: { semanas: number; pagoSemanal: number; enganche: number }) => void;
}

export const Cotizador: React.FC<CotizadorProps> = ({ onSiguiente }) => {
  // Datos ejemplo basados en la maqueta
  const modelo = "Samsung Galaxy S24 Ultra";
  const precioBase = 12999;
  const enganche = 2999;
  const precioFinanciado = precioBase - enganche;

  // Opciones de plazos predefinidas
  const plazos: PlazoOption[] = [
    { semanas: 26, montoSemanal: 425, totalPagar: 11050, ahorro: 1200 },
    { semanas: 52, montoSemanal: 235, totalPagar: 12220 }
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
          {/* Logo SVG inline de Movinex para evitar dependencias de imágenes externas */}
          <svg className={styles.logo} viewBox="0 0 240 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 15 L35 45 L50 15 L65 45 L80 15" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="95" y="42" fill="#FFFFFF" fontSize="32" fontWeight="bold" fontFamily="'Outfit', sans-serif">Movinex</text>
          </svg>
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
