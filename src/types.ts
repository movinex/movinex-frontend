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
  imagen: string;
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

export interface Solicitud {
  id: string;
  cliente: string;
  celular: string;
  email: string;
  modelo: string;
  enganche: number;
  semanas: number;
  pagoSemanal: number;
  estatus: 'Pendiente' | 'Aprobado' | 'Rechazado';
  fecha: string;
  ineFrente?: string; // Base64
  ineReverso?: string; // Base64
  selfie?: string; // Base64
}

