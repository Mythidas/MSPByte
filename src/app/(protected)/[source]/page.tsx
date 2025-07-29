'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';

export default function Page() {
  const params = useParams();
  const sourceId = params['source'] as string;
  const tabInfo = SOURCE_TABS[sourceId];
  const tab = Object.entries(tabInfo)[0][0];

  return tabInfo[tab].content(sourceId);
}
