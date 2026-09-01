import type { Phone } from "../../types";

// Catálogo (Tienda) — las 3 tarjetas de cada celular, recompuestas 1:1 desde el
// Figma: se tomó el celular recortado con transparencia de los frames de
// variantes (grupos "imagenes <celular>", nodos 708:9401/9408/9415/9422 y
// 773:6037..6059) y se lo colocó sobre su degradado en la posición y tamaño
// exactos que indica el diseño para cada vista. Ya vienen en el orden del
// carrusel: la combo va en el MEDIO.
// Tarjeta de la Tienda: ya con el gradiente pegado, tal cual las exportó la
// diseñadora (carpetas "assets diseño/<celular>/t{l,f,a}.png").
import catE151 from "../../assets/cat-e15-1.webp";
import catE152 from "../../assets/cat-e15-2.webp";
import catE153 from "../../assets/cat-e15-3.webp";
import catA171 from "../../assets/cat-a17-1.webp";
import catA172 from "../../assets/cat-a17-2.webp";
import catA173 from "../../assets/cat-a17-3.webp";
import catTabA111 from "../../assets/cat-taba11-1.webp";
import catTabA112 from "../../assets/cat-taba11-2.webp";
import catTabA113 from "../../assets/cat-taba11-3.webp";
import catG351 from "../../assets/cat-g35-1.webp";
import catG352 from "../../assets/cat-g35-2.webp";
import catG353 from "../../assets/cat-g35-3.webp";
import catG061 from "../../assets/cat-g06-1.webp";
import catG062 from "../../assets/cat-g06-2.webp";
import catG063 from "../../assets/cat-g06-3.webp";
import catG151 from "../../assets/cat-g15-1.webp";
import catG152 from "../../assets/cat-g15-2.webp";
import catG153 from "../../assets/cat-g15-3.webp";
import catA071 from "../../assets/cat-a07-1.webp";
import catA072 from "../../assets/cat-a07-2.webp";
import catA073 from "../../assets/cat-a07-3.webp";
import catHonor1 from "../../assets/cat-honor-1.webp";
import catHonor2 from "../../assets/cat-honor-2.webp";
import catHonor3 from "../../assets/cat-honor-3.webp";

// Pop-up de Detalles: el celular SOLO, transparente, alta resolución
// (carpetas "assets diseño/<celular>/d{l,f,a}.png") — el gradiente de fondo
// lo pone CATALOGO_FONDOS por CSS.
import popG061 from "../../assets/pop-g06-1.webp";
import popG062 from "../../assets/pop-g06-2.webp";
import popG063 from "../../assets/pop-g06-3.webp";
import popG151 from "../../assets/pop-g15-1.webp";
import popG152 from "../../assets/pop-g15-2.webp";
import popG153 from "../../assets/pop-g15-3.webp";
import popE151 from "../../assets/pop-e15-1.webp";
import popE152 from "../../assets/pop-e15-2.webp";
import popE153 from "../../assets/pop-e15-3.webp";
import popHonor1 from "../../assets/pop-honor-1.webp";
import popHonor2 from "../../assets/pop-honor-2.webp";
import popHonor3 from "../../assets/pop-honor-3.webp";
import popA071 from "../../assets/pop-a07-1.webp";
import popA072 from "../../assets/pop-a07-2.webp";
import popA073 from "../../assets/pop-a07-3.webp";
import popG351 from "../../assets/pop-g35-1.webp";
import popG352 from "../../assets/pop-g35-2.webp";
import popG353 from "../../assets/pop-g35-3.webp";
import popA171 from "../../assets/pop-a17-1.webp";
import popA172 from "../../assets/pop-a17-2.webp";
import popA173 from "../../assets/pop-a17-3.webp";
import popTabA111 from "../../assets/pop-taba11-1.webp";
import popTabA112 from "../../assets/pop-taba11-2.webp";
import popTabA113 from "../../assets/pop-taba11-3.webp";

// Las 3 vistas de cada celular, ya en el orden del carrusel: la combo (la foto
// "hero", mitad cámara / mitad pantalla) va en el PUNTO DEL MEDIO.
// Fallback local: `phone.imagenes` (cargado desde el sadmin) tiene prioridad.
export const CATALOGO_FOTOS: Record<string, string[]> = {
  Motorolag06: [catG061, catG062, catG063],
  Motorolag15: [catG151, catG152, catG153],
  "samsung-a07": [catA071, catA072, catA073],
  "HONOR Play10": [catHonor1, catHonor2, catHonor3],
  "Motorola g35": [catG351, catG352, catG353],
  samsunga17: [catA171, catA172, catA173],
  "Samsung A11 tab": [catTabA111, catTabA112, catTabA113],
  "Motorola E15": [catE151, catE152, catE153],
};

