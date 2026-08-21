import { useEffect, useState } from 'react';
import { Save, TriangleAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Panel, SecH } from './bloques';
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
    return <div className="empty">Cargando configuración…</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="banner w mb-4">
        <div className="bi"><TriangleAlert strokeWidth={1.8} className="size-full" /></div>
        <div>
          <b>Estos valores no reprecian el catálogo existente.</b> Cambiarlos solo afecta a
          los celulares que se agreguen o reguarden en el Catálogo a partir de ahora — los
          ya cargados conservan su enganche y pago semanal actuales hasta que alguien los
          reguarde a mano.
        </div>
      </div>

      <SecH titulo="Parámetros del crédito" />
      <Panel className="p-4">
        <div className="form-grid">
          <div className="fld">
            <label htmlFor="enganche">% Enganche</label>
            <input id="enganche" type="number" step="0.1" value={enganchePct} onChange={(e) => setEnganchePct(e.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="tasa">Tasa anual ordinaria (%)</label>
            <input id="tasa" type="number" step="0.1" value={tasaAnualPct} onChange={(e) => setTasaAnualPct(e.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="iva">IVA (%)</label>
            <input id="iva" type="number" step="0.1" value={ivaPct} onChange={(e) => setIvaPct(e.target.value)} />
          </div>
          <div className="fld">
            <label htmlFor="cargoMonto">Cargo semanal <span className="hint">(MXN, sin IVA)</span></label>
            <input id="cargoMonto" type="number" step="0.01" value={cargoSemanalMonto} onChange={(e) => setCargoSemanalMonto(e.target.value)} />
          </div>
          <div className="fld" style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="cargoNombre">Nombre del cargo semanal</label>
            <input id="cargoNombre" value={cargoSemanalNombre} onChange={(e) => setCargoSemanalNombre(e.target.value)} />
            <span className="hint">Es el texto que ve el cliente en su cuota semanal.</span>
          </div>
        </div>
        <div className="mt-4 border-t pt-4">
          <Button onClick={handleGuardar} disabled={guardando}>
            {guardando ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar configuración
          </Button>
        </div>
      </Panel>
    </div>
  );
}
