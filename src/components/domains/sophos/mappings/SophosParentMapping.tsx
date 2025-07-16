'use client';

import SophosDevicesTab from '@/components/domains/sophos/tabs/SophosDevicesTab';
import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Tables } from '@/db/schema';
import { Database, Loader } from 'lucide-react';
import { LazyTabContent } from '@/components/common/LazyTabsContent';
import SophosParentDashboardTab from '@/components/domains/sophos/tabs/SophosParentDashboardTab';
import { useAsync } from '@/hooks/common/useAsync';
import { getSites } from '@/services/sites';
import { getSourceTenants } from '@/services/source/tenants';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function SophosParentMapping({ sourceId, site, tab }: Props) {
  const { data, isLoading } = useAsync({
    initial: [],
    fetcher: async () => {
      const sites = await getSites(site.id);
      if (!sites.ok) throw sites.error.message;

      const tenants = await getSourceTenants(sourceId, [
        site.id,
        ...sites.data.rows.map((s) => s.id),
      ]);
      if (!tenants.ok) throw tenants.error.message;

      return tenants.data.rows;
    },
    deps: [sourceId, site.id],
  });

  if (isLoading) return <Loader />;
  if (!data.length)
    return <strong>Children and Parent do not have a Tenant Mapping for this source.</strong>;

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
          <SyncSourceItem
            type="parent"
            sourceId={sourceId}
            tenantId={site.tenant_id}
            siteId={site.id}
          />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard">
          <SophosParentDashboardTab sourceId={sourceId} siteId={site.id} />
        </LazyTabContent>
        <LazyTabContent value="devices">
          <SophosDevicesTab sourceId={sourceId} parentId={site.id} />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
