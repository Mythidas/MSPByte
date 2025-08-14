'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { useSite } from '@/shared/lib/providers/SiteContext';

export default function Page() {
  const { source, tab } = useParams();
  const tabInfo = SOURCE_TABS[source as string];
  const site = useSite();

  if (!site) return <strong>No site found. Please Refresh.</strong>;
  if (!tabInfo[tab as string]) return <strong>No {tab} tab defined for this source.</strong>;

  return tabInfo[tab as string].content(source as string, site, undefined);
}
