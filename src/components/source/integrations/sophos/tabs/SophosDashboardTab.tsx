import { Tables } from '@/db/schema';
import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
};

export default function SophosDashboardTab({ sourceId, site }: Props) {
  const { content: MetricsGrid } = useSourceMetricGrid({
    scope: 'site',
    sourceId,
    siteId: site.id,
    route: `/${sourceId}/sites/${site.slug}`,
  });

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
