import { useLocation } from 'react-router';
import { RefreshCw } from 'lucide-react';
import { vistaActiva } from './vistas';

interface TopbarProps {
  adminNombre?: string;
  onRefrescar: () => void;
  segundosParaRefresh: number;
}

/**
 * Encabezado fijo con el título y el subtítulo de la vista actual. Reemplaza a los
 * `<h1 className="text-2xl">` que cada vista traía adentro: así el título no scrollea con
 * el contenido y todas las vistas arrancan directo con sus datos.
 */
export function Topbar({ adminNombre, onRefrescar, segundosParaRefresh }: TopbarProps) {
  const { pathname } = useLocation();
  const vista = vistaActiva(pathname);

  return (
    <header className="topbar">
      <div className="tb-1">
        <div className="min-w-0">
          <h1>{vista.titulo}</h1>
          <div className="sub">{vista.subtitulo}</div>
        </div>
        <div className="flex-1" />
        {/* El refresco es global (App.tsx repolla cada 60 s), así que vive acá y no
            dentro de la vista de Créditos como estaba antes. */}
        <button type="button" className="ctl" onClick={onRefrescar} title="Traer los datos más recientes">
          <RefreshCw strokeWidth={1.7} />
          <span className="hidden sm:inline">Refrescar ({segundosParaRefresh}s)</span>
        </button>
        {adminNombre && (
          <span className="usr hidden lg:inline-flex">
            <b>{adminNombre}</b>
            <span className="rol">Admin</span>
          </span>
        )}
      </div>
    </header>
  );
}
