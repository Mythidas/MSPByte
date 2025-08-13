'use client';

import Loader from '@/components/shared/Loader';
import GroupSiteTable from '@/components/domain/groups/GroupSitesTable';
import { getRow } from '@/db/orm';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { useParams } from 'next/navigation';

export default function Page() {
  const { slug } = useParams();
  const { content } = useLazyLoad({
    fetcher: async () => {
      const group = await getRow('public', 'site_groups', {
        filters: [['id', 'eq', slug]],
      });
      if (group.error) return group.data;
    },
    render: (data) => {
      if (!data) return <strong>Failed to find group. Please refresh.</strong>;

      return <GroupSiteTable group={data} />;
    },
    skeleton: () => <Loader />,
  });

  return content;
}
