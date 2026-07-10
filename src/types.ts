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
