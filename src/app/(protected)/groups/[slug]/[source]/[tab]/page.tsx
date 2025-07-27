'use client';

import { useParams } from 'next/navigation';
import { SOURCE_TABS } from '@/config/sourceTabs';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import Loader from '@/components/shared/Loader';
import { getRow } from '@/db/orm';

export default function Page() {
  const { source, tab, slug } = useParams();
  const tabInfo = SOURCE_TABS[source as string];

  const { content } = useLazyLoad({
    fetcher: async () => {
      const group = await getRow('site_groups', {
        filters: [['id', 'eq', slug]],
      });
      if (group.ok) return group.data;
    },
    render: (data) => {
      if (!data) return <strong>No group found. Please Refresh.</strong>;
      if (!tabInfo[tab as string]) return <strong>No {tab} tab defined for this source.</strong>;

      return tabInfo[tab as string].content(source as string, undefined, undefined, data);
    },
    skeleton: () => <Loader />,
  });

  return content;
}