// Degradado de fondo de cada celular, copiado exacto del Figma (nodos 708:9060,
// 708:9076, 708:9091, 708:9107, 773:6218, 773:6221, 773:6280, 773:6283).
export const CATALOGO_FONDOS: Record<string, string> = {
  Motorolag06:
    "linear-gradient(230.54deg, rgb(17, 153, 175) 33.766%, rgb(28, 117, 131) 97.531%)",
  Motorolag15:
    "linear-gradient(155.51deg, rgb(20, 31, 85) 19.875%, rgb(52, 72, 200) 72.663%)",
  "samsung-a07":
    "linear-gradient(184.46deg, rgb(86, 64, 250) 29.83%, rgb(11, 27, 58) 95.031%)",
  "HONOR Play10":
    "linear-gradient(178.97deg, rgb(0, 166, 112) 21.064%, rgb(28, 117, 131) 98.128%)",
  "Motorola g35":
    "linear-gradient(236deg, rgb(243, 84, 77) 31.247%, rgb(82, 16, 15) 96.113%)",
  samsunga17:
    "linear-gradient(231.59deg, rgb(55, 109, 197) 31.798%, rgb(9, 56, 140) 93.108%)",
  "Samsung A11 tab":
    "linear-gradient(222.54deg, rgb(41, 215, 216) 17.003%, rgb(187, 255, 245) 69.675%)",
  "Motorola E15":
    "linear-gradient(-36.56deg, rgb(104, 125, 138) 3.6926%, rgb(50, 52, 122) 49.663%)",
};

export const FONDO_DEFAULT =
  "linear-gradient(230.54deg, rgb(17, 153, 175) 33.766%, rgb(28, 117, 131) 97.531%)";

// Fotos del celular SIN el fondo, para el pop-up de Detalles — el fondo lo
// pone CATALOGO_FONDOS por CSS. Mismo orden que CATALOGO_FOTOS (combo al medio).
export const CATALOGO_FOTOS_POPUP: Record<string, string[]> = {
  Motorolag06: [popG061, popG062, popG063],
  Motorolag15: [popG151, popG152, popG153],
  "Motorola E15": [popE151, popE152, popE153],
  "HONOR Play10": [popHonor1, popHonor2, popHonor3],
  "samsung-a07": [popA071, popA072, popA073],
  "Motorola g35": [popG351, popG352, popG353],
  samsunga17: [popA171, popA172, popA173],
  "Samsung A11 tab": [popTabA111, popTabA112, popTabA113],
};

// Nombre de vitrina prolijo — la base tiene marca/modelo con mayúsculas y
// espacios inconsistentes (p. ej. modelo "SAMSUNG A07" repitiendo la marca,
// o "Play10" sin espacio), así que para el catálogo se muestra este nombre
// fijo en vez de concatenar marca+modelo a lo bruto.
export const CATALOGO_NOMBRES: Record<string, string> = {
  "Motorola E15": "Motorola E15",
  samsunga17: "Samsung A17",
  "Samsung A11 tab": "Samsung Tab A11",
  "Motorola g35": "Motorola G35",
  Motorolag06: "Motorola G06",
  Motorolag15: "Motorola G15",
  "samsung-a07": "Samsung A07",
  "HONOR Play10": "Honor Play 10",
};

// Las 3 fotos de un celular, en orden [lateral, combo (la principal), lateral u
// atrás] — usada tanto por la tarjeta de la grilla como por el pop-up de detalles,
// para que ambos compartan exactamente el mismo criterio de fallback.
export const getFotosCelular = (phone: Phone): string[] =>
  phone.imagenes && phone.imagenes.length > 0
    ? phone.imagenes
    : CATALOGO_FOTOS[phone.id] || (phone.imagen ? [phone.imagen] : []);

// Nombre de vitrina de un celular: prioriza CATALOGO_NOMBRES, si no hay
// entrada arma "marca + modelo" a partir de los datos crudos del backend.
export const getNombreCelular = (phone: Phone): string =>
  CATALOGO_NOMBRES[phone.id] || `${(phone.marca || "").trim()} ${phone.modelo}`.trim();
