import { useEffect, useState } from 'react';
import { Save, TriangleAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Configuracion } from '@/types';

interface ConfiguracionViewProps {
  configuracion: Configuracion | null;
  onGuardar: (config: Configuracion) => Promise<void>;
}

export function ConfiguracionView({ configuracion, onGuardar }: ConfiguracionViewProps) {
  const [enganchePct, setEnganchePct] = useState('');
  const [tasaAnualPct, setTasaAnualPct] = useState('');
  const [ivaPct, setIvaPct] = useState('');
  const [cargoSemanalNombre, setCargoSemanalNombre] = useState('');
  const [cargoSemanalMonto, setCargoSemanalMonto] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Se pisan los inputs con lo que llegue del backend — solo la primera vez que carga
  // (si el usuario ya está escribiendo, un refresco de `configuracion` en segundo plano
  // no le tiene que borrar lo que tipeó). Redondeado a 2 decimales antes de mostrarlo:
  // 0.15 * 100 da 15.000000000000002 en punto flotante, no 15.
  const aPorcentaje = (valor: number) => String(Math.round(valor * 100 * 100) / 100);

  useEffect(() => {
    if (!configuracion) return;
    setEnganchePct(aPorcentaje(configuracion.enganchePct));
    setTasaAnualPct(aPorcentaje(configuracion.tasaAnualPct));
    setIvaPct(aPorcentaje(configuracion.ivaPct));
    setCargoSemanalNombre(configuracion.cargoSemanalNombre);
    setCargoSemanalMonto(String(configuracion.cargoSemanalMonto));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracion === null]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await onGuardar({
        enganchePct: Number(enganchePct) / 100,
        tasaAnualPct: Number(tasaAnualPct) / 100,
        ivaPct: Number(ivaPct) / 100,
        cargoSemanalNombre,
        cargoSemanalMonto: Number(cargoSemanalMonto)
      });
      toast.success('Configuración actualizada.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudo guardar la configuración.');
    } finally {
      setGuardando(false);
    }
  };

  if (!configuracion) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-muted-foreground">Cargando configuración…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Parámetros de negocio del crédito.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parámetros del crédito</CardTitle>
          <CardDescription className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <span>
              Cambiar estos valores solo afecta a los celulares que se agreguen o
              reguarden en el Catálogo a partir de ahora — los ya cargados conservan su
              enganche y pago semanal actuales hasta que alguien los reguarde a mano.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="enganche">% Enganche</Label>
              <Input id="enganche" type="number" step="0.1" value={enganchePct} onChange={(e) => setEnganchePct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tasa">Tasa anual ordinaria (%)</Label>
              <Input id="tasa" type="number" step="0.1" value={tasaAnualPct} onChange={(e) => setTasaAnualPct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="iva">IVA (%)</Label>
              <Input id="iva" type="number" step="0.1" value={ivaPct} onChange={(e) => setIvaPct(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargoMonto">Cargo semanal (MXN, sin IVA)</Label>
              <Input id="cargoMonto" type="number" step="0.01" value={cargoSemanalMonto} onChange={(e) => setCargoSemanalMonto(e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cargoNombre">Nombre del cargo semanal</Label>
              <Input id="cargoNombre" value={cargoSemanalNombre} onChange={(e) => setCargoSemanalNombre(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar configuración
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
