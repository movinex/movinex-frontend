import { NavLink } from 'react-router';
import { LayoutDashboard, CreditCard, Wallet, Smartphone, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
// Sidebar clara (igual que el mockup), así que va el logo a color — el `_blanco` que
// usa el resto del panel no se vería sobre fondo claro.
import logoColor from '../../assets/movinex_color.svg';

const ENLACES = [
  { to: '/sadmin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/sadmin/creditos', label: 'Créditos', icon: CreditCard, end: false },
  { to: '/sadmin/cobranza', label: 'Cobranza', icon: Wallet, end: false },
  { to: '/sadmin/catalogo', label: 'Catálogo', icon: Smartphone, end: false }
];

interface NavSidebarProps {
  adminNombre?: string;
  onLogout: () => void;
}

export function NavSidebar({ adminNombre, onLogout }: NavSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <img src={logoColor} alt="Movinex" className="h-5 w-auto" />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-none">Super Admin</p>
          <p className="mt-1 text-xs text-sidebar-foreground/60">Panel de control</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ENLACES.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        {adminNombre && <p className="truncate px-3 pb-2 text-xs text-sidebar-foreground/60">{adminNombre}</p>}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
          Salir
        </button>
      </div>
    </aside>
  );
}
