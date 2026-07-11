import { useState, useEffect } from 'react';
import { Landing } from './Landing';
import { Cotizador } from './Cotizador';
import { Documentos } from './Documentos';
import { Admin } from './Admin';
import type { Phone, Solicitud } from './types';

const SEED_SOLICITUDES: Solicitud[] = [
  {
    id: 'sol-1',
    cliente: 'Carlos Mendoza Ruiz',
    celular: '5543210987',
    email: 'carlos.mendoza@gmail.com',
    modelo: 'Samsung Galaxy A07',
    enganche: 375,
    semanas: 26,
    pagoSemanal: 167,
    estatus: 'Pendiente',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // hace 2 horas
    ineFrente: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">INE FRENTE - Carlos Mendoza</text></svg>',
    ineReverso: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23475569">INE REVERSO - Carlos Mendoza</text></svg>',
    selfie: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="%23fed7aa"/><circle cx="100" cy="80" r="40" fill="%23ea580c"/><path d="M40 160 C40 120, 160 120, 160 160" fill="%23ea580c"/></svg>'
  },
  {
    id: 'sol-2',
    cliente: 'Ana Sofía Garza',
    celular: '8118273645',
    email: 'ana.garza@outlook.com',
    modelo: 'iPhone 15 Pro Max',
    enganche: 3699,
    semanas: 52,
    pagoSemanal: 285,
    estatus: 'Aprobado',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // hace 1 día
    ineFrente: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%2364748b">INE FRENTE - Ana Garza</text></svg>',
    ineReverso: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="%23cbd5e1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23475569">INE REVERSO - Ana Garza</text></svg>',
    selfie: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="100%" height="100%" fill="%23fbcfe8"/><circle cx="100" cy="80" r="40" fill="%23db2777"/><path d="M40 160 C40 120, 160 120, 160 160" fill="%23db2777"/></svg>'
  }
];

function App() {
  const [view, setView] = useState<'tienda' | 'dashboard'>('tienda');
  const [step, setStep] = useState<'landing' | 'cotizar' | 'documentos' | 'finalizado'>('landing');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [planSelected, setPlanSelected] = useState<{ semanas: number; pagoSemanal: number; enganche: number } | null>(null);
  
  // Estado de solicitudes compartido y persistido
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(() => {
    const localData = localStorage.getItem('movinex_solicitudes');
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (e) {
        console.error('Error al parsear solicitudes locales', e);
      }
    }
    return SEED_SOLICITUDES;
  });

  useEffect(() => {
    localStorage.setItem('movinex_solicitudes', JSON.stringify(solicitudes));
  }, [solicitudes]);

  const handleCotizacionFinalizada = (data: { semanas: number; pagoSemanal: number; enganche: number }) => {
    setPlanSelected(data);
    setStep('documentos');
  };

  const handleVerificacionFinalizada = (nuevaSolicitud?: Omit<Solicitud, 'id' | 'estatus' | 'fecha'>) => {
    if (nuevaSolicitud) {
      const solicitudCompleta: Solicitud = {
        ...nuevaSolicitud,
        id: `sol-${Date.now()}`,
        estatus: 'Aprobado', // El n8n aprobó al usuario
        fecha: new Date().toISOString()
      };
      setSolicitudes(prev => [solicitudCompleta, ...prev]);
    }
    setStep('finalizado');
  };

  const handleVolver = () => {
    setStep('landing');
  };

  const handleUpdateStatus = (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => {
    setSolicitudes(prev =>
      prev.map(s => (s.id === id ? { ...s, estatus: nuevoEstatus } : s))
    );
  };

  if (view === 'dashboard') {
    return (
      <Admin
        solicitudes={solicitudes}
        onUpdateStatus={handleUpdateStatus}
        onVolver={() => setView('tienda')}
      />
    );
  }

  // Render tienda steps
  if (step === 'landing') {
    return (
      <Landing
        onSelectPhone={(phone) => {
          setSelectedPhone(phone);
          setStep('cotizar');
        }}
        onNavigateAdmin={() => setView('dashboard')}
      />
    );
  }

  if (step === 'cotizar' && selectedPhone) {
    return (
      <Cotizador
        phone={selectedPhone}
        onSiguiente={handleCotizacionFinalizada}
        onVolver={handleVolver}
      />
    );
  }

  if (step === 'documentos' && planSelected && selectedPhone) {
    return (
      <Documentos
        planData={{
          ...planSelected,
          modelo: selectedPhone.modelo
        }}
        onFinalizado={(datosCliente) => handleVerificacionFinalizada(datosCliente)}
        onVolver={() => setStep('cotizar')}
      />
    );
  }

  return (
    <div style={{
      maxWidth: '480px',
      margin: '80px auto',
      padding: '40px 20px',
      textAlign: 'center',
      background: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 14px 44px rgba(11,27,60,.10)',
      border: '1px solid #E4E8F1',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h2 style={{ fontSize: '28px', color: '#0B1B3C', fontWeight: 800 }}>¡Gracias por elegir Movinex!</h2>
      <p style={{ margin: '20px 0', color: '#7A85A0', fontSize: '15px', lineHeight: 1.5 }}>
        Tu solicitud ha sido ingresada al sistema y aprobada con éxito. En menos de 24 horas te contactaremos para coordinar el envío de tu nuevo celular {selectedPhone?.modelo}.
      </p>
      <button
        onClick={() => {
          setStep('landing');
          setSelectedPhone(null);
          setPlanSelected(null);
        }}
        style={{
          background: 'linear-gradient(135deg,#2B6BE4,#3FC6F0)',
          color: '#ffffff',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 8px 16px rgba(43, 107, 228, 0.2)',
          fontSize: '15px'
        }}
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default App;
