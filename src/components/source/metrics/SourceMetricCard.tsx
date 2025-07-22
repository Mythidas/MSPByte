import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Database } from '@/db/schema';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/shared/Icon';

type RollupMetric = Database['public']['Views']['rollup_metrics_site']['Row'];

type Props = {
  metric: RollupMetric;
  baseRoute?: string;
};

export default function SourceMetricCard({ metric, baseRoute }: Props) {
  const filtersFormatted = () => {
    let parsed = '';
    for (const [key, value] of Object.entries(metric.filters as Record<string, string>)) {
      if (key === 'tab') {
        continue;
      }

      if (parsed.length > 0) parsed += '&';
      else parsed += '?';
      parsed += `${key}=${value}`;
    }

    if ((metric.filters as Record<string, string>)['tab']) {
      parsed = `/${(metric.filters as Record<string, string>)['tab']}` + parsed;
    }

    return parsed;
  };

  const valueDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percentage = (metric.value! / metric.total!) * 100;
        return `${percentage.toFixed(0)}%`;
      }
      default:
        return metric.value;
    }
  };

  const deltaDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percentage = (metric.delta! / metric.total!) * 100;
        return `${percentage.toFixed(0)}%`;
      }
      default:
        return metric.delta;
    }
  };

  const color =
    metric.delta === 0 || (metric.visual === 'percentage' && metric.delta === 0)
      ? 'text-slate-500'
      : metric.roc_positive
        ? metric.delta! > 0
          ? 'text-green-600'
          : 'text-red-600'
        : metric.delta! < 0
          ? 'text-green-600'
          : 'text-red-600';

  return (
    <Card className="bg-linear-to-t from-primary/5 to-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Link
            href={
              baseRoute
                ? `${baseRoute}${filtersFormatted()}`
                : `/${metric.source_id}${filtersFormatted()}`
            }
          >
            {metric.name}
          </Link>
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" iconName={metric.icon!} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{valueDisplay()}</div>
          <div className="flex items-center gap-1">
            <TrendingUp className={`h-3 w-3 ${color}`} />
            <span className={`text-xs font-medium ${color}`}>{deltaDisplay()}</span>
            <span className="text-xs text-muted-foreground">vs last sync</span>
          </div>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
