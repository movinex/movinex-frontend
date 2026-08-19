import { useState } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, CreditCard, Wallet, Smartphone, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import logoColor from '../../assets/movinex_color.svg';

const ENLACES = [
  { to: '/sadmin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/sadmin/creditos', label: 'Créditos', icon: CreditCard, end: false },
  { to: '/sadmin/cobranza', label: 'Cobranza', icon: Wallet, end: false },
  { to: '/sadmin/catalogo', label: 'Catálogo', icon: Smartphone, end: false }
];

interface MobileNavProps {
  onLogout: () => void;
}

export function MobileNav({ onLogout }: MobileNavProps) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="border-b bg-sidebar text-sidebar-foreground md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <img src={logoColor} alt="Movinex" className="h-5 w-auto" />
        <button type="button" onClick={() => setAbierto(true)} aria-label="Abrir menú">
          <Menu className="size-5" />
        </button>
      </div>

      {abierto && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar p-4 text-sidebar-foreground">
            <div className="mb-4 flex items-center justify-between">
              <img src={logoColor} alt="Movinex" className="h-5 w-auto" />
              <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar menú">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {ENLACES.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setAbierto(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium',
                      isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70'
                    )
                  }
                >
                  <Icon className="size-4" />
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex items-center gap-3 rounded-md border-t border-sidebar-border px-3 pt-3 text-sm font-medium text-sidebar-foreground/70"
              >
                <LogOut className="size-4" />
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
