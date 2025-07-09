import { Card, CardHeader, CardAction, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import RouteButton from '@/components/common/routed/RouteButton';
import { Database, Json, Tables } from '@/db/schema';
import { cn } from '@/lib/utils';
import { LucideProps, TrendingUp } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import Link from 'next/link';

type RollupMetric = Database['public']['Functions']['get_rollup_metrics']['Returns'][number];

type Props = {
  metric: RollupMetric;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  baseRoute?: string;
};

export default function SourceMetricCard({ metric, icon: Icon, baseRoute }: Props) {
  console.log(metric);
  const filtersFormatted = () => {
    let parsed = '';
    for (const [key, value] of Object.entries((metric.filters as Record<string, string>[])[0])) {
      if (parsed.length > 0) parsed += '&';
      parsed += `${key}=${value}`;
    }

    return parsed;
  };

  const valueDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percent = (metric.value / metric.total) * 100;
        return `${percent} %`;
      }
      default:
        return metric.value;
    }
  };

  const deltaDisplay = () => {
    switch (metric.visual) {
      case 'percentage': {
        const percent = (metric.delta / metric.total) * 100;
        return `${percent} %`;
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
        <Icon className="h-4 w-4 text-muted-foreground" />
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
