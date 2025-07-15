'use client';

import SophosDevicesTab from '@/components/domains/sophos/tabs/SophosDevicesTab';
import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Tables } from '@/db/schema';
import { Database } from 'lucide-react';
import { LazyTabContent } from '@/components/common/LazyTabsContent';
import SophosParentashboardTab from '@/components/domains/sophos/tabs/SophosParentDashboardTab';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function SophosParentMapping({ sourceId, site, tab }: Props) {
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
            button
          />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard">
          <SophosParentashboardTab sourceId={sourceId} siteId={site.id} />
        </LazyTabContent>
        <LazyTabContent value="devices">
          <SophosDevicesTab sourceId={sourceId} parentId={site.id} />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
