import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import RouteButton from "@/components/ux/RouteButton";
import { getSources } from "@/lib/actions/server/sources";
import { getSourceMetricsAggregated } from "@/lib/actions/server/sources/source-metrics";
import { Tables } from "@/types/database";
import { MoveRight } from "lucide-react";

export default async function Home() {
  const sources = await getSources();
  const sourceMetrics: { metrics: Tables<'source_metrics_aggregated'>[], source: Tables<'sources'> }[] = [];

  if (!sources.ok) {
    return (
      <span>Failed to load data</span>
    )
  }

  for await (const source of sources.data) {
    const metrics = await getSourceMetricsAggregated(source.id);

    if (!metrics.ok) continue;
    sourceMetrics.push({ metrics: metrics.data, source });
  }

  function formatFilters(filters: Record<string, string>) {
    let parsed = "";
    for (const [key, value] of Object.entries(filters)) {
      if (parsed.length > 0) parsed += "&";
      parsed += `${key}=${value}`;
    }

    return parsed;
  }

  return (
    <Card className="size-full">
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-0">
          {sourceMetrics.map((item, idx) => {
            return (
              <AccordionItem key={item.source.id} value={`item-${idx}`} className="flex flex-col gap-4">
                <AccordionTrigger className="text-2xl">{item.source.name}</AccordionTrigger>
                <AccordionContent className="grid grid-cols-4 gap-2">
                  {item.metrics.map((metric) => {
                    return (
                      <Card key={metric.name}>
                        <CardHeader>
                          <span className="text-base">{metric.name}</span>
                          <CardAction>
                            {metric.route &&
                              <RouteButton
                                variant="ghost"
                                route={`${metric.route}?${formatFilters(metric.filters as Record<string, string>)}`}
                                module="devices"
                                level="read"
                              >
                                <MoveRight />
                              </RouteButton>
                            }
                          </CardAction>
                        </CardHeader>
                        <CardContent>
                          <span>{metric.metric}{metric.total && ` / ${metric.total}`} {metric.unit}</span>
                        </CardContent>
                      </Card>
                    )
                  })}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}