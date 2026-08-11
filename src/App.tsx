import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import { Landing } from './Landing';
import { Cotizador } from './Cotizador';
import { Documentos } from './Documentos';
import { Domicilio } from './Domicilio';
import { Admin } from './Admin';
import { SadminPortal, SadminLogin } from './Sadmin';
import type { Phone, Solicitud } from './types';
import landingStyles from './Landing.module.css';

// Mismo loader de página completa que la carga inicial de la app (Landing.tsx) — sin
// texto, solo el spinner, para que todos los estados de carga se vean iguales.
function PageLoader() {
  return (
    <div className={landingStyles.pageLoaderOverlay}>
      <div className={landingStyles.loaderContent}>
        <div className={landingStyles.spinner}></div>
      </div>
    </div>
  );
}

interface PlanSeleccionado {
  semanas: number;
  pagoSemanal: number;
  enganche: number;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [planSelected, setPlanSelected] = useState<PlanSeleccionado | null>(null);
  const [solicitudPagadaId, setSolicitudPagadaId] = useState<string | null>(null);
  const [modeloPagado, setModeloPagado] = useState<string | null>(null);

  // Estado de solicitudes compartido y persistido
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [phones, setPhones] = useState<Phone[]>([]);
  const [phonesLoaded, setPhonesLoaded] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Sesión de Super Admin (JWT emitido por /api/admin/login), compartida entre /dashboard y /sadmin
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  // Cargar solicitudes del backend al abrir /dashboard o /sadmin, y refrescar solas
  // cada 1 minuto mientras quede abierto (requiere sesión de admin).
  useEffect(() => {
    const esRutaAdmin = location.pathname === '/dashboard' || location.pathname === '/sadmin';
    if (!(esRutaAdmin && adminToken)) return;

    const cargarSolicitudes = () => {
      fetch(`${backendUrl}/api/solicitudes`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
        .then(res => {
          if (res.status === 401) {
            setAdminUser(null);
            setAdminToken(null);
            throw new Error('Sesión expirada.');
          }
          return res.json();
        })
        .then(data => {
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
            selfie: s.selfie,
            pagoConfirmado: s.pago_confirmado === true,
            calle: s.calle,
            numeroExterior: s.numero_exterior,
            numeroInterior: s.numero_interior,
            colonia: s.colonia,
            alcaldiaMunicipio: s.alcaldia_municipio,
            estado: s.estado,
            codigoPostal: s.codigo_postal,
            trackingNumber: s.tracking_number,
            labelUrl: s.label_url,
            imei: s.imei,
            reciboUrl: s.stripe_receipt_url
          }));
          setSolicitudes(solicitudesAdaptadas);
        })
        .catch(err => console.error('Error al cargar solicitudes del backend:', err));
    };

