import { Skeleton } from '@/components/ui/skeleton';
import { Kpis } from './bloques';

/** Mismo marcado que `SecH` (bloques.tsx), pero con el título reemplazado por una barra. */
function SecHSkeleton({ anchoTitulo }: { anchoTitulo: string }) {
  return (
    <div className="sec-h">
      <h2><Skeleton className={`h-3 ${anchoTitulo}`} /></h2>
      <div className="rule" />
    </div>
  );
}

/**
 * Placeholder mostrado mientras `solicitudes`/`pagos` todavía no llegaron del backend —
 * evita que las tarjetas de KPI y las tablas se vean un instante con montos en $0 antes
 * de tener datos reales. Genérico a propósito (no intenta calcar cada vista) para no
 * duplicar layout por ruta.
 */
export function DashboardSkeleton() {
  return (
    <>
      <SecHSkeleton anchoTitulo="w-28" />
      <Kpis>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="kpi" key={i}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-6 w-28" />
            <Skeleton className="mt-2.5 h-3 w-32" />
          </div>
        ))}
      </Kpis>

      <SecHSkeleton anchoTitulo="w-24" />
      <Kpis>
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="kpi" key={i}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2.5 h-6 w-28" />
            <Skeleton className="mt-2.5 h-3 w-32" />
          </div>
        ))}
      </Kpis>

      <div className="mt-4 rounded-[var(--radius)] border bg-card p-[18px] shadow-[var(--sh)]">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-9 w-full" key={i} />
          ))}
        </div>
      </div>
    </>
  );
}
