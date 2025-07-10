'use client';

import SophosDevicesTable from '@/components/domains/sophos/SophosDevicesTable';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Tables } from '@/db/schema';
import { AlertCircle, CheckCircle2, Clock, Database, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipTrigger, TooltipContent, Tooltip } from '@/components/ui/tooltip';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { getSourceSyncJobLatest } from '@/services/source/sync-jobs';
import { Badge } from '@/components/ui/badge';
import SophosDashboardTab from '@/components/domains/sophos/tabs/SophosDashboardTab';

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

export default function SophosSiteMapping({ sourceId, site, tab }: Props) {
  const { content } = useLazyLoad({
    loader: async () => {
      const syncJob = await getSourceSyncJobLatest(sourceId, site.id);
      if (syncJob.ok) {
        return syncJob.data;
      }
    },
    render: (data) => {
      if (!data) return null;
      const config = getStatusConfig(data.status);

      return (
        <Tooltip>
          <TooltipTrigger>
            <Badge
              variant={config.variant as 'default' | 'secondary' | 'destructive' | 'outline' | null}
              className="flex items-center gap-1 text-sm"
            >
              <config.icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              Last sync:{' '}
              {new Date(
                data.completed_at || data.started_at || data.created_at || ''
              ).toLocaleString()}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
    skeleton: () => <Skeleton className="w-24 h-6" />,
  });

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
          {content}
          <SyncSourceItem type="site" sourceId={sourceId} site={site} button />
        </div>
      </div>
      <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
        </TabsList>

        <SophosDashboardTab sourceId={sourceId} siteId={site.id} />
        <TabsContent value="devices">
          <SophosDevicesTable sourceId={sourceId} siteIds={[site.id]} siteLevel />
        </TabsContent>
      </Tabs>
    </>
  );
}
