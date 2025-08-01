'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRowsCount } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Building } from 'lucide-react';

type Props = {
  group: Tables<'site_groups'>;
};

export default function GroupHeader({ group }: Props) {
  const { content: ChildBadge } = useLazyLoad({
    fetcher: async () => {
      const memberships = await getRowsCount('site_group_memberships', {
        filters: [['group_id', 'eq', group.id]],
      });

      return memberships.ok ? memberships.data : 0;
    },
    render: (data) => {
      return (
        <Badge variant="outline">
          <Building className="h-3 w-3 mr-1" />
          {data} Sites
        </Badge>
      );
    },
    skeleton: () => <Skeleton className="w-20 h-5" />,
    deps: [group],
  });

  return ChildBadge;
}
