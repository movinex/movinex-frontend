import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useParams, useSearchParams } from 'react-router';
import { Landing } from './Landing';
import { Cotizador } from './Cotizador';
import { Documentos } from './Documentos';
import type { ResumenSolicitud } from './Documentos';
import { Verificacion } from './Verificacion';
import { Admin } from './Admin';
import { SadminLogin } from './Sadmin';
import { BotonWhatsapp } from './BotonWhatsapp';
import type { Phone, Solicitud } from './types';
import landingStyles from './Landing.module.css';
import finalizadoStyles from './Documentos.module.css';
import logoBlancoFinalizado from './assets/movinex_blanco.webp';
import { FiCheckCircle } from 'react-icons/fi';

// Carga diferida a propósito: SadminDashboard importa Tailwind (sadmin.css), y si se
// cargara de entrada ese CSS le llegaría a toda la app. Con lazy(), el chunk (y su CSS)
// solo se pide cuando alguien ya logueado entra a /sadmin.
const SadminDashboard = lazy(() => import('./SadminDashboard').then(m => ({ default: m.SadminDashboard })));

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

  // Sesión de Super Admin (JWT emitido por /api/admin/login), compartida entre /dashboard
  // y /sadmin — persistida en localStorage para que un refresh de página no desloguee.
  const [adminUser, setAdminUser] = useState<any>(() => {
    const guardado = localStorage.getItem('movinex_admin_user');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('movinex_admin_token'));

  const handleLoginSuccess = (user: any, token: string) => {
    localStorage.setItem('movinex_admin_user', JSON.stringify(user));
    localStorage.setItem('movinex_admin_token', token);
    setAdminUser(user);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('movinex_admin_user');
    localStorage.removeItem('movinex_admin_token');
    setAdminUser(null);
    setAdminToken(null);
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://movinex-backend-production.up.railway.app';

  // Cuenta regresiva hasta el próximo refresh automático (60s) — se resetea cada vez
  // que se cargan las solicitudes, sea por el intervalo o por el botón manual.
  const [segundosParaRefresh, setSegundosParaRefresh] = useState(60);

  const cargarSolicitudes = useCallback(() => {
    if (!adminToken) return;
    fetch(`${backendUrl}/api/solicitudes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          throw new Error('Sesión expirada.');
        }
        return res.json();
      })
      .then(data => {
        const solicitudesAdaptadas = data.map((s: any) => ({
          id: s.id,
          cliente: s.cliente,
          curp: s.curp,
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
          reciboUrl: s.stripe_receipt_url,
          metodoPagoEnganche: s.metodo_pago_enganche,
          semanasPagadas: s.semanas_pagadas,
          proximoCobroSemanal: s.proximo_cobro_semanal,
          stripeSubscriptionId: s.stripe_subscription_id,
          stripeClabeReferencia: s.stripe_clabe_referencia,
          verificamexStatus: s.verificamex_status,
          verificamexIntentos: s.verificamex_intentos,
          verificamexResult: s.verificamex_result,
          verificamexComments: s.verificamex_comments,
          costoEnvio: s.costo_envio != null ? Number(s.costo_envio) : undefined
        }));
        setSolicitudes(solicitudesAdaptadas);
      })
      .catch(err => console.error('Error al cargar solicitudes del backend:', err))
      .finally(() => setSegundosParaRefresh(60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken, backendUrl]);

  // Cargar solicitudes del backend al abrir /dashboard o /sadmin, y refrescar solas
  // cada 1 minuto mientras quede abierto (requiere sesión de admin).
  useEffect(() => {
    const esRutaAdmin = location.pathname === '/dashboard' || location.pathname.startsWith('/sadmin');
    if (!(esRutaAdmin && adminToken)) return;

    cargarSolicitudes();
    const interval = setInterval(cargarSolicitudes, 60000);
    const countdown = setInterval(() => {
      setSegundosParaRefresh(prev => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, [location.pathname, adminToken, cargarSolicitudes]);

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
          precioDescuento: p.precio_descuento != null ? Number(p.precio_descuento) : undefined,
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

  const handleCancelarSolicitud = async (id: string) => {
    const response = await fetch(`${backendUrl}/api/admin/solicitudes/${id}/cancelar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
      }
    });

    const res = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(res.error || 'No se pudo cancelar la solicitud.');
    }

    setSolicitudes(prev => prev.map(s => (s.id === id ? { ...s, estatus: 'Cancelada' } : s)));
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

  const handleProcesarCobranza = async () => {
    const response = await fetch(`${backendUrl}/api/admin/cobros-semanales/procesar`, {
      method: 'POST',
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
    });

    if (!response.ok) {
      const res = await response.json().catch(() => ({}));
      throw new Error(res.error || 'No se pudieron enviar los recordatorios.');
    }
  };

  return (
    <>
    <BotonWhatsapp />
    <Routes>
      <Route
        path="/sadmin/*"
        element={
          !adminUser || !adminToken ? (
            <SadminLogin
              onLoginSuccess={handleLoginSuccess}
              onVolver={() => navigate('/')}
            />
          ) : (
            <Suspense fallback={<PageLoader />}>
              <SadminDashboard
                solicitudes={solicitudes}
                onUpdateStatus={handleUpdateStatus}
                onCancelarSolicitud={handleCancelarSolicitud}
                onSaveImei={handleSaveImei}
                onSaveDireccion={handleSaveDireccion}
                onProcesarRecordatorios={handleProcesarCobranza}
                phones={phones}
                onReloadPhones={() => setReloadTrigger(prev => prev + 1)}
                adminUser={adminUser}
                adminToken={adminToken}
                onLogout={handleLogout}
                onRefrescar={cargarSolicitudes}
                segundosParaRefresh={segundosParaRefresh}
              />
            </Suspense>
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          !adminUser || !adminToken ? (
            <SadminLogin
              onLoginSuccess={handleLoginSuccess}
              onVolver={() => navigate('/')}
            />
          ) : (
            <Admin
              solicitudes={solicitudes}
              onUpdateStatus={handleUpdateStatus}
              onCancelarSolicitud={handleCancelarSolicitud}
              onSaveImei={handleSaveImei}
              onSaveDireccion={handleSaveDireccion}
              onVolver={() => navigate('/tienda')}
              onRefrescar={cargarSolicitudes}
              segundosParaRefresh={segundosParaRefresh}
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
        path="/verificacion"
        element={
          <VerificacionRoute
            setSolicitudPagadaId={setSolicitudPagadaId}
            setModeloPagado={setModeloPagado}
            phones={phones}
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
            phones={phones}
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
    </>
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

// Estatus que significan "ya pagó el enganche" — si una solicitud reanudada por URL
// llegó hasta ahí, /documentos ya no es la pantalla correcta, el siguiente paso es
// /verificacion (o más allá, ya en preparación/enviado).
const ESTATUS_PAGADOS = ['Verificando identidad', 'Preparando paquete', 'Pendiente de envío', 'Enviado', 'Entregado', 'Pendiente', 'Aprobado', 'Rechazado'];
// Una solicitud cancelada no se retoma: el backend además lo bloquea, pero mandarla al
// inicio evita que el cliente complete todo un formulario para chocarse con un error.
const ESTATUS_CANCELADOS = ['Cancelada'];

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
  const [resumen, setResumen] = useState<ResumenSolicitud | null>(null);
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
    if (ESTATUS_CANCELADOS.includes(resumen.estatus)) {
      return <Navigate to="/" replace />;
    }
    if (ESTATUS_PAGADOS.includes(resumen.estatus)) {
      return <Navigate to={`/verificacion?solicitud=${resumen.id}&modelo=${encodeURIComponent(resumen.modelo)}`} replace />;
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
        resumenInicial={resumen}
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
        costoEnvio: selectedPhone.costoEnvio,
        imagen: selectedPhone.imagen
      }}
      onVolver={() => navigate(`/cotizar/${selectedPhone.id}`)}
    />
  );
}

function VerificacionRoute({
  setSolicitudPagadaId,
  setModeloPagado,
  phones
}: {
  setSolicitudPagadaId: (id: string) => void;
  setModeloPagado: (modelo: string) => void;
  phones: Phone[];
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
    <Verificacion
      solicitudId={solicitud}
      modelo={modelo}
      imagen={phones.find(p => p.modelo === modelo)?.imagen}
      onFinalizado={() => navigate('/finalizado')}
    />
  );
}

function FinalizadoRoute({
  solicitudPagadaId,
  modeloPagado,
  selectedPhone,
  phones,
  onVolverInicio
}: {
  solicitudPagadaId: string | null;
  modeloPagado: string | null;
  selectedPhone: Phone | null;
  phones: Phone[];
  onVolverInicio: () => void;
}) {
  if (!solicitudPagadaId) {
    return <Navigate to="/" replace />;
  }

  const modelo = modeloPagado || selectedPhone?.modelo;
  // Tras el pago, Stripe redirige de vuelta con un full page load — el estado de React
  // (selectedPhone) se pierde. Se busca la foto en el catálogo ya cargado por modelo,
  // igual que hace el resto del flujo con selectedPhone.
  const imagen = selectedPhone?.imagen || phones.find(p => p.modelo === modelo)?.imagen;

  return (
    <div className={finalizadoStyles.wrap}>
      <div className={finalizadoStyles.card}>
        <div className={finalizadoStyles.detallesTelefono}>
          <div className={finalizadoStyles.telefonoCol}>
            <img src={logoBlancoFinalizado} alt="Movinex" className={finalizadoStyles.logo} />
            <div className={finalizadoStyles.modelo}>{modelo}</div>
          </div>
          {imagen && (
            <div className={finalizadoStyles.imagenTelefonoWrap}>
              <img src={imagen} alt={modelo} />
            </div>
          )}
        </div>
        <div className={finalizadoStyles.body}>
          <div className={finalizadoStyles.estado}>
            <FiCheckCircle className={finalizadoStyles.infoIcon} />
            <div className={finalizadoStyles.et}>Todo listo</div>
            <div className={finalizadoStyles.ed}>
              {`Tu ${modelo} será enviado a la dirección que indicaste, entre 3 a 5 días hábiles.`}
            </div>
            <div className={finalizadoStyles.cerrarWrap}>
              <p className={finalizadoStyles.cerrarHint}>Puedes cerrar esta ventana ó</p>
              <button type="button" className={finalizadoStyles.linkVolver} onClick={onVolverInicio}>
                Volver a la tienda →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
