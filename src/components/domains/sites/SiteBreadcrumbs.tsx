'use client';

import {
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSite } from '@/services/sites';
import { getSource } from '@/services/sources';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

type Props = {
  site: Tables<'sites'>;
};

export default function SiteBreadcrumbs({ site }: Props) {
  const slug = useSelectedLayoutSegment();

  const { content } = useLazyLoad({
    loader: async () => {
      let source: Tables<'sources'> | undefined;
      let parent: Tables<'sites'> | undefined;

      if (site.parent_id) {
        const result = await getSite(site.parent_id);
        if (result.ok) {
          parent = result.data;
        }
      }

      if (slug) {
        const result = await getSource(slug as string);
        if (result.ok) {
          source = result.data;
        }
      }

      return {
        site,
        source,
        parent,
      };
    },
    render: (data) => {
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

      if (data.source) {
        crumbs.push(
          <BreadcrumbLink key={data.site.id} href={`/sites/${data.site.id}`}>
            {data.site.name}
          </BreadcrumbLink>
        );
        crumbs.push(<BreadcrumbPage key={data.source.id}>{data.source.name}</BreadcrumbPage>);
      } else {
        crumbs.push(<BreadcrumbPage key={data.site.id}>{data.site.name}</BreadcrumbPage>);
      }

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

  return content;
}
