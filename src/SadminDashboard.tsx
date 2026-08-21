import { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router';
import './sadmin.css';
import { cn } from './lib/utils';
import { NavSidebar } from './components/sadmin/nav-sidebar';
import { MobileNav } from './components/sadmin/mobile-nav';
import { Topbar } from './components/sadmin/topbar';
import { Toaster } from './components/ui/sonner';
import { ResumenView } from './components/sadmin/resumen-view';
import { CreditosView } from './components/sadmin/creditos-view';
import { CobranzaView } from './components/sadmin/cobranza-view';
import { CatalogoView } from './components/sadmin/catalogo-view';
import { ConfiguracionView } from './components/sadmin/configuracion-view';
import { CotizadorView } from './components/sadmin/cotizador-view';
import { CalendarioView } from './components/sadmin/calendario-view';
import { EstadoCuentaView } from './components/sadmin/estado-cuenta-view';
import { DashboardSkeleton } from './components/sadmin/dashboard-skeleton';
import type { Configuracion, Phone, Solicitud } from './types';
import { construirCartera, type Pago } from './lib/cartera';

const SIDEBAR_KEY = 'movinex_sadmin_sidebar_colapsada';

interface DireccionInput {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  alcaldiaMunicipio: string;
  estado: string;
  codigoPostal: string;
}

interface SadminDashboardProps {
  solicitudes: Solicitud[];
  pagos: Pago[];
  cargandoDatos: boolean;
  onUpdateStatus: (id: string, nuevoEstatus: Solicitud['estatus']) => Promise<void>;
  onCancelarSolicitud: (id: string) => Promise<void>;
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onProcesarRecordatorios: () => Promise<void>;
  onGenerarLinkTarjeta: (id: string) => Promise<string>;
  configuracion: Configuracion | null;
  onGuardarConfiguracion: (config: Configuracion) => Promise<void>;
  phones: Phone[];
  onReloadPhones: () => void;
  adminUser: any;
  adminToken: string | null;
  onLogout: () => void;
  onRefrescar: () => void;
  segundosParaRefresh: number;
  backendUrl: string;
}

export function SadminDashboard({
  solicitudes, pagos, cargandoDatos, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onProcesarRecordatorios, onGenerarLinkTarjeta,
  configuracion, onGuardarConfiguracion,
  phones, onReloadPhones, adminUser, adminToken, onLogout, onRefrescar, segundosParaRefresh, backendUrl
}: SadminDashboardProps) {
  const [colapsada, setColapsada] = useState(() => localStorage.getItem(SIDEBAR_KEY) === '1');

  // El estado de cada crédito (atraso, mora, bucket, avance) se deriva una sola vez y
  // se comparte entre las cuatro vistas que lo consumen. Se recalcula cuando llegan
  // datos nuevos del refresco de 60 s, así que "hoy" nunca queda viejo.
  const cartera = useMemo(() => construirCartera(solicitudes, pagos), [solicitudes, pagos]);

  const toggleColapsar = () => {
    setColapsada((actual) => {
      localStorage.setItem(SIDEBAR_KEY, actual ? '0' : '1');
      return !actual;
    });
  };

  return (
    <div className={cn('sadmin-root flex h-screen overflow-hidden', colapsada && 'collapsed')}>
      <NavSidebar
        adminNombre={adminUser?.nombre}
        colapsada={colapsada}
        onToggleColapsar={toggleColapsar}
        onLogout={onLogout}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav onLogout={onLogout} />
        {/* El scroll vive acá, no en <main>, para que la topbar quede sticky por encima
            del contenido y el sidebar no crezca con la página. */}
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar adminNombre={adminUser?.nombre} onRefrescar={onRefrescar} segundosParaRefresh={segundosParaRefresh} />
          <main className="content min-w-0">
            {cargandoDatos ? (
              <DashboardSkeleton />
            ) : (
            <Routes>
              <Route index element={<ResumenView cartera={cartera} />} />
              <Route
                path="creditos"
                element={
                  <CreditosView
                    solicitudes={solicitudes}
                    onUpdateStatus={onUpdateStatus}
                    onCancelarSolicitud={onCancelarSolicitud}
                    onSaveImei={onSaveImei}
                    onSaveDireccion={onSaveDireccion}
                  />
                }
              />
              <Route
                path="cobranza"
                element={<CobranzaView cartera={cartera} onProcesarRecordatorios={onProcesarRecordatorios} onGenerarLinkTarjeta={onGenerarLinkTarjeta} />}
              />
              <Route path="calendario" element={<CalendarioView cartera={cartera} />} />
              <Route path="estado-cuenta" element={<EstadoCuentaView cartera={cartera} />} />
              <Route path="estado-cuenta/:id" element={<EstadoCuentaView cartera={cartera} />} />
              <Route
                path="catalogo"
                element={<CatalogoView phones={phones} onReloadPhones={onReloadPhones} adminToken={adminToken} configuracion={configuracion} />}
              />
              <Route
                path="configuracion"
                element={<ConfiguracionView configuracion={configuracion} onGuardar={onGuardarConfiguracion} />}
              />
              <Route
                path="cotizador"
                element={<CotizadorView configuracion={configuracion} backendUrl={backendUrl} adminToken={adminToken} />}
              />
            </Routes>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
