import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatTile({
  label,
  value,
  sublabel,
  tone
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: 'default' | 'warning' | 'critical';
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p
          className={cn(
            'mt-1 text-3xl font-semibold tabular-nums',
            tone === 'critical' && 'text-[color:var(--status-critical)]',
            tone === 'warning' && 'text-[color:var(--status-warning)]'
          )}
        >
          {value}
        </p>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}
