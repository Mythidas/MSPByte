import { TabsContent } from '@/components/ui/tabs';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSourceMetricsRollup } from '@/services/source/metrics';
import Loader from '@/components/common/Loader';
import SourceMetricCard from '@/components/domains/metrics/SourceMetricCard';
import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

type Props = {
  sourceId: string;
};

export default function SophosGlobalDashboardTab({ sourceId }: Props) {
  const { content: MetricsGrid } = useSourceMetricGrid({ scope: 'global', sourceId });

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
