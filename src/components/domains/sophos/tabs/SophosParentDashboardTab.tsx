import { TabsContent } from '@/components/ui/tabs';
import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

type Props = {
  sourceId: string;
  siteId: string;
};

export default function SophosParentashboardTab({ sourceId, siteId }: Props) {
  const { content: MetricsGrid } = useSourceMetricGrid({ scope: 'parent', sourceId, siteId });

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
