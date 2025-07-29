'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';

export default function Page() {
  const { source, tab } = useParams();
  const tabInfo = SOURCE_TABS[source as string];

  if (!tabInfo[tab as string]) return <strong>No {tab} tab defined for this source.</strong>;

  return tabInfo[tab as string].content(source as string);
}
