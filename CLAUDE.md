# Movinex Frontend

SPA de venta de celulares a crédito (React 19 + Vite 8 + TypeScript, CSS Modules). Repo hermano: `../movinex-backend` (Express, desplegado en Railway). Contexto de negocio completo en `../PROPUESTA_TECNICA.md`.

## Estructura

Componentes de página grandes siguen sueltos en `src/` (`Admin.tsx`, `App.tsx`, `Documentos.tsx`, `LegalContent.tsx` — pendientes de partir igual que Landing). `Landing.tsx` ya se componentizó (2026-09-01) y sirve de referencia del patrón a seguir:

- `App.tsx` — shell principal, fetch de solicitudes/catálogo, navegación entre vistas.
- `Landing.tsx` — shell delgado (128 líneas) que solo decide qué página de `pages/landing/` renderizar según la URL. NO le agregues JSX ni lógica de negocio de vuelta — si algo crece, va a `pages/landing/` o `components/landing/`.
  - `pages/landing/InicioPage.tsx`, `QuienesSomosPage.tsx`, `TiendaPage.tsx` — una página por ruta.
  - `pages/landing/catalogo-data.ts` — imports de imágenes del catálogo + diccionarios (fotos/fondos/nombres por id de celular) + helpers `getFotosCelular`/`getNombreCelular`.
  - `pages/landing/types.ts` — `LandingPage`, `PAGE_META` (title/description SEO por página).
  - `components/landing/Header.tsx`, `Footer.tsx`, `BannerPromo.tsx`, `FaqSection.tsx`, `PhoneCard.tsx`, `QuickViewModal.tsx` — piezas visuales reutilizadas entre páginas.
  - `hooks/useCatalogo.ts` — fetch + mapeo snake_case→camelCase + precarga de fotos del catálogo.
  - `hooks/useCarrusel.ts` — patrón "índice de foto activa por id de celular" (usado por `PhoneCard` y `QuickViewModal`, cada uno con su propio state independiente).
  - Sigue usando un solo `Landing.module.css` compartido por todos los sub-componentes (no se partió) — las clases CSS Modules siguen siendo `styles.xxx` en cada archivo.
- `Cotizador.tsx` — simulador de cuotas.
- `Documentos.tsx` — flujo KYC: captura de selfie + INE, envío a backend en Base64.
- `Admin.tsx` / `Sadmin.tsx` — panel admin y **superadmin** (login propio contra `/api/admin/login`, gestiona catálogo de celulares).
- `LegalContent.tsx` — términos, privacidad, cookies, envíos (contenido fuente en `../Avisos/*.md`).
- `Domicilio.tsx` — paso 2 de 3 post-pago: domicilio estructurado para Skydropx.
- `components/sadmin/` — ya estaba bien componentizado desde antes (una vista por archivo); es el otro ejemplo a imitar al partir el resto.

El frontend no tiene cliente de Supabase propio ni sus keys — todo lo que lee o escribe pasa por el backend (incluida la subida de imágenes del catálogo, vía `POST /api/celulares/imagen`).

## Variables de entorno (`.env`, no se sube a git)

- `VITE_BACKEND_URL` — API backend. Fallback hardcodeado en varios componentes: `https://movinex-backend-production.up.railway.app` (Railway prod).

## Backend (API que consume)

- `GET /api/celulares`, `GET/POST/PUT/DELETE` para catálogo (admin), `POST /api/celulares/imagen` para subir fotos.
- `GET/POST /api/solicitudes` — solicitudes de crédito (KYC + datos del cliente); `GET /api/solicitudes/estatus` — polling liviano de pago confirmado; `POST /api/solicitudes/:id/domicilio` — domicilio post-pago (genera guía en Skydropx).
- `PATCH /api/solicitudes/:id` (admin) también acepta `celular` (2026-08-25) — usado por `SolicitudesView` (detalle de solicitud en /sadmin) para corregir el número al que le llegan las alertas, con edición inline junto al link de WhatsApp.
- `GET /api/admin/solicitudes/:id/mensajes` (2026-08-25) — historial de WhatsApp mandados a una solicitud; `SolicitudesView` lo pinta en una sección nueva del detalle ("Mensajes enviados"). Es enteramente nuestro propio registro — Meta no expone ningún endpoint de consulta de mensajes ya enviados.
- `POST /api/admin/login` — login del panel admin.
- Webhooks (`/api/webhooks/stripe`, `/api/webhooks/verificacion-cliente`) y `/api/mdm/command` no los llama el frontend directamente.

## Pago del enganche (Stripe, ago 2026)

`Documentos.tsx` pide `POST /api/solicitudes/:id/crear-orden-enganche`, que devuelve una `checkoutUrl` de Stripe Checkout, y hace `window.location.href` a esa URL — el pago ocurre 100% en la página hosteada por Stripe, no hay Elements ni SDK de Stripe cargado en el frontend. Stripe regresa al cliente a `/domicilio?solicitud={id}&modelo={modelo}` si paga, o a `/` si cancela. **Ojo:** como es un redirect completo (no un `navigate()` de React Router), al cancelar se pierde el estado en memoria de `App.tsx` (`selectedPhone`/`planSelected`) — el cliente vuelve a la home y tiene que rehacer la cotización, aunque su solicitud (KYC ya enviado) sigue viva en la base. `/domicilio` sí sobrevive el reload porque lee `solicitud`/`modelo` de la URL vía `useSearchParams`, no de estado en memoria.

## Pendientes conocidos

- Mejorar calidad de imágenes del catálogo (MX-0045).
