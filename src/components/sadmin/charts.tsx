import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORES = ['#2b6be4', '#eb6834', '#1baf7a', '#eda100', '#7c3aed', '#dc2626', '#0891b2'];

export function EstatusChart({ datos }: { datos: { estatus: string; total: number }[] }) {
  if (datos.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sin datos todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis type="category" dataKey="estatus" width={130} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 12 }}
        />
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
  if (datos.every((d) => d.monto === 0)) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No hay cobranza esperada esta semana.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={datos} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="dia" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" width={56} />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          formatter={(value: unknown) => [`$${Number(value ?? 0).toLocaleString()}`, 'Cobranza esperada']}
          contentStyle={{ borderRadius: 8, borderColor: 'var(--border)', fontSize: 12 }}
        />
        <Bar dataKey="monto" fill="#2b6be4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
