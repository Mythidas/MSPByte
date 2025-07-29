import Loader from '@/components/shared/Loader';
import SourceMetricCard from '@/components/domain/metrics/SourceMetricCard';
import { getRows } from '@/db/orm';
import { Database } from '@/db/schema';
import { LazyLoadOptions, useLazyLoad } from '@/hooks/common/useLazyLoad';
import {
  getSourceMetricsRollupGlobal,
  getSourceMetricsRollupParent,
  getSourceMetricsRollupSite,
} from '@/services/source/metrics';

type Scope = 'site' | 'parent' | 'global' | 'group';

type Props<T> = {
  scope: Scope;
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
          const result = await getRows('rollup_metrics_group', {
            filters: [
              ['group_id', 'eq', groupId],
              ['source_id', 'eq', sourceId],
            ],
          });
          return result.ok ? result.data.rows : undefined;
        }

        case 'site': {
          const result = await getSourceMetricsRollupSite(sourceId, siteId!);
          return result.ok ? result.data.rows : undefined;
        }

        case 'parent': {
          const result = await getSourceMetricsRollupParent(sourceId, siteId!);
          return result.ok ? result.data.rows : undefined;
        }

        case 'global': {
          const result = await getSourceMetricsRollupGlobal(sourceId);
          return result.ok ? result.data.rows : undefined;
        }

        default:
          return undefined;
      }
    },
    render: (data) => {
      if (!data?.length) {
        return (
          <div className="flex h-[50vh] items-center justify-center text-sm text-muted-foreground">
            <strong>No metrics found. Sync tenant.</strong>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
          {data.map((metric) => (
            <SourceMetricCard
              key={metric.name}
              metric={
                metric as unknown as Database['public']['Views']['rollup_metrics_site']['Row']
              }
              baseRoute={route}
            />
          ))}
        </div>
      );
    },
    skeleton: () => <Loader />,
    deps: [],
    ...props,
  });

  return content;
}
