import { useState } from "react";

/** Índice de foto activa por id de celular — un state independiente por cada
 *  carrusel de la pantalla (p. ej. tarjeta de grilla vs. pop-up de detalles),
 *  para que moverse en uno no mueva el punto activo del otro. */
export function useCarrusel() {
  const [activos, setActivos] = useState<Record<string, number>>({});

  const activo = (id: string, totalFotos: number) => {
    const fallback = Math.floor((totalFotos - 1) / 2);
    return activos[id] ?? fallback;
  };

  const irAFoto = (id: string, index: number, totalFotos: number) => {
    setActivos((prev) => ({
      ...prev,
      [id]: (index + totalFotos) % totalFotos,
    }));
  };

  return { activo, irAFoto };
}
