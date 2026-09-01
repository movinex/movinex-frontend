import { useEffect, useState } from "react";
import type { Phone } from "../types";
import { CATALOGO_FOTOS_POPUP, getFotosCelular } from "../pages/landing/catalogo-data";

/** Carga el catálogo de celulares del backend y lo deja listo para pintar:
 *  mapea snake_case -> camelCase y precarga las fotos de tarjeta + pop-up
 *  antes de avisar `fotosListas`, para que mover el carrusel de la Tienda no
 *  se vea "trabado" esperando la red (las fotos viven en Supabase Storage). */
export function useCatalogo(activo: boolean, precargarFotos: boolean) {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [fotosListas, setFotosListas] = useState(false);

  useEffect(() => {
    if (!activo) return;
    setLoading(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';
    fetch(`${backendUrl}/api/celulares`)
      .then((res) => res.json())
      .then((data) => {
        const celularesMapeados = data.map((p: any) => ({
          id: p.id,
          modelo: p.modelo,
          marca: p.marca,
          precioBase: Number(p.precio_base),
          enganche: Number(p.enganche),
          montoSemanal26: Number(p.monto_semanal_26),
          montoSemanal52: Number(p.monto_semanal_52),
          totalPagar26: Number(p.monto_semanal_26) * 26 + Number(p.enganche),
          totalPagar52: Number(p.monto_semanal_52) * 52 + Number(p.enganche),
          ahorro26: 0,
          precioDescuento: p.precio_descuento != null ? Number(p.precio_descuento) : undefined,
          imagen: p.imagen_url || p.imagen || '',
          imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
          imagenesPopup: Array.isArray(p.imagenes_popup) ? p.imagenes_popup : [],
          gradienteInicio: p.gradiente_inicio || undefined,
          gradienteFin: p.gradiente_fin || undefined,
          envioGratis: p.envio_gratis !== false,
          costoEnvio: Number(p.costo_envio || 0),
          specsPantalla: p.specs_pantalla || '',
          specsProcesador: p.specs_procesador || '',
          specsRamAlmacenamiento: p.specs_ram_almacenamiento || '',
          specsMicrosd: p.specs_microsd || '',
          specsCamaraTrasera: p.specs_camara_trasera || '',
          specsCamaraFrontal: p.specs_camara_frontal || '',
          specsBateria: p.specs_bateria || '',
          specsSistema: p.specs_sistema || '',
          specsSeguridad: p.specs_seguridad || '',
          specsResistencia: p.specs_resistencia || '',
          specsConectividad: p.specs_conectividad || '',
          specsDimensionesPeso: p.specs_dimensiones_peso || ''
        }));
        setPhones(celularesMapeados);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar catálogo de celulares:", err);
        setPhones([]);
        setLoading(false);
      });
  }, [activo]);

  useEffect(() => {
    if (!precargarFotos || phones.length === 0) {
      if (!precargarFotos) setFotosListas(false);
      return;
    }
    setFotosListas(false);
    const urls = new Set<string>();
    phones.forEach((phone) => {
      getFotosCelular(phone).forEach((url) => urls.add(url));
      const fotosPopup = phone.imagenesPopup && phone.imagenesPopup.length > 0 ? phone.imagenesPopup : undefined;
      (fotosPopup || CATALOGO_FOTOS_POPUP[phone.id] || []).forEach((url) => urls.add(url));
    });
    let cancelado = false;
    Promise.all(
      Array.from(urls).map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = url;
          })
      )
    ).then(() => {
      if (!cancelado) setFotosListas(true);
    });
    return () => {
      cancelado = true;
    };
  }, [precargarFotos, phones]);

  return { phones, loading, fotosListas };
}
