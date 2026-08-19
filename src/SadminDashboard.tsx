import { Routes, Route } from 'react-router';
import './sadmin.css';
import { NavSidebar } from './components/sadmin/nav-sidebar';
import { MobileNav } from './components/sadmin/mobile-nav';
import { Toaster } from './components/ui/sonner';
import { ResumenView } from './components/sadmin/resumen-view';
import { CreditosView } from './components/sadmin/creditos-view';
import { CobranzaView } from './components/sadmin/cobranza-view';
import { CatalogoView } from './components/sadmin/catalogo-view';
import type { Phone, Solicitud } from './types';

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
  onUpdateStatus: (id: string, nuevoEstatus: Solicitud['estatus']) => Promise<void>;
  onCancelarSolicitud: (id: string) => Promise<void>;
  onSaveImei: (id: string, imei: string) => Promise<void>;
  onSaveDireccion: (id: string, direccion: DireccionInput) => Promise<void>;
  onProcesarRecordatorios: () => Promise<void>;
  onGenerarLinkTarjeta: (id: string) => Promise<string>;
  phones: Phone[];
  onReloadPhones: () => void;
  adminUser: any;
  adminToken: string | null;
  onLogout: () => void;
  onRefrescar: () => void;
  segundosParaRefresh: number;
}

export function SadminDashboard({
  solicitudes, onUpdateStatus, onCancelarSolicitud, onSaveImei, onSaveDireccion, onProcesarRecordatorios, onGenerarLinkTarjeta,
  phones, onReloadPhones, adminUser, adminToken, onLogout, onRefrescar, segundosParaRefresh
}: SadminDashboardProps) {
  return (
    <div className="sadmin-root flex h-screen overflow-hidden">
      <NavSidebar adminNombre={adminUser?.nombre} onLogout={onLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav onLogout={onLogout} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/30 p-4 md:p-8">
          <Routes>
            <Route index element={<ResumenView solicitudes={solicitudes} />} />
            <Route
              path="creditos"
              element={
                <CreditosView
                  solicitudes={solicitudes}
                  onUpdateStatus={onUpdateStatus}
                  onCancelarSolicitud={onCancelarSolicitud}
                  onSaveImei={onSaveImei}
                  onSaveDireccion={onSaveDireccion}
                  onRefrescar={onRefrescar}
                  segundosParaRefresh={segundosParaRefresh}
                />
              }
            />
            <Route
              path="cobranza"
              element={<CobranzaView solicitudes={solicitudes} onProcesarRecordatorios={onProcesarRecordatorios} onGenerarLinkTarjeta={onGenerarLinkTarjeta} />}
            />
            <Route
              path="catalogo"
              element={<CatalogoView phones={phones} onReloadPhones={onReloadPhones} adminToken={adminToken} />}
            />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
