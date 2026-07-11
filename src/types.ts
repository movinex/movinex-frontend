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

