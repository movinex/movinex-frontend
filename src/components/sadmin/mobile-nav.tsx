import { useState } from 'react';
import { NavLink } from 'react-router';
import { LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GRUPOS } from './vistas';
import logoColor from '../../assets/movinex_color.svg';

interface MobileNavProps {
  onLogout: () => void;
}

export function MobileNav({ onLogout }: MobileNavProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="border-b bg-[var(--sidebar)] md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <img src={logoColor} alt="Movinex" className="h-5 w-auto" />
        <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú">
          <Menu className="size-5" />
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 overflow-y-auto bg-[var(--sidebar)] p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <img src={logoColor} alt="Movinex" className="h-5 w-auto" />
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
                <X className="size-5" />
              </button>
            </div>
            <nav>
              {GRUPOS.map(({ grupo, vistas }) => (
                <div key={grupo}>
                  <div className="nav-group-label">{grupo}</div>
                  {vistas.map(({ ruta, exacta, titulo, icono: Icono }) => (
                    <NavLink
                      key={ruta}
                      to={ruta}
                      end={exacta}
                      onClick={() => setAbierto(false)}
                      className={({ isActive }) => cn('nav-item', isActive && 'on')}
                    >
                      <Icono strokeWidth={1.6} />
                      {titulo}
                    </NavLink>
                  ))}
                </div>
              ))}
              <button type="button" onClick={onLogout} className="collapse-btn mt-3 border-t pt-3">
                <LogOut />
                Salir
              </button>
            </nav>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setAbierto(false)} />
        </div>
      )}
    </div>
  );
}
