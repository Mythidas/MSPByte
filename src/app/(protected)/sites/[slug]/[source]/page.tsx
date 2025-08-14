'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { useSite } from '@/shared/lib/providers/SiteContext';

export default function Page() {
  const params = useParams();
  const sourceId = params['source'] as string;
  const tabInfo = SOURCE_TABS[sourceId];
  const site = useSite();
  const tab = Object.entries(tabInfo)[0][0];
  if (!site) return <strong>No site found. Please Refresh.</strong>;

  return tabInfo[tab].content(sourceId, undefined, site);
}
