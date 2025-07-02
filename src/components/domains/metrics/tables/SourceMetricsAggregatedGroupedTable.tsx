'use client';

import SourceMetricCard from '@/components/domains/metrics/SourceMetricCard';
import { Spinner } from '@/components/common/Spinner';
import { Tables } from '@/db/schema';
import { getSourceMetricsAggregatedGrouped } from '@/services/metrics';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  sourceId: string;
  parentId: string;
  baseRoute: string;
};

export default function SourceMetricsAggregatedGroupedTable({
  sourceId,
  parentId,
  baseRoute,
}: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<Tables<'source_metrics_aggregated_grouped'>[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const metrics = await getSourceMetricsAggregatedGrouped(sourceId, parentId);

        if (!metrics.ok) {
          throw new Error();
        }

        setMetrics(metrics.data);
      } catch {
        toast.error('Failed to fetch data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [sourceId]);

  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 size-full">
      {metrics.map((metric) => {
        return (
          <SourceMetricCard
            key={metric.name}
            metric={metric as unknown as Tables<'source_metrics'>}
            baseRoute={baseRoute}
          />
        );
      })}
    </div>
  );
}
