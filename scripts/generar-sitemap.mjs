// Regenera public/sitemap.xml antes de cada build, agregando una entrada por cada
// celular del catálogo (/cotizar/:id). Sin esto el sitemap solo listaba las 7 páginas
// fijas y Google nunca descubría las páginas de producto, que son justo las que
// responden a búsquedas por modelo ("movinex g15").
//
// Si el backend no responde, deja el sitemap que ya está en public/ y sale con 0:
// un sitemap desactualizado es mucho mejor que un deploy caído.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_URL = 'https://www.movinex.mx';
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

const PAGINAS_FIJAS = [
  { ruta: '/', changefreq: 'weekly', priority: '1.0' },
  { ruta: '/tienda', changefreq: 'weekly', priority: '0.9' },
  { ruta: '/movinex', changefreq: 'monthly', priority: '0.6' },
  { ruta: '/terminos', changefreq: 'yearly', priority: '0.3' },
  { ruta: '/privacidad', changefreq: 'yearly', priority: '0.3' },
  { ruta: '/cookies', changefreq: 'yearly', priority: '0.3' },
  { ruta: '/envios', changefreq: 'yearly', priority: '0.3' }
];

const escaparXml = (valor) =>
  String(valor).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

const entrada = ({ ruta, changefreq, priority, lastmod }) =>
  `  <url>\n    <loc>${BASE_URL}${escaparXml(ruta)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

const hoy = new Date().toISOString().slice(0, 10);

let celulares = [];
try {
  const respuesta = await fetch(`${BACKEND_URL}/api/celulares`, { signal: AbortSignal.timeout(15000) });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  celulares = await respuesta.json();
  if (!Array.isArray(celulares)) throw new Error('El catálogo no devolvió un arreglo.');
} catch (error) {
  console.warn(`[sitemap] No se pudo leer el catálogo (${error.message}). Se deja el sitemap actual sin cambios.`);
  process.exit(0);
}

const urls = [
  ...PAGINAS_FIJAS.map((p) => entrada({ ...p, lastmod: hoy })),
  ...celulares
    .filter((c) => c?.id)
    .map((c) =>
      entrada({
        ruta: `/cotizar/${encodeURIComponent(c.id)}`,
        changefreq: 'weekly',
        priority: '0.8',
        lastmod: (c.updated_at || c.created_at || hoy).slice(0, 10)
      })
    )
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sitemap.xml');
writeFileSync(destino, xml, 'utf8');
console.log(`[sitemap] Generado con ${urls.length} URLs (${celulares.length} celulares).`);
