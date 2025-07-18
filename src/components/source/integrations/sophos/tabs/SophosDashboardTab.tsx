import { Tables } from '@/db/schema';
import useSourceMetricGrid from '@/hooks/domains/metrics/useSourceMetricGrid';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

export default function SophosDashboardTab({ sourceId, site, parent }: Props) {
  const route = site || parent ? `/sites/${parent?.id ?? site?.id}/${sourceId}` : `/${sourceId}`;
  const { content: MetricsGrid } = useSourceMetricGrid({
    scope: site ? 'site' : parent ? 'parent' : 'global',
    sourceId,
    siteId: parent?.id || site?.id,
    route,
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
