import { TabsContent } from '@/components/ui/tabs';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { getSourceMetricsRollup } from '@/services/source/metrics';
import Loader from '@/components/common/Loader';
import SourceMetricCard from '@/components/domains/metrics/SourceMetricCard';

type Props = {
  sourceId: string;
  siteId: string;
};

export default function SophosParentashboardTab({ sourceId, siteId }: Props) {
  const { content: MetricsGrid } = useLazyLoad({
    loader: async () => {
      const metrics = await getSourceMetricsRollup('parent', sourceId, siteId);
      if (metrics.ok) {
        return metrics.data;
      }
    },
    render: (data) => {
      if (!data) return null;

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((metric) => {
            return <SourceMetricCard key={metric.name} metric={metric} />;
          })}
        </div>
      );
    },
    skeleton: () => <Loader />,
  });

  return (
    <TabsContent value="dashboard" className="space-y-6">
      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quick Metrics</h2>
        </div>

        {MetricsGrid}
      </div>
    </TabsContent>
  );
}
