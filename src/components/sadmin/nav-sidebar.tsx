import { NavLink } from 'react-router';
import { ChevronLeft, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRUPOS } from './vistas';
// Sidebar clara, así que va el logo a color — el `_blanco` que usa el resto del panel no
// se vería sobre fondo claro.
import logoColor from '../../assets/movinex_color.svg';

interface NavSidebarProps {
  adminNombre?: string;
  colapsada: boolean;
  onToggleColapsar: () => void;
  onLogout: () => void;
}

export function NavSidebar({ adminNombre, colapsada, onToggleColapsar, onLogout }: NavSidebarProps) {
  return (
    <aside
      className="hidden shrink-0 flex-col border-r bg-[var(--sidebar)] md:flex"
      style={{ width: 'var(--sb)', transition: 'width .18s ease' }}
    >
      <div className={cn('flex min-h-[66px] items-center gap-3 border-b px-4', colapsada && 'justify-center px-2')}>
        <img src={logoColor} alt="Movinex" className="h-5 w-auto shrink-0" />
        {!colapsada && (
          <div className="min-w-0 overflow-hidden whitespace-nowrap">
            <p className="text-[13.5px] font-semibold leading-tight tracking-[-.2px]">Super Admin</p>
            <p className="text-[11px] text-muted-foreground">Panel de control</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pb-5 pt-3">
        {GRUPOS.map(({ grupo, vistas }) => (
          <div key={grupo}>
            <div className="nav-group-label">{grupo}</div>
            {vistas.map(({ ruta, exacta, titulo, icono: Icono }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={exacta}
                title={titulo}
                className={({ isActive }) => cn('nav-item', isActive && 'on')}
              >
                <Icono strokeWidth={1.6} />
                <span className="nav-label">{titulo}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t p-2.5">
        {adminNombre && !colapsada && (
          <p className="truncate px-2.5 pb-2 text-[11px] text-muted-foreground">{adminNombre}</p>
        )}
        <button type="button" onClick={onLogout} className="collapse-btn" title="Cerrar sesión">
          <LogOut />
          <span className="sb-foot-txt">Salir</span>
        </button>
        <button
          type="button"
          onClick={onToggleColapsar}
          className="collapse-btn"
          title={colapsada ? 'Expandir menú' : 'Colapsar menú'}
        >
          <ChevronLeft className="chev" />
          <span className="sb-foot-txt">Colapsar</span>
        </button>
      </div>
    </aside>
  );
}
