import Loader from '@/components/shared/Loader';
import SourceMetricCard from '@/components/source/metrics/SourceMetricCard';
import { getRows } from '@/db/orm';
import { Database } from '@/db/schema';
import { LazyLoadOptions, useLazyLoad } from '@/hooks/common/useLazyLoad';
import {
  getSourceMetricsRollupGlobal,
  getSourceMetricsRollupParent,
  getSourceMetricsRollupSite,
} from '@/services/source/metrics';

type Props<T> = {
  scope: 'site' | 'parent' | 'global' | 'group';
  sourceId: string;
  siteId?: string;
  groupId?: string;
  route?: string;
} & Omit<LazyLoadOptions<T>, 'skeleton' | 'fetcher' | 'render'>;

export default function SourceMetricsGrid<T>({
  scope,
  sourceId,
  siteId,
  groupId,
  route,
  ...props
}: Props<T>) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      switch (scope) {
        case 'group': {
          const metrics = await getRows('rollup_metrics_group', {
            filters: [
              ['group_id', 'eq', groupId],
              ['source_id', 'eq', sourceId],
            ],
          });
          if (metrics.ok) {
            console.log(metrics.data.rows);
            return metrics.data.rows;
          }

          return undefined;
        }
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
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
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
    deps: [],
    ...props,
  });

  return content;
}
