'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRowsCount } from '@/db/orm';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Building, Building2 } from 'lucide-react';

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

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex gap-2">
          <h1 className="text-2xl font-bold">{group.name}</h1>
          <div className="flex items-center gap-2 mt-1">{ChildBadge}</div>
        </div>
      </div>
    </div>
  );
}
