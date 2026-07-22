import { Card, CardContent, CardHeader } from '@/popup/components/ui/card';
import type { FillResult } from '@/autofill/types';

type FillResultSummaryProps = {
  result: FillResult;
};

export function FillResultSummary({ result }: FillResultSummaryProps) {
  const visibleItems = result.items.slice(0, 12);

  return (
    <Card className="border-emerald-100 bg-emerald-50/40">
      <CardHeader className="pb-2">
        <h2 className="text-sm font-semibold">Autofill Result</h2>
        <p className="text-xs text-muted-foreground">Adapter: {result.adapter}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <Metric label="Total" value={result.totalFields} />
          <Metric label="Filled" value={result.filled} />
          <Metric label="Skipped" value={result.skipped} />
          <Metric label="Manual" value={result.manual} />
        </div>
        <div className="space-y-1">
          {visibleItems.map((item, index) => (
            <div key={`${item.selector ?? item.label}-${index}`} className="flex gap-2 text-xs">
              <span>{item.status === 'filled' ? '✓' : '⚠'}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="text-muted-foreground">{item.status}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white p-2 shadow-sm">
      <div className="font-semibold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
