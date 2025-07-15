'use client';

import MicrosoftIdentitiesTable from '@/components/domains/microsoft/tables/MicrosoftIdentitiesTable';
import MicrosoftDashboardTab from '@/components/domains/microsoft/tabs/MicrosoftDashboardTab';
import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import { Tables } from '@/db/schema';
import { LazyTabContent } from '@/components/common/LazyTabsContent';
import { Database } from 'lucide-react';
import SourceSyncStatus from '@/components/domains/sources/SourceSyncStatus';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function MicrosoftSiteMapping({ sourceId, site, tab }: Props) {
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
          <SourceSyncStatus sourceId={sourceId} siteId={site.id} tenantId={site.tenant_id} />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard">
          <MicrosoftDashboardTab sourceId={sourceId} siteId={site!.id} />
        </LazyTabContent>
        <LazyTabContent value="identities">
          <MicrosoftIdentitiesTable sourceId={sourceId} siteIds={[site!.id]} siteLevel />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
