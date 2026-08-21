import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { formatoMoneda } from '@/lib/format';
import { etiquetaMes, type FilaCalendario, type FilaMes } from '@/lib/cartera';

// Serie de autovia-dashboard (--s1..--s8), para que los gráficos y las píldoras de
// estado hablen el mismo idioma de color.
const COLORES = ['#2b6be4', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];

// Colores del semáforo de antigüedad: verde al corriente y cada vez más rojo al envejecer.
const COLOR_BUCKET: Record<string, string> = {
  'Al corriente': '#0ca30c',
  '1-30': '#fab219',
  '31-60': '#ec835a',
  '61-90': '#d03b3b',
  '90+': '#a32020'
};

const ejeComun = { tick: { fontSize: 11 }, stroke: 'var(--muted-foreground)' };
const tooltipComun = {
  contentStyle: { borderRadius: 8, borderColor: 'var(--border)', background: 'var(--surface-2)', fontSize: 11.5 },
  cursor: { fill: 'var(--muted)' }
};

/** Texto centrado cuando no hay nada que dibujar — no un gráfico vacío. */
function SinDatos({ children }: { children: string }) {
  return <div className="empty">{children}</div>;
}

export function EstatusChart({ datos }: { datos: { estatus: string; total: number }[] }) {
  if (datos.length === 0) return <SinDatos>Sin solicitudes todavía.</SinDatos>;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={datos} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} {...ejeComun} />
        <YAxis type="category" dataKey="estatus" width={140} {...ejeComun} />
        <Tooltip {...tooltipComun} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {datos.map((_, i) => (
            <Cell key={i} fill={COLORES[i % COLORES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CobranzaChart({ datos }: { datos: { dia: string; monto: number }[] }) {
  if (datos.every((d) => d.monto === 0)) return <SinDatos>No hay cobranza esperada esta semana.</SinDatos>;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={datos} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="dia" {...ejeComun} />
        <YAxis width={64} tickFormatter={(v) => formatoMoneda(Number(v))} {...ejeComun} />
        <Tooltip {...tooltipComun} formatter={(v: unknown) => [formatoMoneda(Number(v ?? 0)), 'Cobranza esperada']} />
        <Bar dataKey="monto" fill="#2b6be4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Distribución del saldo por antigüedad. La pregunta que responde: ¿cuánto del saldo
 * está sano y cuánto empieza a envejecer? Un saldo que cruza los 90 días rara vez se
 * recupera completo.
 */
export function AgingChart({ datos }: { datos: { bucket: string; n: number; monto: number }[] }) {
  if (datos.every((d) => d.monto === 0)) return <SinDatos>Todavía no hay saldo que clasificar.</SinDatos>;
  const etiqueta = (b: string) => (b === 'Al corriente' ? 'Al corriente' : b === '90+' ? '90+ d' : `${b} d`);
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={datos} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="bucket" tickFormatter={etiqueta} {...ejeComun} />
        <YAxis width={64} tickFormatter={(v) => formatoMoneda(Number(v))} {...ejeComun} />
        <Tooltip
          {...tooltipComun}
          labelFormatter={(b) => (b === 'Al corriente' ? 'Al corriente' : `${b} días vencidos`)}
          formatter={(v: unknown, _n, item: any) => [
            `${formatoMoneda(Number(v ?? 0))} · ${item?.payload?.n ?? 0} crédito(s)`,
            'Saldo'
          ]}
        />
        <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
          {datos.map((d, i) => (
            <Cell key={i} fill={COLOR_BUCKET[d.bucket] || COLORES[0]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Brecha mensual de cobranza: lo que debió entrar contra lo que entró. La franja naranja
 * de arriba es lo que quedó pendiente.
 */
export function BrechaChart({ datos }: { datos: FilaCalendario[] }) {
  const cerrados = datos.filter((d) => d.fase !== 'Proyectado');
  if (cerrados.length === 0) return <SinDatos>Todavía no hay ningún mes con cobranza vencida.</SinDatos>;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <AreaChart data={cerrados} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="mes" tickFormatter={etiquetaMes} {...ejeComun} />
        <YAxis width={64} tickFormatter={(v) => formatoMoneda(Number(v))} {...ejeComun} />
        <Tooltip
          {...tooltipComun}
          labelFormatter={(k) => etiquetaMes(String(k ?? ''))}
          formatter={(v: unknown, n: unknown) => [formatoMoneda(Number(v ?? 0)), String(n)]}
        />
        <Legend wrapperStyle={{ fontSize: 11.5 }} />
        <Area type="monotone" dataKey="cobrado" name="Cobrado" stackId="1" stroke="#1baf7a" fill="#1baf7a" fillOpacity={0.75} />
        <Area type="monotone" dataKey="pendiente" name="Pendiente" stackId="1" stroke="#eb6834" fill="#eb6834" fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Colocación mensual: cuánto crédito se pone en la calle cada mes y con qué enganche. */
export function ColocacionChart({ datos }: { datos: FilaMes[] }) {
  if (datos.length === 0) return <SinDatos>Sin originación registrada.</SinDatos>;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={datos} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="mes" tickFormatter={etiquetaMes} {...ejeComun} />
        <YAxis width={64} tickFormatter={(v) => formatoMoneda(Number(v))} {...ejeComun} />
        <Tooltip
          {...tooltipComun}
          labelFormatter={(k) => etiquetaMes(String(k ?? ''))}
          formatter={(v: unknown, n: unknown) => [formatoMoneda(Number(v ?? 0)), String(n)]}
        />
        <Legend wrapperStyle={{ fontSize: 11.5 }} />
        <Bar dataKey="total" name="Plan colocado" stackId="a" fill="#2b6be4" radius={[0, 0, 0, 0]} />
        <Bar dataKey="enganches" name="Enganche cobrado" stackId="a" fill="#1baf7a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Mezcla por plazo: a cuántas semanas está comprometido el capital. */
export function PlazoChart({ datos }: { datos: { plazo: string; n: number; monto: number }[] }) {
  if (datos.length === 0) return <SinDatos>Sin créditos que clasificar.</SinDatos>;
  return (
    <ResponsiveContainer width="100%" height={230}>
      <PieChart>
        <Pie data={datos} dataKey="monto" nameKey="plazo" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {datos.map((_, i) => (
            <Cell key={i} fill={COLORES[i % COLORES.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipComun.contentStyle}
          formatter={(v: unknown, n: unknown, item: any) => [
            `${formatoMoneda(Number(v ?? 0))} · ${item?.payload?.n ?? 0} crédito(s)`,
            String(n)
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 11.5 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Los mayores saldos. Sirve para fijar un límite de exposición por cliente. */
export function ConcentracionChart({ datos }: { datos: { cliente: string; saldo: number }[] }) {
  if (datos.length === 0) return <SinDatos>Sin saldo por cobrar.</SinDatos>;
  const corto = (n: string) => (n.length > 22 ? n.slice(0, 21) + '…' : n);
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, datos.length * 26 + 40)}>
      <BarChart data={datos} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tickFormatter={(v) => formatoMoneda(Number(v))} {...ejeComun} />
        <YAxis type="category" dataKey="cliente" width={150} tickFormatter={corto} {...ejeComun} />
        <Tooltip {...tooltipComun} formatter={(v: unknown) => [formatoMoneda(Number(v ?? 0)), 'Saldo por cobrar']} />
        <Bar dataKey="saldo" fill="#2b6be4" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
