'use client';

import SourceMetricCard from '@/components/ux/SourceMetricCard';
import { Tables } from '@/db/schema';
import { getSourceMetricsAggregated } from '@/services/metrics';
import { getSources } from '@/services/sources';
import { useEffect, useState } from 'react';

export default function SourceMetricsTable() {
  const [sourceMetrics, setSourceMetrics] = useState<
    {
      metrics: Tables<'source_metrics_aggregated'>[];
      source: Tables<'sources'>;
    }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      const sources = await getSources();
      if (!sources.ok) return;

      const sourceMetrics = [];
      for await (const source of sources.data) {
        const metrics = await getSourceMetricsAggregated(source.id);

        if (!metrics.ok) continue;
        sourceMetrics.push({ metrics: metrics.data, source });
      }

      setSourceMetrics(sourceMetrics);
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {sourceMetrics.map((item, idx) => {
        return (
          <div key={idx} className="flex flex-col gap-2">
            <h1 className="text-xl">{item.source.name}</h1>
            <div className="grid grid-cols-4 gap-2">
              {item.metrics.map((metric) => {
                return (
                  <SourceMetricCard key={metric.name} metric={metric as Tables<'source_metrics'>} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
