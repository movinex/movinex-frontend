import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatTile } from './stat-tile';
import { EstatusChart, CobranzaChart } from './charts';
import { formatoMoneda } from '@/lib/format';
import { enCobranza, estaAtrasada } from '@/lib/solicitudes';
import type { Solicitud } from '@/types';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function ResumenView({ solicitudes }: { solicitudes: Solicitud[] }) {
  const totalSolicitudes = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estatus === 'Pendiente').length;
  const enServicio = solicitudes.filter(enCobranza);
  const atrasadas = enServicio.filter((s) => estaAtrasada(s));

  const enganchesCobrados = solicitudes.filter((s) => s.pagoConfirmado).reduce((acc, s) => acc + Number(s.enganche || 0), 0);
  const cobranzaSemanalActiva = enServicio.reduce((acc, s) => acc + Number(s.pagoSemanal || 0), 0);

  const porEstatus = new Map<string, number>();
  for (const s of solicitudes) {
    porEstatus.set(s.estatus, (porEstatus.get(s.estatus) || 0) + 1);
  }
  const datosEstatus = Array.from(porEstatus.entries())
    .map(([estatus, total]) => ({ estatus, total }))
    .sort((a, b) => b.total - a.total);

  const hoy = new Date();
  const dias7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const datosCobranza = dias7.map((d) => {
    const monto = enServicio
      .filter((s) => {
        if (!s.proximoCobroSemanal) return false;
        const fechaCobro = new Date(s.proximoCobroSemanal);
        return fechaCobro.toDateString() === d.toDateString();
      })
      .reduce((acc, s) => acc + Number(s.pagoSemanal || 0), 0);
    return { dia: DIAS[d.getDay()], monto };
  });

  const proximosCobros = enServicio
    .filter((s) => s.proximoCobroSemanal)
    .sort((a, b) => new Date(a.proximoCobroSemanal!).getTime() - new Date(b.proximoCobroSemanal!).getTime())
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
        <p className="text-muted-foreground">Cartera de créditos y cobranza de Movinex.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Solicitudes totales" value={String(totalSolicitudes)} />
        <StatTile label="En revisión manual" value={String(pendientes)} tone={pendientes > 0 ? 'warning' : 'default'} />
        <StatTile label="Enganches cobrados" value={formatoMoneda(enganchesCobrados)} />
        <StatTile
          label="Cobranza semanal activa"
          value={formatoMoneda(cobranzaSemanalActiva)}
          sublabel={`${enServicio.length} crédito(s) en curso`}
        />
        <StatTile
          label="Atrasados"
          value={String(atrasadas.length)}
          sublabel={atrasadas.length > 0 ? formatoMoneda(atrasadas.reduce((acc, s) => acc + Number(s.pagoSemanal || 0), 0)) : undefined}
          tone={atrasadas.length > 0 ? 'critical' : 'default'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes por estatus</CardTitle>
            <CardDescription>Distribución actual de toda la cartera.</CardDescription>
          </CardHeader>
          <CardContent>
            <EstatusChart datos={datosEstatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cobranza próxima</CardTitle>
            <CardDescription>Monto esperado por día, próximos 7 días.</CardDescription>
          </CardHeader>
          <CardContent>
            <CobranzaChart datos={datosCobranza} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos cobros</CardTitle>
          <CardDescription>Créditos activos ordenados por fecha de cobro más próxima.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {proximosCobros.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">No hay cobros programados.</p>
          ) : (
            <div className="divide-y">
              {proximosCobros.map((s) => {
                const atrasado = estaAtrasada(s);
                return (
                  <div key={s.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{s.cliente}</p>
                      <p className="text-muted-foreground">
                        {s.modelo} · Semana {(s.semanasPagadas ?? 0) + 1} de {s.semanas}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {atrasado && (
                        <span className="rounded-md bg-[color:var(--status-critical)]/15 px-2 py-0.5 text-xs font-semibold text-[color:var(--status-critical)]">
                          Atrasado
                        </span>
                      )}
                      <div className="text-right">
                        <p className="font-medium tabular-nums">{formatoMoneda(Number(s.pagoSemanal))}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.proximoCobroSemanal && new Date(s.proximoCobroSemanal).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
