import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { formatoMonedaCorta } from '@/lib/format';
import { calendarioDiario, type CreditoEstado } from '@/lib/cartera';

const DIAS_SEMANA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES_LARGOS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

/** Heatmap de vencimientos día por día del mes en curso — mismo lenguaje visual que la
 * vista "Calendario" de autovia-dashboard, con datos reales de Movinex. */
export function CalendarioMes({ cartera, hoy = new Date() }: { cartera: CreditoEstado[]; hoy?: Date }) {
  const anio = hoy.getFullYear();
  const mesIdx = hoy.getMonth();
  const mesClave = `${anio}-${String(mesIdx + 1).padStart(2, '0')}`;

  const dias = useMemo(() => calendarioDiario(cartera, mesClave), [cartera, mesClave]);
  const porDia = useMemo(() => new Map(dias.map((d) => [d.fecha.getUTCDate(), d])), [dias]);

  const primerDiaSemana = new Date(Date.UTC(anio, mesIdx, 1)).getUTCDay();
  const totalDias = new Date(Date.UTC(anio, mesIdx + 1, 0)).getUTCDate();
  const hoyDia = hoy.getDate();
  const montoMax = Math.max(1, ...dias.map((d) => d.monto));

  const celdas: Array<number | null> = [
    ...Array.from({ length: primerDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1)
  ];

  return (
    <>
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="text-[13px] font-[700] uppercase tracking-[.4px]">
          {MESES_LARGOS[mesIdx]} {anio}
        </h2>
        <span className="note">vencimientos del mes en curso</span>
      </div>
      <div className="cal-grid">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="cal-dow">{d}</div>
        ))}
        {celdas.map((dia, i) => {
          if (dia === null) return <div key={`b${i}`} className="cal-cell cal-blank" />;
          const info = porDia.get(dia);
          const alpha = info ? 0.1 + (info.monto / montoMax) * 0.55 : 0;
          return (
            <div
              key={dia}
              className={cn('cal-cell', dia === hoyDia && 'cal-hoy')}
              style={info ? { background: `rgba(43, 107, 228, ${alpha.toFixed(2)})` } : undefined}
            >
              <span className="cal-num">{dia}</span>
              {info && (
                <>
                  <span className="cal-monto">{formatoMonedaCorta(info.monto)}</span>
                  <span className="cal-cuotas">{info.cuotas} cuota{info.cuotas === 1 ? '' : 's'}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
