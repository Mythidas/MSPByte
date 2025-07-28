'use client';

import Icon from '@/components/shared/Icon';
import SourceSyncStatus from '@/components/source/sources/SourceSyncStatus';
import SyncSourceItem from '@/components/source/sources/SyncSourceItem';
import { SOURCE_HEADERS } from '@/config/sourceHeaders';
import { usePathname } from 'next/navigation';

type Props = {
  sourceId: string;
  tenantId: string;
  siteId?: string;
  groupId?: string;
};

export default function IntegrationHeader({ sourceId, siteId, tenantId, groupId }: Props) {
  const headerInfo = SOURCE_HEADERS[sourceId];
  const pathname = usePathname();
  const parent = pathname.includes('grouped');

  return (
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
        {siteId && !parent && (
          <SourceSyncStatus sourceId={sourceId} siteId={siteId} tenantId={tenantId} />
        )}
        {siteId && parent && (
          <SyncSourceItem type="parent" sourceId={sourceId} tenantId={tenantId} />
        )}
        {!siteId && !parent && !groupId && (
          <SyncSourceItem type="global" sourceId={sourceId} tenantId={tenantId} />
        )}
        {groupId && (
          <SyncSourceItem type="group" sourceId={sourceId} tenantId={tenantId} groupId={groupId} />
        )}
      </div>
    </div>
  );
}
