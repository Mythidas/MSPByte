'use client';

import SophosDevicesTab from '@/components/source/integrations/sophos/tabs/SophosDevicesTab';
import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/shared/secure/RouteTabsTrigger';
import SyncSourceItem from '@/components/source/sources/SyncSourceItem';
import { Database } from 'lucide-react';
import SophosGlobalDashboardTab from '@/components/source/integrations/sophos/tabs/SophosGlobalDashboardTab';
import { LazyTabContent } from '@/components/shared/LazyTabsContent';
import { useUser } from '@/lib/providers/UserContext';

type Props = {
  sourceId: string;
  tab?: string;
};

export default function SophosGlobalMapping({ sourceId, tab }: Props) {
  const { user } = useUser();

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
          <SyncSourceItem type="global" sourceId={sourceId} tenantId={user?.tenant_id || ''} />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
        </TabsList>

        <LazyTabContent value="dashboard">
          <SophosGlobalDashboardTab sourceId={sourceId} />
        </LazyTabContent>
        <LazyTabContent value="devices">
          <SophosDevicesTab sourceId={sourceId} />
        </LazyTabContent>
      </Tabs>
    </>
  );
}
