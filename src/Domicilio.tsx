import React, { useState, useEffect } from "react";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";
import { FiCheck } from "react-icons/fi";

interface DomicilioProps {
  solicitudId: string;
  modelo: string;
  // Foto del catálogo (buscada por modelo en App.tsx) — puede no encontrarse si el
  // modelo cambió de nombre en el catálogo desde que se creó la solicitud.
  imagen?: string;
  onFinalizado: () => void;
}

export const Domicilio: React.FC<DomicilioProps> = ({
  solicitudId,
  modelo,
  imagen,
  onFinalizado,
}) => {
  // El pago semanal no viaja en la URL (Stripe solo redirige con solicitud+modelo) —
  // se trae del mismo endpoint de resumen que ya usa Documentos.tsx al reanudar.
  const [pagoSemanal, setPagoSemanal] = useState<number | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
    fetch(`${backendUrl}/api/solicitudes/${solicitudId}/resumen`)
      .then((r) => (r.ok ? r.json() : null))
      .then((resumen) => {
        if (resumen?.pagoSemanal) setPagoSemanal(resumen.pagoSemanal);
      })
      .catch(() => {});
  }, [solicitudId]);

  const [calle, setCalle] = useState("");
  const [numeroExterior, setNumeroExterior] = useState("");
  const [numeroInterior, setNumeroInterior] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [colonia, setColonia] = useState("");
  const [alcaldiaMunicipio, setAlcaldiaMunicipio] = useState("");
  const [estado, setEstado] = useState("");
  const [status, setStatus] = useState<"form" | "enviando" | "error">("form");
  const [errorMessage, setErrorMessage] = useState("");

  const isFormValid =
    calle.trim() !== "" &&
    numeroExterior.trim() !== "" &&
    codigoPostal.trim().length === 5 &&
    colonia.trim() !== "" &&
    alcaldiaMunicipio.trim() !== "" &&
    estado.trim() !== "";

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus("enviando");
    setErrorMessage("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
      const response = await fetch(
        `${backendUrl}/api/solicitudes/${solicitudId}/domicilio`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calle: calle.trim(),
            numero_exterior: numeroExterior.trim(),
            numero_interior: numeroInterior.trim() || undefined,
            codigo_postal: codigoPostal.trim(),
            colonia: colonia.trim(),
            alcaldia_municipio: alcaldiaMunicipio.trim(),
            estado: estado.trim(),
          }),
        },
      );

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.error || "Ocurrió un error al guardar tu domicilio.");
      }

      onFinalizado();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(
        error.message ||
          "Ocurrió un error al guardar tu domicilio. Por favor intenta de nuevo.",
      );
      setStatus("error");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.detallesTelefono}>
            <div className={styles.telefonoCol}>
              <img src={logoBlanco} alt="Movinex" className={styles.logo} />
              <div>
                <div className={styles.modelo}>{modelo}</div>
                {pagoSemanal && <div className={styles.planLinea}>${pagoSemanal} semanal</div>}
              </div>
            </div>
            {imagen && (
              <div className={styles.imagenTelefonoWrap}>
                <img src={imagen} alt={modelo} />
              </div>
            )}
          </div>
          <div className={styles.progreso}>
            <div className={styles.pasoIndicador}>
              <span className={`${styles.pasoNum} ${styles.pasoNumDone}`}>
                <FiCheck />
              </span>
              <span>Cotizar celular</span>
            </div>
            <div className={styles.pasoIndicador}>
              <span className={`${styles.pasoNum} ${styles.pasoNumDone}`}>
                <FiCheck />
              </span>
              <span>Identidad</span>
            </div>
            <div className={`${styles.pasoIndicador} ${styles.pasoActivo}`}>
              <span className={styles.pasoNum}>3</span>
              <span>Envío</span>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <form className={styles.paso} onSubmit={handleEnviar}>
            <div className={styles.tituloWrap}>
              <p className={styles.titulo}>Agrega tus datos de envío</p>
              <p className={styles.subtitulo}>
                Tu pago quedó confirmado. Completa la información para programar el envío de tu celular.
              </p>
            </div>

            <div className={styles.campo}>
              <label htmlFor="calle">Calle</label>
              <input
                id="calle"
                type="text"
                placeholder="Av. Insurgentes Sur"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div className={styles.campo} style={{ flex: 1 }}>
                <label htmlFor="numeroExterior">No. exterior</label>
                <input
                  id="numeroExterior"
                  type="text"
                  placeholder="123"
                  value={numeroExterior}
                  onChange={(e) => setNumeroExterior(e.target.value)}
                  required
                />
              </div>
              <div className={styles.campo} style={{ flex: 1 }}>
                <label htmlFor="numeroInterior">No. interior (opcional)</label>
                <input
                  id="numeroInterior"
                  type="text"
                  placeholder="4B"
                  value={numeroInterior}
                  onChange={(e) => setNumeroInterior(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.campo}>
              <label htmlFor="codigoPostal">Código postal</label>
              <input
                id="codigoPostal"
                type="text"
                placeholder="06600"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ""))}
                maxLength={5}
                className={codigoPostal.length > 0 && codigoPostal.length < 5 ? styles.inputError : ""}
                required
              />
              {codigoPostal.length > 0 && codigoPostal.length < 5 && (
                <span className={styles.errorMsg}>El código postal debe contener exactamente 5 dígitos</span>
              )}
            </div>

            <div className={styles.campo}>
              <label htmlFor="colonia">Colonia</label>
              <input
                id="colonia"
                type="text"
                placeholder="Roma Norte"
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                required
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="alcaldiaMunicipio">Alcaldía / Municipio</label>
              <input
                id="alcaldiaMunicipio"
                type="text"
                placeholder="Cuauhtémoc"
                value={alcaldiaMunicipio}
                onChange={(e) => setAlcaldiaMunicipio(e.target.value)}
                required
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="estado">Estado</label>
              <input
                id="estado"
                type="text"
                placeholder="Ciudad de México"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              />
            </div>

            {status === "error" && (
              <div className={styles.errorMsg} style={{ marginBottom: "10px" }}>
                {errorMessage}
              </div>
            )}

            <div className={styles.botonesFinal}>
              <button
                type="submit"
                className={styles.cta}
                disabled={!isFormValid || status === "enviando"}
              >
                {status === "enviando" ? "Guardando..." : "Confirmar domicilio"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
