'use client';

import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Database } from 'lucide-react';
import MicrosoftIdentitiesTab from '@/components/domains/microsoft/tabs/MicrosoftIdentitiesTab';
import MicrosoftGlobalDashboardTab from '@/components/domains/microsoft/tabs/MicrosoftGlobalDashboardTab';

type Props = {
  sourceId: string;
  tab?: string;
};

export default function MicrosoftGlobalMapping({ sourceId, tab }: Props) {
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
          <SyncSourceItem type="global" sourceId={sourceId} button />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>

        <MicrosoftGlobalDashboardTab sourceId={sourceId} />
        <MicrosoftIdentitiesTab sourceId={sourceId} />
      </Tabs>
    </>
  );
}
