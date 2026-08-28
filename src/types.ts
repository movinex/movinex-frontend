export interface Configuracion {
  enganchePct: number;
  tasaAnualPct: number;
  ivaPct: number;
  cargoSemanalNombre: string;
  cargoSemanalMonto: number;
}

export interface Phone {
  id: string;
  modelo: string;
  marca: string;
  precioBase: number;
  enganche: number;
  montoSemanal26: number;
  montoSemanal52: number;
  totalPagar26: number;
  totalPagar52: number;
  ahorro26?: number;
  precioDescuento?: number;
  imagen: string;
  // Fotos del mini-carrusel de la Tienda, con el fondo ya pegado, en orden fijo:
  // [lateral, combo/frente, lateral]. La combo va siempre en el medio (índice 1).
  // Puede venir vacío en celulares que todavía no se cargaron con el sadmin nuevo.
  imagenes?: string[];
  // Las mismas 3 vistas, pero del celular SOLO (transparente) para el pop-up de
  // Detalles — el fondo ahí lo pone `gradienteInicio`/`gradienteFin` por CSS.
  imagenesPopup?: string[];
  gradienteInicio?: string;
  gradienteFin?: string;
  envioGratis?: boolean;
  costoEnvio?: number;
  specsPantalla?: string;
  specsProcesador?: string;
  specsRamAlmacenamiento?: string;
  specsMicrosd?: string;
  specsCamaraTrasera?: string;
  specsCamaraFrontal?: string;
  specsBateria?: string;
  specsSistema?: string;
  specsSeguridad?: string;
  specsResistencia?: string;
  specsConectividad?: string;
  specsDimensionesPeso?: string;
}

export interface MensajeWhatsapp {
  id: string;
  solicitud_id: string;
  celular: string;
  tipo: string;
  exito: boolean;
  mock: boolean;
  detalle?: string | null;
  creado_en: string;
}

export interface Solicitud {
  id: string;
  cliente: string;
  curp?: string;
  celular: string;
  email: string;
  modelo: string;
  enganche: number;
  semanas: number;
  pagoSemanal: number;
  estatus: 'Iniciada' | 'Lista para pago' | 'Verificando identidad' | 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Pendiente de envío' | 'Preparando paquete' | 'Enviado' | 'Entregado' | 'Cancelada';
  fecha: string;
  ineFrente?: string; // Base64
  ineReverso?: string; // Base64
  selfie?: string; // Base64
  pagoConfirmado?: boolean;
  /** Cuándo se acreditó el enganche. Null en las solicitudes anteriores al 2026-08-18,
   *  que es cuando se agregó la columna — para esas, la fecha real está en `pagos`. */
  pagoConfirmadoAt?: string | null;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  alcaldiaMunicipio?: string;
  estado?: string;
  codigoPostal?: string;
  trackingNumber?: string;
  labelUrl?: string;
  imei?: string;
  reciboUrl?: string;
  metodoPagoEnganche?: 'card' | 'oxxo' | 'customer_balance';
  semanasPagadas?: number;
  proximoCobroSemanal?: string;
  cobroSemanalFallido?: boolean;
  stripeSubscriptionId?: string;
  stripeClabeReferencia?: string;
  verificamexStatus?: 'OPEN' | 'VERIFYING' | 'FINISHED' | 'FAILED';
  verificamexIntentos?: number;
  verificamexResult?: number | null;
  verificamexComments?: string | null;
  verificamexErrores?: Array<{ Name?: string; Category?: string; Result?: boolean; Output?: string; Message?: string }> | null;
  costoEnvio?: number;
}

/** Un intento bloqueado porque el CURP ya tenía un crédito activo — ver lib/cartera.ts
 *  y la vista de Rechazos de /sadmin. */
export interface Rechazo {
  id: string;
  solicitudId: string | null;
  curp: string;
  motivo: string;
  detalle: string | null;
  creditoId: string | null;
  /** Solicitud dueña del crédito que causó el bloqueo (no la solicitud rechazada) —
   *  para linkear directo a su estado de cuenta. */
  creditoSolicitudId: string | null;
  creadoAt: string;
}

