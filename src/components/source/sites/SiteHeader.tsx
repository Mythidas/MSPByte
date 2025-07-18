'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { useSites } from '@/lib/providers/SitesContext';
import { Building2, Globe, Users } from 'lucide-react';

type Props = {
  site: Tables<'sites'>;
};

export default function SiteHeader({ site }: Props) {
  const sites = useSites();

  const { content: ChildBadge } = useLazyLoad({
    fetcher: async () => {
      if (!site.is_parent) return 0;

      return sites.filter((s) => s.parent_id === site.id).length;
    },
    render: (data) => {
      if (!site.is_parent) return null;

      return (
        <Badge variant="outline">
          <Users className="h-3 w-3 mr-1" />
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
        <div>
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
