import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import RouteButton from '@/components/ux/RouteButton';
import SourceMetricCard from '@/components/ux/SourceMetricCard';
import { getSources } from 'packages/services/sources';
import { getSourceMetricsAggregated } from 'packages/services/metrics';
import { Schema } from 'packages/db';
import { MoveRight } from 'lucide-react';

export default async function Home() {
  const sources = await getSources();
  const sourceMetrics: {
    metrics: Tables<'source_metrics_aggregated'>[];
    source: Tables<'sources'>;
  }[] = [];

  if (!sources.ok) {
    return <span>Failed to load data</span>;
  }

  for await (const source of sources.data) {
    const metrics = await getSourceMetricsAggregated(source.id);

    if (!metrics.ok) continue;
    sourceMetrics.push({ metrics: metrics.data, source });
  }

  return (
    <Card className="size-full">
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-0">
          {sourceMetrics.map((item, idx) => {
            return (
              <AccordionItem
                key={item.source.id}
                value={`item-${idx}`}
                className="flex flex-col gap-4"
              >
                <AccordionTrigger className="text-2xl">{item.source.name}</AccordionTrigger>
                <AccordionContent className="grid grid-cols-4 gap-2">
                  {item.metrics.map((metric) => {
                    return (
                      <SourceMetricCard
                        key={metric.name}
                        metric={metric as Tables<'source_metrics'>}
                      />
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
