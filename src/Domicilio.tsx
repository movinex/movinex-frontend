import React, { useState } from "react";
import styles from "./Documentos.module.css";
import logoBlanco from "./assets/movinex_blanco.webp";

interface DomicilioProps {
  solicitudId: string;
  modelo: string;
  onFinalizado: () => void;
}

export const Domicilio: React.FC<DomicilioProps> = ({
  solicitudId,
  modelo,
  onFinalizado,
}) => {
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
        <div className={styles.hero}>
          <img src={logoBlanco} alt="Movinex Logo" className={styles.logo} />
          <div className={styles.eyebrow}>Paso 2 de 3 · Domicilio</div>
          <div className={styles.titulo}>¿A dónde enviamos tu {modelo}?</div>
          <div className={styles.sub}>
            Tu pago quedó confirmado. Necesitamos tu dirección exacta para
            programar el envío.
          </div>
        </div>

        <div className={styles.body}>
          <form onSubmit={handleEnviar}>
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

            <div style={{ display: "flex", gap: "12px" }}>
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
                <label htmlFor="numeroInterior">No. interior (Opcional)</label>
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
                <span className={styles.errorMsg}>El Código Postal debe contener exactamente 5 dígitos</span>
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

            <button
              type="submit"
              className={styles.cta}
              disabled={!isFormValid || status === "enviando"}
            >
              {status === "enviando" ? "Guardando..." : "Confirmar domicilio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
