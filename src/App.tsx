import { useState } from 'react';
import { Landing } from './Landing';
import { Cotizador } from './Cotizador';
import { Documentos } from './Documentos';
import type { Phone } from './types';

function App() {
  const [step, setStep] = useState<'landing' | 'cotizar' | 'documentos' | 'finalizado'>('landing');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [planSelected, setPlanSelected] = useState<{ semanas: number; pagoSemanal: number; enganche: number } | null>(null);

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

  if (step === 'landing') {
    return (
      <Landing
        onSelectPhone={(phone) => {
          setSelectedPhone(phone);
          setStep('cotizar');
        }}
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
        onFinalizado={handleVerificacionFinalizada}
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
      border: '1px solid #E4E8F1'
    }}>
      <h2 style={{ fontSize: '28px', color: '#0B1B3C', fontWeight: 800 }}>¡Gracias por elegir Movinex!</h2>
      <p style={{ margin: '20px 0', color: '#7A85A0', fontSize: '15px', lineHeight: 1.5 }}>
        Tu solicitud ha sido ingresada al sistema. En menos de 24 horas te contactaremos para validar el envío y activación de tu nuevo celular.
      </p>
      <button
        onClick={() => setStep('landing')}
        style={{
          background: 'linear-gradient(135deg,#2B6BE4,#3FC6F0)',
          color: '#ffffff',
          border: 'none',
          padding: '16px 32px',
          borderRadius: '16px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default App;
