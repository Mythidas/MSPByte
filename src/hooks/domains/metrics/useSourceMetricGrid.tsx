import Loader from '@/components/common/Loader';
import SourceMetricCard from '@/components/domains/metrics/SourceMetricCard';
import { Database } from '@/db/schema';
import { LazyLoadOptions, useLazyLoad } from '@/hooks/common/useLazyLoad';
import {
  getSourceMetricsRollupGlobal,
  getSourceMetricsRollupParent,
  getSourceMetricsRollupSite,
} from '@/services/source/metrics';

type Props<T> = {
  scope: 'site' | 'parent' | 'global';
  sourceId: string;
  siteId?: string;
  route?: string;
} & Omit<LazyLoadOptions<T>, 'skeleton' | 'fetcher' | 'render'>;

export default function useSourceMetricGrid<T>({
  scope,
  sourceId,
  siteId,
  route,
  ...props
}: Props<T>) {
  return useLazyLoad({
    fetcher: async () => {
      switch (scope) {
        case 'site': {
          const metrics = await getSourceMetricsRollupSite(sourceId, siteId!);
          if (metrics.ok) {
            return metrics.data.rows;
          }

          return undefined;
        }
        case 'parent': {
          const metrics = await getSourceMetricsRollupParent(sourceId, siteId!);
          if (metrics.ok) {
            return metrics.data.rows;
          }

          return undefined;
        }
        case 'global': {
          const metrics = await getSourceMetricsRollupGlobal(sourceId);
          if (metrics.ok) {
            return metrics.data.rows;
          }

          return undefined;
        }
      }
    },
    render: (data) => {
      if (!data) return null;

      if (!data.length) {
        return (
          <div className="flex h-[50vh] justify-center items-center">
            <strong>No metrics found. Sync tenant.</strong>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((metric) => {
            return (
              <SourceMetricCard
                key={metric.name}
                metric={
                  metric as unknown as Database['public']['Views']['rollup_metrics_site']['Row']
                }
                baseRoute={route}
              />
            );
          })}
        </div>
      );
    },
    skeleton: () => <Loader />,
    ...props,
  });
}
