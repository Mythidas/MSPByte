'use client';

import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Tables } from '@/db/schema';
import { Database } from 'lucide-react';
import MicrosoftParentDashboardTab from '@/components/domains/microsoft/tabs/MicrosoftParentDashboardTab';
import MicrosoftIdentitiesTab from '@/components/domains/microsoft/tabs/MicrosoftIdentitiesTab';
import MicrosoftTenantsTab from '@/components/domains/microsoft/tabs/MicrosoftTenantsTab';
import { LazyTabContent } from '@/components/common/LazyTabsContent';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function MicrosoftParentMapping({ sourceId, site, tab }: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Microsoft 365</h1>
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
          <RouteTabsTrigger value="tenants">Tenants</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard" className="space-y-6">
          <MicrosoftParentDashboardTab sourceId={sourceId} siteId={site.id} />
        </LazyTabContent>
        <LazyTabContent value="tenants" className="space-y-6">
          <MicrosoftTenantsTab sourceId={sourceId} parent={site} />
        </LazyTabContent>
        <LazyTabContent value="identities" className="space-y-6">
          <MicrosoftIdentitiesTab sourceId={sourceId} parent={site} />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
