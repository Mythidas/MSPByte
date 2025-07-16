'use client';

import SophosDevicesTable from '@/components/domains/sophos/SophosDevicesTable';
import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import { Tables } from '@/db/schema';
import { LazyTabContent } from '@/components/common/LazyTabsContent';
import SourceSyncStatus from '@/components/domains/sources/SourceSyncStatus';
import SophosDashboardTab from '@/components/domains/sophos/tabs/SophosDashboardTab';
import { Database } from 'lucide-react';
import { useAsync } from '@/hooks/common/useAsync';
import { getSourceTenant } from '@/services/source/tenants';
import Loader from '@/components/common/Loader';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function SophosSiteMapping({ sourceId, site, tab }: Props) {
  const { data, isLoading } = useAsync({
    initial: null,
    fetcher: async () => {
      const tenant = await getSourceTenant(sourceId, site.id);
      if (!tenant.ok) throw tenant.error.message;

      return tenant.data;
    },
    deps: [sourceId, site.id],
  });

  if (isLoading) return <Loader />;
  if (!data) return <strong>Site does not have a Tenant Mapping for this source.</strong>;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sophos Partner</h1>
            <p className="text-sm text-muted-foreground">Integration dashboard and metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SourceSyncStatus sourceId={sourceId} siteId={site.id} tenantId={site.tenant_id} />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard">
          <SophosDashboardTab sourceId={sourceId} siteId={site.id} />
        </LazyTabContent>
        <LazyTabContent value="devices">
          <SophosDevicesTable sourceId={sourceId} siteIds={[site.id]} siteLevel />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
