import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Database } from '@/db/schema';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Icon from '@/components/common/Icon';

type RollupMetric = Database['public']['Functions']['get_rollup_metrics']['Returns'][number];

type Props = {
  metric: RollupMetric;
  filters: Record<string, string>;
  baseRoute?: string;
};

export default function SourceMetricCard({ metric, filters, baseRoute }: Props) {
  const filtersFormatted = () => {
    let parsed = '';
    for (const [key, value] of Object.entries(filters)) {
      if (parsed.length > 0) parsed += '&';
      parsed += `${key}=${value}`;
    }

    return parsed;
  };

  const valueDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percent = (metric.value / metric.total) * 100;
        return `${percent.toFixed(0)}%`;
      }
      default:
        return metric.value;
    }
  };

  const deltaDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percent = (metric.delta / metric.total) * 100;
        return `${percent.toFixed(0)}%`;
      }
      default:
        return metric.delta;
    }
  };

  return (
    <Card className="bg-linear-to-t from-primary/5 to-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Link
            href={
              baseRoute
                ? `${baseRoute}?${filtersFormatted()}`
                : `${metric.route}?${filtersFormatted()}`
            }
          >
            {metric.name}
          </Link>
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" iconName={metric.icon} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{valueDisplay()}</div>
          <div className="flex items-center gap-1">
            <TrendingUp
              className={`h-3 w-3 ${metric.roc_positive ? 'text-green-600' : 'text-red-600'}`}
            />
            <span
              className={`text-xs font-medium ${
                metric.roc_positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {deltaDisplay()}
            </span>
            <span className="text-xs text-muted-foreground">vs last sync</span>
          </div>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
