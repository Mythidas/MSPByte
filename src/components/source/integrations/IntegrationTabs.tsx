'use client';

import Tabs from '@/components/shared/Tabs';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { usePathname } from 'next/navigation';

type Props = {
  sourceId: string;
  siteId?: string;
};

export default function IntegrationTabs({ sourceId, siteId }: Props) {
  const tabsInfo = SOURCE_TABS[sourceId];
  const pathname = usePathname();
  const grouped = pathname.includes('grouped');

  return (
    <Tabs
      tabs={tabsInfo}
      route={siteId ? `/sites/${siteId}/${sourceId}${grouped ? '/grouped' : ''}` : `/${sourceId}`}
    />
  );
}
