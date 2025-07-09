'use client';

import { Tabs, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Tables } from '@/db/schema';
import { AlertCircle, CheckCircle2, Clock, Database, RefreshCw } from 'lucide-react';
import MicrosoftParentDashboardTab from '@/components/domains/microsoft/tabs/MicrosoftParentDashboardTab';
import MicrosoftIdentitiesTab from '@/components/domains/microsoft/tabs/MicrosoftIdentitiesTab';

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Synced',
        color: 'text-green-600',
      };
    case 'running':
      return {
        variant: 'secondary',
        icon: RefreshCw,
        label: 'Syncing',
        color: 'text-blue-600',
      };
    case 'failed':
      return {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Failed',
        color: 'text-red-600',
      };
    case 'pending':
      return {
        variant: 'secondary',
        icon: Clock,
        label: 'Pending',
        color: 'text-yellow-600',
      };
    default:
      return {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Unknown',
        color: 'text-gray-600',
      };
  }
};

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
          <SyncSourceItem type="parent" sourceId={sourceId} site={site} button />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>

        <MicrosoftParentDashboardTab sourceId={sourceId} siteId={site!.id} />
        <MicrosoftIdentitiesTab sourceId={sourceId} parent={site} />
      </Tabs>
    </>
  );
}