    cargarSolicitudes();
    const interval = setInterval(cargarSolicitudes, 60000);
    return () => clearInterval(interval);
  }, [location.pathname, backendUrl, adminToken]);

  // Cargar lista de celulares para alimentar el CRUD
  useEffect(() => {
    fetch(`${backendUrl}/api/celulares`)
      .then(res => res.json())
      .then(data => {
        const celularesMapeados = data.map((p: any) => ({
          id: p.id,
          modelo: p.modelo,
          marca: p.marca,
          precioBase: Number(p.precio_base),
          enganche: Number(p.enganche),
          montoSemanal26: Number(p.monto_semanal_26),
          montoSemanal52: Number(p.monto_semanal_52),
          totalPagar26: Number(p.monto_semanal_26) * 26 + Number(p.enganche),
          totalPagar52: Number(p.monto_semanal_52) * 52 + Number(p.enganche),
          imagen: p.imagen_url || p.imagen || '',
          envioGratis: p.envio_gratis !== false,
          costoEnvio: Number(p.costo_envio || 0),
          specsPantalla: p.specs_pantalla || '',
          specsProcesador: p.specs_procesador || '',
          specsRamAlmacenamiento: p.specs_ram_almacenamiento || '',
          specsMicrosd: p.specs_microsd || '',
          specsCamaraTrasera: p.specs_camara_trasera || '',
          specsCamaraFrontal: p.specs_camara_frontal || '',
          specsBateria: p.specs_bateria || '',
          specsSistema: p.specs_sistema || '',
          specsSeguridad: p.specs_seguridad || '',
          specsResistencia: p.specs_resistencia || '',
          specsConectividad: p.specs_conectividad || '',
          specsDimensionesPeso: p.specs_dimensiones_peso || ''
        }));
        setPhones(celularesMapeados);
        setPhonesLoaded(true);
      })
      .catch(err => {
        console.error('Error al cargar celulares:', err);
        setPhones([]);
        setPhonesLoaded(true);
      });
  }, [reloadTrigger, backendUrl]);

  const handleCotizacionFinalizada = (data: PlanSeleccionado) => {
    setPlanSelected(data);
    navigate('/documentos');
  };

  const handleUpdateStatus = async (id: string, nuevoEstatus: Solicitud['estatus']) => {
    const response = await fetch(`${backendUrl}/api/solicitudes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify({ estatus: nuevoEstatus })
    });

    if (!response.ok) {
      const res = await response.json().catch(() => ({}));
      throw new Error(res.error || 'No se pudo actualizar el estatus.');
    }

    setSolicitudes(prev =>
      prev.map(s => (s.id === id ? { ...s, estatus: nuevoEstatus } : s))
    );
  };

  const handleSaveImei = async (id: string, imei: string) => {
    const response = await fetch(`${backendUrl}/api/solicitudes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
      },
      body: JSON.stringify({ imei })
    });

    if (!response.ok) {
      const res = await response.json().catch(() => ({}));
      throw new Error(res.error || 'No se pudo guardar el IMEI.');
    }

    setSolicitudes(prev => prev.map(s => (s.id === id ? { ...s, imei } : s)));
  };

  const handleSaveDireccion = async (id: string, direccion: {
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    alcaldiaMunicipio: string;
    estado: string;
    codigoPostal: string;
  }) => {
    const response = await fetch(`${backendUrl}/api/solicitudes/${id}/domicilio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calle: direccion.calle,
        numero_exterior: direccion.numeroExterior,
        numero_interior: direccion.numeroInterior,
        colonia: direccion.colonia,
        alcaldia_municipio: direccion.alcaldiaMunicipio,
        estado: direccion.estado,
        codigo_postal: direccion.codigoPostal
      })
    });

    const res = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(res.error || 'No se pudo guardar el domicilio.');
    }

    setSolicitudes(prev =>
      prev.map(s => (s.id === id ? {
        ...s,
        ...direccion,
        trackingNumber: res.trackingNumber || s.trackingNumber,
        labelUrl: res.labelUrl || s.labelUrl
      } : s))
    );
  };

  return (
    <Routes>
      <Route
        path="/sadmin"
        element={
          <SadminPortal
            solicitudes={solicitudes}
            onUpdateStatus={handleUpdateStatus}
            onSaveImei={handleSaveImei}
            onSaveDireccion={handleSaveDireccion}
            onVolver={() => navigate('/')}
            onVolverTienda={() => navigate('/tienda')}
            phones={phones}
            onReloadPhones={() => setReloadTrigger(prev => prev + 1)}
            adminUser={adminUser}
            adminToken={adminToken}
            onLoginSuccess={(user, token) => {
              setAdminUser(user);
              setAdminToken(token);
            }}
            onLogout={() => {
              setAdminUser(null);
              setAdminToken(null);
            }}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          !adminUser || !adminToken ? (
            <SadminLogin
              onLoginSuccess={(user, token) => {
                setAdminUser(user);
                setAdminToken(token);
              }}
              onVolver={() => navigate('/')}
            />
          ) : (
            <Admin
              solicitudes={solicitudes}
              onUpdateStatus={handleUpdateStatus}
              onSaveImei={handleSaveImei}
              onSaveDireccion={handleSaveDireccion}
              onVolver={() => navigate('/tienda')}
            />
          )
        }
      />

      <Route
        path="/cotizar/:phoneId"
        element={
          <CotizarRoute
            phones={phones}
            phonesLoaded={phonesLoaded}
            selectedPhone={selectedPhone}
            setSelectedPhone={setSelectedPhone}
            onSiguiente={handleCotizacionFinalizada}
          />
        }
      />

      <Route
        path="/documentos"
        element={
          <DocumentosRoute selectedPhone={selectedPhone} planSelected={planSelected} />
        }
      />

      <Route
        path="/domicilio"
        element={
          <DomicilioRoute
            setSolicitudPagadaId={setSolicitudPagadaId}
            setModeloPagado={setModeloPagado}
          />
        }
      />

      <Route
        path="/finalizado"
        element={
          <FinalizadoRoute
            solicitudPagadaId={solicitudPagadaId}
            modeloPagado={modeloPagado}
            selectedPhone={selectedPhone}
            onVolverInicio={() => {
              setSelectedPhone(null);
              setPlanSelected(null);
              setSolicitudPagadaId(null);
              setModeloPagado(null);
              navigate('/');
            }}
          />
        }
      />

      <Route
        path="/:page"
        element={
          <Landing
            onSelectPhone={(phone) => {
              setSelectedPhone(phone);
              navigate(`/cotizar/${phone.id}`);
            }}
            onNavigateAdmin={() => navigate('/dashboard')}
            showAdminButton={false}
          />
        }
      />

      <Route
        path="/"
        element={
          <Landing
            onSelectPhone={(phone) => {
              setSelectedPhone(phone);
              navigate(`/cotizar/${phone.id}`);
            }}
            onNavigateAdmin={() => navigate('/dashboard')}
            showAdminButton={false}
          />
        }
      />
    </Routes>
  );
}

// --- Componentes de ruta: envuelven las pantallas del flujo de crédito con los hooks
// de react-router (useParams/useSearchParams) que necesitan y los guards por si falta
// el estado previo (ej. refresh duro a mitad del flujo).

function CotizarRoute({
  phones,
  phonesLoaded,
  selectedPhone,
  setSelectedPhone,
  onSiguiente
}: {
  phones: Phone[];
  phonesLoaded: boolean;
  selectedPhone: Phone | null;
  setSelectedPhone: (phone: Phone) => void;
  onSiguiente: (data: PlanSeleccionado) => void;
}) {
  const { phoneId } = useParams<{ phoneId: string }>();
  const navigate = useNavigate();
  const phone = phones.find(p => p.id === phoneId) || null;

  useEffect(() => {
    if (phone && phone.id !== selectedPhone?.id) {
      setSelectedPhone(phone);
    }
  }, [phone, selectedPhone, setSelectedPhone]);

  if (!phone) {
    if (!phonesLoaded) return null;
    return <Navigate to="/" replace />;
  }

  return (
    <Cotizador
      phone={phone}
      onSiguiente={onSiguiente}
      onVolver={() => navigate('/tienda')}
    />
  );
}

function DocumentosRoute({
  selectedPhone,
  planSelected
}: {
  selectedPhone: Phone | null;
  planSelected: PlanSeleccionado | null;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const solicitudIdParam = searchParams.get('solicitud');
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  // Si no hay estado en memoria (refresh, o volvió con el link más tarde) pero la URL
  // trae ?solicitud=X, se reconstruye todo desde ahí — la solicitud ya se creó apenas
  // se verificó el OTP (ver Documentos.tsx), así que el celular/plan ya están guardados.
  const [resumen, setResumen] = useState<any>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState(false);

  useEffect(() => {
    if (selectedPhone || planSelected || !solicitudIdParam) return;
    setCargandoResumen(true);
    setErrorResumen(false);
    fetch(`${backendUrl}/api/solicitudes/${solicitudIdParam}/resumen`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo recuperar la solicitud.');
        return res.json();
      })
      .then(data => setResumen(data))
      .catch(() => setErrorResumen(true))
      .finally(() => setCargandoResumen(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitudIdParam]);

  if (!selectedPhone || !planSelected) {
    if (!solicitudIdParam) {
      return <Navigate to="/" replace />;
    }
    if (errorResumen) {
      return <Navigate to="/" replace />;
    }
    if (cargandoResumen || !resumen) {
      return <PageLoader />;
    }
    return (
      <Documentos
        planData={{
          semanas: resumen.semanas,
          pagoSemanal: resumen.pagoSemanal,
          enganche: resumen.enganche,
          modelo: resumen.modelo,
          envioGratis: (resumen.costoEnvio || 0) === 0,
          costoEnvio: resumen.costoEnvio
        }}
        initialSolicitudId={resumen.id}
        initialCelular={resumen.celular}
        initialEmail={resumen.email || ''}
        initialOtpVerificado
        initialDocsGuardados={{
          ineFrente: resumen.tieneIneFrente,
          ineReverso: resumen.tieneIneReverso,
          selfie: resumen.tieneSelfie
        }}
        onVolver={() => navigate('/tienda')}
      />
    );
  }

  return (
    <Documentos
      planData={{
        ...planSelected,
        modelo: selectedPhone.modelo,
        envioGratis: selectedPhone.envioGratis,
        costoEnvio: selectedPhone.costoEnvio
      }}
      onVolver={() => navigate(`/cotizar/${selectedPhone.id}`)}
    />
  );
}

function DomicilioRoute({
  setSolicitudPagadaId,
  setModeloPagado
}: {
  setSolicitudPagadaId: (id: string) => void;
  setModeloPagado: (modelo: string) => void;
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const solicitud = searchParams.get('solicitud');
  const modelo = searchParams.get('modelo');

  useEffect(() => {
    if (solicitud) setSolicitudPagadaId(solicitud);
    if (modelo) setModeloPagado(modelo);
  }, [solicitud, modelo, setSolicitudPagadaId, setModeloPagado]);

  if (!solicitud || !modelo) {
    return <Navigate to="/" replace />;
  }

  return (
    <Domicilio
      solicitudId={solicitud}
      modelo={modelo}
      onFinalizado={() => navigate('/finalizado')}
    />
  );
}

function FinalizadoRoute({
  solicitudPagadaId,
  modeloPagado,
  selectedPhone,
  onVolverInicio
}: {
  solicitudPagadaId: string | null;
  modeloPagado: string | null;
  selectedPhone: Phone | null;
  onVolverInicio: () => void;
}) {
  if (!solicitudPagadaId) {
    return <Navigate to="/" replace />;
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
      <p style={{ margin: '20px 0', color: '#5A6688', fontSize: '15px', lineHeight: 1.5 }}>
        Tu solicitud ha sido ingresada al sistema y aprobada con éxito. En menos de 24 horas te contactaremos para coordinar el envío de tu nuevo celular {modeloPagado || selectedPhone?.modelo}.
      </p>
      <button
        onClick={onVolverInicio}
        style={{
          background: 'linear-gradient(135deg,#2B6BE4,#0E7490)',
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
