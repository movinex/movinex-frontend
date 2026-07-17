import { useState, useEffect } from 'react';
import { Landing } from './Landing';
import { Cotizador } from './Cotizador';
import { Documentos } from './Documentos';
import { Admin } from './Admin';
import type { Phone, Solicitud } from './types';



function App() {
  const [view, setView] = useState<'tienda' | 'dashboard'>('tienda');
  const [step, setStep] = useState<'landing' | 'cotizar' | 'documentos' | 'finalizado'>('landing');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [planSelected, setPlanSelected] = useState<{ semanas: number; pagoSemanal: number; enganche: number } | null>(null);
  
  // Estado de solicitudes compartido y persistido
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  // Cargar solicitudes del backend al inicializar o al abrir el dashboard
  useEffect(() => {
    if (view === 'dashboard') {
      fetch('http://localhost:5000/api/solicitudes')
        .then(res => res.json())
        .then(data => {
          // Adaptar campos de base de datos snake_case a camelCase si es necesario
          const solicitudesAdaptadas = data.map((s: any) => ({
            id: s.id,
            cliente: s.cliente,
            celular: s.celular,
            email: s.email,
            modelo: s.modelo,
            enganche: s.enganche,
            semanas: s.semanas,
            pagoSemanal: s.pago_semanal,
            estatus: s.estatus,
            fecha: s.created_at || s.fecha,
            ineFrente: s.ine_frente,
            ineReverso: s.ine_reverso,
            selfie: s.selfie
          }));
          setSolicitudes(solicitudesAdaptadas);
        })
        .catch(err => console.error('Error al cargar solicitudes del backend:', err));
    }
  }, [view]);

  const handleCotizacionFinalizada = (data: { semanas: number; pagoSemanal: number; enganche: number }) => {
    setPlanSelected(data);
    setStep('documentos');
  };

  const handleVerificacionFinalizada = () => {
    setStep('finalizado');
  };

  const handleVolver = () => {
    setStep('landing');
  };

  const handleUpdateStatus = async (id: string, nuevoEstatus: 'Aprobado' | 'Rechazado') => {
    try {
      const response = await fetch(`http://localhost:5000/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estatus: nuevoEstatus })
      });

      if (response.ok) {
        setSolicitudes(prev =>
          prev.map(s => (s.id === id ? { ...s, estatus: nuevoEstatus } : s))
        );
      } else {
        console.error('Error al actualizar estatus en backend');
      }
    } catch (err) {
      console.error('Error en patch request:', err);
    }
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
        onFinalizado={() => handleVerificacionFinalizada()}
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
