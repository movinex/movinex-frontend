import { useMemo, useState } from 'react';
import { Phone, Send, Link as LinkIcon, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatoFecha, formatoMoneda } from '@/lib/format';
import { enCobranza, estaAtrasada, getMetodoPagoLabel } from '@/lib/solicitudes';
import type { Solicitud } from '@/types';

type Vista = 'atrasados' | 'semana' | 'todos';

const TABS: { value: Vista; label: string }[] = [
  { value: 'atrasados', label: 'Atrasados' },
  { value: 'semana', label: 'Próximos 7 días' },
  { value: 'todos', label: 'Todos los activos' }
];

interface CobranzaViewProps {
  solicitudes: Solicitud[];
  onProcesarRecordatorios: () => Promise<void>;
  onGenerarLinkTarjeta: (id: string) => Promise<string>;
}

export function CobranzaView({ solicitudes, onProcesarRecordatorios, onGenerarLinkTarjeta }: CobranzaViewProps) {
  const [vista, setVista] = useState<Vista>('todos');
  const [q, setQ] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [generandoLinkId, setGenerandoLinkId] = useState<string | null>(null);
  const [linkCopiadoId, setLinkCopiadoId] = useState<string | null>(null);

  const activas = useMemo(() => solicitudes.filter(enCobranza), [solicitudes]);

  const filtradas = useMemo(() => {
    const hoy = new Date();
    const en7dias = new Date(hoy);
    en7dias.setDate(en7dias.getDate() + 7);

    let base = activas;
    if (vista === 'atrasados') base = base.filter((s) => estaAtrasada(s, hoy));
    if (vista === 'semana') base = base.filter((s) => s.proximoCobroSemanal && new Date(s.proximoCobroSemanal) <= en7dias);

    if (q.trim()) {
      const query = q.trim().toLowerCase();
      base = base.filter((s) => [s.cliente, s.celular, s.modelo].some((c) => (c || '').toLowerCase().includes(query)));
    }

    return [...base].sort((a, b) => {
      if (a.cobroSemanalFallido !== b.cobroSemanalFallido) return a.cobroSemanalFallido ? -1 : 1;
      const fa = a.proximoCobroSemanal ? new Date(a.proximoCobroSemanal).getTime() : Infinity;
      const fb = b.proximoCobroSemanal ? new Date(b.proximoCobroSemanal).getTime() : Infinity;
      return fa - fb;
    });
  }, [activas, vista, q]);

  const totalPendiente = filtradas.reduce((acc, s) => acc + Number(s.pagoSemanal || 0), 0);
  const atrasadosTotal = activas.filter((s) => estaAtrasada(s)).length;

  const handleProcesar = async () => {
    setEnviando(true);
    try {
      await onProcesarRecordatorios();
      toast.success('Recordatorios de cobranza semanal enviados.');
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron enviar los recordatorios.');
    } finally {
      setEnviando(false);
    }
  };

  const handleGenerarLink = async (id: string) => {
    setGenerandoLinkId(id);
    try {
      const url = await onGenerarLinkTarjeta(id);
      await navigator.clipboard.writeText(url);
      setLinkCopiadoId(id);
      toast.success('Link de pago copiado — mandalo por WhatsApp.');
      setTimeout(() => setLinkCopiadoId((actual) => (actual === id ? null : actual)), 2500);
    } catch (error: any) {
      toast.error(error.message || 'No se pudo generar el link de pago.');
    } finally {
      setGenerandoLinkId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cobranza</h1>
          <p className="text-muted-foreground">
            {activas.length} crédito(s) en cobranza activa
            {atrasadosTotal > 0 && <span className="text-[color:var(--status-critical)]"> · {atrasadosTotal} atrasado(s)</span>}
          </p>
        </div>
        <Button size="sm" disabled={enviando} onClick={handleProcesar}>
          <Send className="size-4" />
          {enviando ? 'Enviando...' : 'Enviar recordatorios de WhatsApp'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input className="w-64" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cliente, teléfono o modelo…" />
        <div className="flex gap-1">
          {TABS.map((t) => (
            <Button key={t.value} size="sm" variant={vista === t.value ? 'default' : 'outline'} onClick={() => setVista(t.value)}>
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">No hay créditos que coincidan con esta vista.</CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtradas.length} pago(s) · {formatoMoneda(totalPendiente)} por cobrar
          </p>
          <Card>
            <CardContent className="divide-y p-0">
              {filtradas.map((s) => {
                const atrasado = estaAtrasada(s);
                const metodo = getMetodoPagoLabel(s.metodoPagoEnganche);
                return (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="font-medium">{s.cliente}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.modelo} · Semana {(s.semanasPagadas ?? 0) + 1} de {s.semanas}
                        {metodo && ` · ${metodo}`}
                      </p>
                      {(s.imei || s.curp) && (
                        <p className="text-xs text-muted-foreground">
                          {s.imei && <>IMEI: <span className="tabular-nums">{s.imei}</span></>}
                          {s.imei && s.curp && ' · '}
                          {s.curp && <>CURP: {s.curp}</>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {s.cobroSemanalFallido && <Badge variant="critical">Pago falló</Badge>}
                      {!s.cobroSemanalFallido && atrasado && <Badge variant="critical">Atrasado</Badge>}
                      {s.metodoPagoEnganche === 'card' && (
                        <Button size="sm" variant="outline" disabled={generandoLinkId === s.id} onClick={() => handleGenerarLink(s.id)}>
                          {linkCopiadoId === s.id ? (<><Check className="size-3.5" /> Copiado</>) : (<><LinkIcon className="size-3.5" /> {generandoLinkId === s.id ? 'Generando…' : 'Link de pago'}</>)}
                        </Button>
                      )}
                      <a href={`https://wa.me/52${s.celular}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                        <Phone className="size-3.5" />
                        {s.celular}
                      </a>
                      <div className="w-24 text-right">
                        <p className="font-semibold tabular-nums">{formatoMoneda(Number(s.pagoSemanal))}</p>
                        {!s.cobroSemanalFallido && s.proximoCobroSemanal && <p className="text-xs text-muted-foreground">{formatoFecha(s.proximoCobroSemanal)}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
