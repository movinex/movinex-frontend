# Movinex Frontend

SPA de venta de celulares a crédito (React 19 + Vite 8 + TypeScript, CSS Modules). Repo hermano: `../movinex-backend` (Express, desplegado en Railway). Contexto de negocio completo en `../PROPUESTA_TECNICA.md`.

## Estructura

Todo vive plano en `src/`, sin carpetas `components/`/`pages/` (proyecto chico, revisar si conviene ordenar cuando crezca):

- `App.tsx` — shell principal, fetch de solicitudes/catálogo, navegación entre vistas.
- `Landing.tsx` — home pública, catálogo de celulares.
- `Cotizador.tsx` — simulador de cuotas.
- `Documentos.tsx` — flujo KYC: captura de selfie + INE, envío a backend en Base64.
- `Admin.tsx` / `Sadmin.tsx` — panel admin y **superadmin** (login propio contra `/api/admin/login`, gestiona catálogo de celulares).
- `LegalContent.tsx` — términos, privacidad, cookies, envíos (contenido fuente en `../Avisos/*.md`).
- `Domicilio.tsx` — paso 2 de 3 post-pago: domicilio estructurado para Skydropx.

El frontend no tiene cliente de Supabase propio ni sus keys — todo lo que lee o escribe pasa por el backend (incluida la subida de imágenes del catálogo, vía `POST /api/celulares/imagen`).

## Variables de entorno (`.env`, no se sube a git)

- `VITE_BACKEND_URL` — API backend. Fallback hardcodeado en varios componentes: `https://movinex-backend-production.up.railway.app` (Railway prod).

## Backend (API que consume)

- `GET /api/celulares`, `GET/POST/PUT/DELETE` para catálogo (admin), `POST /api/celulares/imagen` para subir fotos.
- `GET/POST /api/solicitudes` — solicitudes de crédito (KYC + datos del cliente); `GET /api/solicitudes/estatus` — polling liviano de pago confirmado; `POST /api/solicitudes/:id/domicilio` — domicilio post-pago (genera guía en Skydropx).
- `POST /api/admin/login` — login del panel admin.
- Webhooks (`/api/webhooks/conekta`, `/api/webhooks/verificacion-cliente`) y `/api/mdm/command` no los llama el frontend directamente.

## Pendientes conocidos

- Mejorar calidad de imágenes del catálogo (MX-0045).
