'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import Loader from '@/components/shared/Loader';
import { getRow } from '@/db/orm';

export default function Page() {
  const params = useParams();
  const sourceId = params['source'] as string;
  const tabInfo = SOURCE_TABS[sourceId];
  const tab = Object.entries(tabInfo)[0][0];

  const { content } = useLazyLoad({
    fetcher: async () => {
      const group = await getRow('public', 'site_groups', {
        filters: [['id', 'eq', params['slug']]],
      });
      return group.data;
    },
    render: (data) => {
      if (!data) return <strong>No group found. Please Refresh.</strong>;

      return tabInfo[tab].content(sourceId, undefined, undefined, data);
    },
    skeleton: () => <Loader />,
  });

  return content;
}
