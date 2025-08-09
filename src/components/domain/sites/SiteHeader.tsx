'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRowsCount } from '@/db/orm';
import { Tables } from '@/types/db';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Building, Building2, Globe } from 'lucide-react';

type Props = {
  site: Tables<'public', 'sites'>;
};

export default function SiteHeader({ site }: Props) {
  const { content: ChildBadge } = useLazyLoad({
    fetcher: async () => {
      if (!site.is_parent) return 0;

      const sites = await getRowsCount('public', 'sites', {
        filters: [['parent_id', 'eq', site.id]],
      });

      return sites.ok ? sites.data : 0;
    },
    render: (data) => {
      if (!site.is_parent) return null;

      return (
        <Badge variant="outline">
          <Building className="h-3 w-3 mr-1" />
          {data} Child Sites
        </Badge>
      );
    },
    skeleton: () => {
      if (!site.is_parent) return null;
      <Skeleton className="w-20 h-5" />;
    },
    deps: [site],
  });

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          {site.is_parent ? <Globe className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
        </div>
        <div className="flex gap-2">
          <h1 className="text-2xl font-bold">{site.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={site.is_parent ? 'default' : 'secondary'}>
              {site.is_parent ? 'Parent Site' : 'Site'}
            </Badge>
            {ChildBadge}
          </div>
        </div>
      </div>
    </div>
  );
}
