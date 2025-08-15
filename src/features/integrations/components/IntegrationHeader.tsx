'use client';

import { SOURCE_HEADERS } from '@/config/sourceHeaders';
import { Separator } from '@/components/ui/separator';
import Icon from '@/shared/components/Icon';
import { Skeleton } from '@/components/ui/skeleton';
import SourceSyncStatus from '@/features/integrations/components/SourceSyncStatus';

type Props = {
  sourceId: string;
  tenantId?: string;
  siteId?: string;
  groupId?: string;
  hide?: boolean;
};

export default function IntegrationHeader({ sourceId, tenantId, siteId }: Props) {
  const headerInfo = SOURCE_HEADERS[sourceId];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon iconName={headerInfo.icon} className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{headerInfo.label}</h1>
            <p className="text-sm text-muted-foreground">{headerInfo.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!tenantId && <Skeleton className="w-32 h-8" />}
          {siteId && tenantId && (
            <SourceSyncStatus sourceId={sourceId} siteId={siteId} tenantId={tenantId} />
          )}
        </div>
      </div>
      <Separator />
    </>
  );
}
