'use client';

import GroupSiteTable from '@/features/groups/components/GroupSitesTable';
import { getRow } from '@/db/orm';
import { useLazyLoad } from '@/shared/hooks/useLazyLoad';
import { useParams } from 'next/navigation';
import Loader from '@/shared/components/Loader';

export default function Page() {
  const { slug } = useParams();
  const { content } = useLazyLoad({
    fetcher: async () => {
      const group = await getRow('public', 'site_groups', {
        filters: [['id', 'eq', slug]],
      });
      if (!group.error) return group.data;
    },
    render: (data) => {
      if (!data) return <strong>Failed to find group. Please refresh.</strong>;

      return <GroupSiteTable group={data} />;
    },
    skeleton: () => <Loader />,
  });

  return content;
}
