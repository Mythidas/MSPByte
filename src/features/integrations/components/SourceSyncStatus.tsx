'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLazyLoad } from '@/shared/hooks/useLazyLoad';
import { getSourceSyncJobLatest } from '@/services/source/sync-jobs';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, RotateCw } from 'lucide-react';
import SyncSourceItem from '@/features/integrations/components/SyncSourceItem';
import { cn } from '@/shared/lib/utils';

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
        label: 'Never',
        color: 'text-gray-600',
      };
  }
};

type Props = {
  sourceId: string;
  siteId: string;
  tenantId: string;
};

export default function SourceSyncStatus({ sourceId, siteId, tenantId }: Props) {
  const [isSyncing, setIsSyncing] = useState(false);

  const { content } = useLazyLoad({
    fetcher: async () => {
      const syncJob = await getSourceSyncJobLatest(sourceId, siteId);
      if (!syncJob.error) {
        if (syncJob.data.status === 'completed' && isSyncing) {
          setIsSyncing(false);
          window.location.reload();
        }

        return syncJob.data;
      }

      return undefined;
    },
    render: (data) => {
      const status = !data
        ? 'never'
        : data.status === 'completed' && isSyncing
          ? 'pending'
          : data.status;
      const config = getStatusConfig(status);
      const isRunning = status === 'running' || status === 'pending';

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex">
              <Badge
                variant={
                  config.variant as
                    | 'default'
                    | 'secondary'
                    | 'destructive'
                    | 'outline'
                    | null
                    | undefined
                }
                className="flex items-center gap-2 text-sm rounded-r-none"
              >
                <config.icon className="h-4 w-4" />
                {config.label}
              </Badge>
              <SyncSourceItem
                type="site"
                sourceId={sourceId}
                tenantId={tenantId}
                siteId={siteId}
                className="rounded-l-none"
                disabled={isSyncing || isRunning}
                onStart={() => setIsSyncing(true)}
              >
                <RotateCw className={cn((isSyncing || isRunning) && 'animate-spin')} />
              </SyncSourceItem>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">
              Last sync:{' '}
              {!data
                ? 'Never'
                : new Date(
                    data.completed_at || data.started_at || data.created_at || ''
                  ).toLocaleString()}
            </p>
          </TooltipContent>
        </Tooltip>
      );
    },
    skeleton: () => <Skeleton className="w-24 h-6" />,
    refetchInterval: 10000,
  });

  return content;
}
