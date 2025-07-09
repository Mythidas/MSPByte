import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { Spinner } from '@/components/common/Spinner';
import { Tables } from '@/db/schema';
import { useAsync } from '@/hooks/useAsync';
import { getSourceTenants } from '@/services/source/tenants';
import { MicrosoftTenantMetadata } from '@/types/MicrosoftTenant';
import SourceMetricsAggregatedGroupedTable from '@/components/domains/metrics/tables/SourceMetricsAggregatedGroupedTable';
import { getSites } from '@/services/sites';

type Props = {
  sourceId: string;
  siteId: string;
};

export default function MicrosoftParentDashboardTab({ sourceId, siteId }: Props) {
  const {
    data: { tenants, domains },
    isLoading,
  } = useAsync<{
    tenants: Tables<'source_tenants'>[];
    domains: string[];
  }>({
    initial: { tenants: [], domains: [] },
    fetcher: async () => {
      const sites = await getSites(siteId);
      if (!sites.ok) throw 'Failed to fetch sites. Please refresh.';

      const tenants = await getSourceTenants(sourceId, [
        siteId,
        ...sites.data.map((site) => site.id),
      ]);
      if (!tenants.ok) throw 'Failed to fetch mapping. Please refresh.';

      return {
        tenants: tenants.data,
        domains: tenants.data.flatMap(
          (tenant) => (tenant.metadata as MicrosoftTenantMetadata).domains ?? []
        ),
      };
    },
    deps: [sourceId, siteId],
  });

  if (isLoading) {
    return (
      <TabsContent value="dashboard" className="flex flex-col h-[50vh] justify-center items-center">
        <Spinner size={48} />
      </TabsContent>
    );
  }

  if (!tenants) {
    return (
      <ErrorDisplay message="No valid mapping exists. Please map this site and source in Intergrations." />
    );
  }

  return (
    <TabsContent value="dashboard">
      <div className="flex flex-col gap-4">
        <div className="flex w-full justify-between">
          <h1 className="font-bold text-2xl">Microsoft 365</h1>
        </div>
        <div className="grid gap-2">
          <h2 className="font-bold text-xl">Domains</h2>
          <div className="flex gap-2">
            {domains.map((domain) => (
              <Badge key={domain}>{domain}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <h2 className="font-bold text-xl">Quick Metrics</h2>
          <div>
            <SourceMetricsAggregatedGroupedTable
              sourceId={sourceId}
              parentId={siteId}
              baseRoute={`/sites/${siteId}/${sourceId}?sub=aggregated`}
            />
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
