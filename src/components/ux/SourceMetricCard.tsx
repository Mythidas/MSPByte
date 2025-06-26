import { Card, CardHeader, CardAction, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import RouteButton from '@/components/ux/RouteButton';
import { Tables } from '@/db/schema';
import { cn } from '@/lib/utils';
import { MoveRight } from 'lucide-react';

type Props = {
  metric: Tables<'source_metrics'>;
  baseRoute?: string;
};

export default function SourceMetricCard({ metric, baseRoute }: Props) {
  function formatFilters(filters: Record<string, string>) {
    let parsed = '';
    for (const [key, value] of Object.entries(filters)) {
      if (parsed.length > 0) parsed += '&';
      parsed += `${key}=${value}`;
    }

    return parsed;
  }

  function getState(percent: number) {
    if (!metric.thresholds) return 'neutral';

    const thresholds = metric.thresholds as Record<string, number | boolean | undefined>;
    const highest = (thresholds['highest'] as boolean) || false;

    const info = thresholds['info'] !== undefined ? (thresholds['info'] as number) : undefined;
    const warn = thresholds['warn'] !== undefined ? (thresholds['warn'] as number) : undefined;
    const critical =
      thresholds['critical'] !== undefined ? (thresholds['critical'] as number) : undefined;

    if (highest) {
      if (warn !== undefined && percent > warn) return 'info';
      if (critical !== undefined && percent > critical) return 'warn';
      if (critical !== undefined && percent <= critical) return 'critical';
    } else {
      if (info !== undefined && percent <= info) return 'info';
      if (info !== undefined && percent > info) return 'warn';
      if (warn !== undefined && percent > warn) return 'critical';
    }

    return 'neutral';
  }

  function getColor(state: 'info' | 'warn' | 'critical' | 'neutral') {
    switch (state) {
      case 'warn':
        return '[&>div]:bg-amber-500 bg-amber-500/30';
      case 'critical':
        return '[&>div]:bg-red-500 bg-red-500/30';
      case 'neutral':
        return '[&>div]:bg-slate-500 bg-slate-500/30';
      default:
        return '';
    }
  }

  const defaultVisual = () => {
    return (
      <span>
        {metric.metric} {metric.unit}
      </span>
    );
  };

  const progressBar = () => {
    if (!metric.total) return defaultVisual();

    const percent = (metric.metric / metric.total) * 100;
    const state = getState(percent);
    const color = getColor(state);
    return (
      <div className="flex gap-2 justify-center items-center">
        <span>{metric.metric}</span>
        <Progress className={cn(color)} value={(metric.metric! / metric.total) * 100} />
        <span>{metric.total}</span>
        <span>{metric.unit}</span>
      </div>
    );
  };

  function getVisual() {
    switch (metric.visual) {
      case 'progress':
        return progressBar();
      default:
        return defaultVisual();
    }
  }

  return (
    <Card className="bg-linear-to-t from-primary/5 to-card">
      <CardHeader>
        <span className="text-base">{metric.name}</span>
        <CardAction>
          {metric.route && (
            <RouteButton
              variant="ghost"
              route={`${baseRoute || metric.route}?${formatFilters(metric.filters as Record<string, string>)}`}
              module="Sources"
              level="Read"
            >
              <MoveRight />
            </RouteButton>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>{getVisual()}</CardContent>
    </Card>
  );
}
