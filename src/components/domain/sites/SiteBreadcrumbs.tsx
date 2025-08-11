'use client';

import { Badge } from '@/components/ui/badge';
import {
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { getRow, getRowsCount } from '@/db/orm';
import { Tables } from '@/types/db';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Building } from 'lucide-react';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

type Props = {
  site: Tables<'public', 'sites'>;
};

export default function SiteBreadcrumbs({ site }: Props) {
  const slug = useSelectedLayoutSegment();

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

  const { content } = useLazyLoad({
    fetcher: async () => {
      let parent: Tables<'public', 'sites'> | undefined;

      if (site.parent_id) {
        const result = await getRow('public', 'sites', {
          filters: [['id', 'eq', site.parent_id]],
        });
        if (result.ok) {
          parent = result.data;
        }
      }

      return {
        site,
        parent,
      };
    },
    render: (data) => {
      if (!data) {
        return (
          <BreadcrumbLink key="sites" href="/sites">
            Sites
          </BreadcrumbLink>
        );
      }

      const crumbs: React.ReactNode[] = [];
      crumbs.push(
        <BreadcrumbLink key="sites" href="/sites">
          Sites
        </BreadcrumbLink>
      );
      if (data.parent) {
        crumbs.push(
          <BreadcrumbLink key={data.parent.id} href={`/sites/${data.parent.id}`}>
            {data.parent.name}
          </BreadcrumbLink>
        );
      }

      crumbs.push(<BreadcrumbPage key={data.site.id}>{data.site.name}</BreadcrumbPage>);

      return (
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, idx) => {
              if (idx === crumbs.length - 1) {
                return crumb;
              }

              return (
                <React.Fragment key={idx}>
                  {crumb}
                  <BreadcrumbSeparator />
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      );
    },
    skeleton: () => {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbPage>
              <Skeleton className="w-16 h-4" />
            </BreadcrumbPage>
            <BreadcrumbSeparator />
            <BreadcrumbPage>
              <Skeleton className="w-16 h-4" />
            </BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      );
    },
    deps: [site.id, slug],
  });

  return (
    <div className="flex justify-between">
      {content}
      <div className="flex gap-2">
        <Badge variant={site.is_parent ? 'default' : 'secondary'}>
          {site.is_parent ? 'Parent Site' : 'Site'}
        </Badge>
        {ChildBadge}
      </div>
    </div>
  );
}
