import Loader from '@/components/common/Loader';
import SourceMetricCard from '@/components/domains/metrics/SourceMetricCard';
import { LazyLoadOptions, useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSourceMetricsRollup } from '@/services/source/metrics';

type Props<T> = {
  scope: 'site' | 'parent' | 'global';
  sourceId: string;
  siteId?: string;
  route?: string;
} & Omit<LazyLoadOptions<T>, 'skeleton' | 'loader' | 'render'>;

export default function useSourceMetricGrid<T>({
  scope,
  sourceId,
  siteId,
  route,
  ...props
}: Props<T>) {
  return useLazyLoad({
    loader: async () => {
      const metrics = await getSourceMetricsRollup(scope, sourceId, siteId);
      if (metrics.ok) {
        return metrics.data;
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
            return <SourceMetricCard key={metric.name} metric={metric} baseRoute={route} />;
          })}
        </div>
      );
    },
    skeleton: () => <Loader />,
    ...props,
  });
}
