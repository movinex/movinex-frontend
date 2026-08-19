import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Save, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input, Label, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { calcularCotizacion, primerPagoSugerido } from '@/lib/amortizacion';
import { formatoMoneda, formatoPorcentaje, formatoFecha } from '@/lib/format';
import type { Configuracion } from '@/types';

const MARCAS = ['Samsung', 'Motorola', 'Xiaomi', 'Redmi', 'Oppo', 'Otro'];

const CONFIG_DEFAULT: Configuracion = {
  enganchePct: 0.15,
  tasaAnualPct: 2.28,
  ivaPct: 0.16,
  cargoSemanalNombre: 'Servicio de Seguridad y Bloqueo',
  cargoSemanalMonto: 17
};

interface CotizacionGuardada {
  id: string;
  marca: string;
  modelo: string;
  almacenamiento_color: string | null;
  precio_contado: number;
  plazo_semanas: number;
  enganche: number;
  pago_semanal: number;
  created_at: string;
}

interface CotizadorViewProps {
  configuracion: Configuracion | null;
  backendUrl: string;
  adminToken: string | null;
}

export function CotizadorView({ configuracion, backendUrl, adminToken }: CotizadorViewProps) {
  const parametros = configuracion || CONFIG_DEFAULT;

  const [marca, setMarca] = useState(MARCAS[0]);
  const [modelo, setModelo] = useState('');
  const [almacenamientoColor, setAlmacenamientoColor] = useState('');
  const [precioContado, setPrecioContado] = useState('2999');
  const [plazoSemanas, setPlazoSemanas] = useState<26 | 52>(26);
  const [guardando, setGuardando] = useState(false);
  const [recientes, setRecientes] = useState<CotizacionGuardada[]>([]);

  const precio = Number(precioContado) || 0;
  const fechaPrimerPago = useMemo(() => primerPagoSugerido(new Date()), []);

  const resultado = useMemo(() => {
    if (precio <= 0) return null;
    return calcularCotizacion({ precioContado: precio, plazoSemanas, fechaPrimerPago, parametros });
  }, [precio, plazoSemanas, fechaPrimerPago, parametros]);

  const comparativo = useMemo(() => {
    if (precio <= 0) return null;
    return [26, 52].map((plazo) => calcularCotizacion({ precioContado: precio, plazoSemanas: plazo, fechaPrimerPago, parametros }));
  }, [precio, fechaPrimerPago, parametros]);

  const cargarRecientes = () => {
    if (!adminToken) return;
    fetch(`${backendUrl}/api/admin/cotizaciones`, { headers: { Authorization: `Bearer ${adminToken}` } })
      .then((res) => res.json())
      .then(setRecientes)
      .catch((err) => console.error('Error al cargar cotizaciones recientes:', err));
  };

  useEffect(cargarRecientes, [adminToken, backendUrl]);

  const handleGuardar = async () => {
    if (!modelo.trim() || !resultado) {
      toast.error('Escribe el modelo del equipo antes de guardar.');
      return;
    }
    setGuardando(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/cotizaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
        body: JSON.stringify({
          marca, modelo, almacenamientoColor,
          precioContado: precio, plazoSemanas,
          enganche: resultado.enganche, pagoSemanal: resultado.pagoTotalSemanal
        })
      });
      const res = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(res.error || 'No se pudo guardar la cotización.');
      toast.success('Cotización guardada.');
      cargarRecientes();
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la cotización.');
    } finally {
      setGuardando(false);
    }
  };

  const handleCopiarMensaje = () => {
    if (!modelo.trim() || !resultado) {
      toast.error('Escribe el modelo del equipo antes de generar el mensaje.');
      return;
    }
    const equipo = `${marca} ${modelo}${almacenamientoColor ? ` (${almacenamientoColor})` : ''}`;
    const mensaje = `¡Hola! Te comparto tu cotización para el ${equipo}:\n\n` +
      `• Enganche: ${formatoMoneda(resultado.enganche)}\n` +
      `• ${plazoSemanas} pagos semanales de ${formatoMoneda(resultado.pagoTotalSemanal)}\n\n` +
      `Para continuar, entrá a movinex.mx, elegí el ${modelo} y seguí los pasos — cualquier duda me escribís por acá. 😊`;
    navigator.clipboard.writeText(mensaje);
    toast.success('Mensaje copiado — el cliente igual completa el flujo real (OTP, pago y verificación) en movinex.mx.');
  };

  const handleEliminar = async (id: string) => {
    try {
      await fetch(`${backendUrl}/api/admin/cotizaciones/${id}`, {
        method: 'DELETE',
        headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined
      });
      toast.success('Cotización eliminada.');
      cargarRecientes();
    } catch {
      toast.error('No se pudo eliminar la cotización.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cotizador</h1>
        <p className="text-muted-foreground">
          Calcula el plan de pagos semanal para un celular a crédito — mismas reglas que
          Movinex usa al vender: {(parametros.enganchePct * 100).toFixed(0)}% de enganche,{' '}
          {(parametros.tasaAnualPct * 100).toFixed(0)}% anual sobre saldos insolutos, IVA{' '}
          {(parametros.ivaPct * 100).toFixed(0)}% y {parametros.cargoSemanalNombre} de $
          {parametros.cargoSemanalMonto.toFixed(0)} + IVA por semana.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Datos del equipo</CardTitle>
            <CardDescription>Captura marca, modelo y precio de contado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="marca">Marca</Label>
              <Select id="marca" value={marca} onChange={(e) => setMarca(e.target.value)}>
                {MARCAS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="modelo">Modelo</Label>
              <Input id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Galaxy A07" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="almacenamiento">Almacenamiento / color</Label>
              <Input id="almacenamiento" value={almacenamientoColor} onChange={(e) => setAlmacenamientoColor(e.target.value)} placeholder="64 GB / Negro" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="precio">Precio de contado (MXN)</Label>
              <Input id="precio" type="number" min={1} step="0.01" value={precioContado} onChange={(e) => setPrecioContado(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Plazo</Label>
              <div className="grid grid-cols-2 gap-2">
                {([26, 52] as const).map((p) => (
                  <Button key={p} type="button" variant={plazoSemanas === p ? 'default' : 'outline'} onClick={() => setPlazoSemanas(p)}>
                    {p} semanas
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handleGuardar} disabled={guardando} variant="outline">
                <Save className="size-4" />
                Guardar cotización
              </Button>
              <Button onClick={handleCopiarMensaje}>
                <Copy className="size-4" />
                Copiar mensaje para el cliente
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la cotización</CardTitle>
            </CardHeader>
            <CardContent>
              {resultado ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Resultado label="Enganche" valor={formatoMoneda(resultado.enganche)} />
                  <Resultado label="Monto a financiar" valor={formatoMoneda(resultado.montoFinanciar)} />
                  <Resultado label="Pago total semanal" valor={formatoMoneda(resultado.pagoTotalSemanal)} destacado />
                  <Resultado label="Último pago (ajuste)" valor={formatoMoneda(resultado.ultimoPago)} />
                  <Resultado label="Suma de pagos" valor={formatoMoneda(resultado.sumaPagos)} />
                  <Resultado label="Total desembolsado" valor={formatoMoneda(resultado.totalDesembolsado)} />
                  <Resultado label="Costo del financiamiento" valor={formatoMoneda(resultado.costoFinanciamiento)} />
                  <Resultado
                    label="Costo anual efectivo (ref.)"
                    valor={resultado.costoAnualEfectivoRef !== null ? formatoPorcentaje(resultado.costoAnualEfectivoRef) : 'n/d'}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Captura un precio de contado mayor a 0.</p>
              )}
              <p className="mt-4 text-xs text-muted-foreground">
                El costo anual efectivo es una referencia interna para comparar escenarios — no es el CAT publicado (ese debe calcularse con la metodología Banxico).
              </p>
            </CardContent>
          </Card>

          {comparativo && (
            <Card>
              <CardHeader>
                <CardTitle>Comparativo de plazos</CardTitle>
                <CardDescription>Mismo equipo, 26 vs. 52 semanas.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plazo</TableHead>
                      <TableHead className="text-right">Pago semanal</TableHead>
                      <TableHead className="text-right">Enganche</TableHead>
                      <TableHead className="text-right">Total desembolsado</TableHead>
                      <TableHead className="text-right">Costo del crédito</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparativo.map((r, i) => (
                      <TableRow key={r.tabla.length} className={plazoSemanas === (i === 0 ? 26 : 52) ? 'bg-accent/40' : ''}>
                        <TableCell className="font-medium">{i === 0 ? 26 : 52} semanas</TableCell>
                        <TableCell className="text-right tabular-nums">{formatoMoneda(r.pagoTotalSemanal)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatoMoneda(r.enganche)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatoMoneda(r.totalDesembolsado)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatoMoneda(r.costoFinanciamiento)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla de amortización — {plazoSemanas} semanas</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Saldo inicial</TableHead>
                  <TableHead className="text-right">Interés + IVA</TableHead>
                  <TableHead className="text-right">Capital</TableHead>
                  <TableHead className="text-right">{parametros.cargoSemanalNombre} + IVA</TableHead>
                  <TableHead className="text-right">Pago total</TableHead>
                  <TableHead className="text-right">Saldo final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.tabla.map((f) => (
                  <TableRow key={f.numeroPeriodo}>
                    <TableCell className="font-medium">{f.numeroPeriodo}</TableCell>
                    <TableCell>{formatoFecha(f.fecha)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatoMoneda(f.saldoInicial)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatoMoneda(f.interes + f.ivaInteres)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatoMoneda(f.capital)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatoMoneda(f.cargoServicio + f.ivaCargo)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatoMoneda(f.pagoTotal)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatoMoneda(f.saldoFinal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {recientes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cotizaciones recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recientes.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.marca} {c.modelo}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatoMoneda(Number(c.precio_contado))} · {c.plazo_semanas} semanas · {formatoMoneda(Number(c.pago_semanal))}/sem
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleEliminar(c.id)}>
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Resultado({ label, valor, destacado }: { label: string; valor: string; destacado?: boolean }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={destacado ? 'text-xl font-semibold text-primary' : 'text-base font-medium'}>{valor}</p>
    </div>
  );
}
