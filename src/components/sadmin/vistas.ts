import { LayoutDashboard, CreditCard, Wallet, Calculator, Settings, Smartphone, CalendarDays, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Tabla única de vistas del panel: de acá salen el menú (escritorio y celular) y el
 * título + subtítulo de la topbar. Equivale a `TABS` en autovia-dashboard — tener una
 * sola fuente evita que el menú y el encabezado se desincronicen.
 */
export interface Vista {
  ruta: string;
  /** `end` de NavLink: solo la ruta índice necesita coincidencia exacta. */
  exacta?: boolean;
  titulo: string;
  subtitulo: string;
  icono: LucideIcon;
}

export interface GrupoVistas {
  grupo: string;
  vistas: Vista[];
}

export const GRUPOS: GrupoVistas[] = [
  {
    grupo: 'Análisis',
    vistas: [
      {
        ruta: '/sadmin',
        exacta: true,
        titulo: 'Resumen',
        subtitulo: 'Los indicadores de la cartera de un vistazo',
        icono: LayoutDashboard
      }
    ]
  },
  {
    grupo: 'Operación',
    vistas: [
      {
        ruta: '/sadmin/creditos',
        titulo: 'Créditos',
        subtitulo: 'Las solicitudes, una por una',
        icono: CreditCard
      },
      {
        ruta: '/sadmin/cobranza',
        titulo: 'Cobranza',
        subtitulo: 'Antigüedad de saldos y lista de llamadas del día',
        icono: Wallet
      },
      {
        ruta: '/sadmin/estado-cuenta',
        titulo: 'Estado de cuenta',
        subtitulo: 'Ficha completa de un crédito, lista para imprimir o mandar',
        icono: FileText
      }
    ]
  },
  {
    grupo: 'Flujo',
    vistas: [
      {
        ruta: '/sadmin/calendario',
        titulo: 'Calendario y flujo',
        subtitulo: 'Cuánto entra cada mes y cuánto quedó sin cobrar',
        icono: CalendarDays
      }
    ]
  },
  {
    grupo: 'Herramientas',
    vistas: [
      {
        ruta: '/sadmin/cotizador',
        titulo: 'Cotizador',
        subtitulo: 'Simula un crédito antes de cerrarlo',
        icono: Calculator
      },
      {
        ruta: '/sadmin/catalogo',
        titulo: 'Catálogo',
        subtitulo: 'Equipos a la venta, precios y fichas técnicas',
        icono: Smartphone
      }
    ]
  },
  {
    grupo: 'Control',
    vistas: [
      {
        ruta: '/sadmin/configuracion',
        titulo: 'Configuración',
        subtitulo: 'Parámetros del producto: enganche, tasa, IVA y cargos',
        icono: Settings
      }
    ]
  }
];

export const VISTAS: Vista[] = GRUPOS.flatMap((g) => g.vistas);

/** Vista activa para el `pathname` actual — la coincidencia más larga gana. */
export function vistaActiva(pathname: string): Vista {
  const limpio = pathname.replace(/\/+$/, '') || '/sadmin';
  return (
    VISTAS.filter((v) => limpio === v.ruta || limpio.startsWith(v.ruta + '/')).sort(
      (a, b) => b.ruta.length - a.ruta.length
    )[0] ?? VISTAS[0]
  );
}
