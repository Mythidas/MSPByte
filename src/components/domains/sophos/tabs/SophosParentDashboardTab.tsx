import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

type Props = {
  sourceId: string;
  siteId: string;
};

export default function SophosParentDashboardTab({ sourceId, siteId }: Props) {
  const { content: MetricsGrid } = useSourceMetricGrid({ scope: 'parent', sourceId, siteId });

  return (
    <>
      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Quick Metrics</h2>
        </div>

        {MetricsGrid}
      </div>
    </>
  );
}
