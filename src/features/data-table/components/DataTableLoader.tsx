import Loader from '@/shared/components/Loader';
import { useLazyLoad } from '@/shared/hooks/useLazyLoad';
import { Tables } from '@/types/db';
import { getRows } from '@/db/orm';
import { ComponentType } from 'react';

type Props = {
  sourceId: string;
  site?: Tables<'public', 'sites'>;
  parent?: Tables<'public', 'sites'>;
  group?: Tables<'public', 'site_groups'>;
  TableComponent: ComponentType<{
    sourceId: string;
    siteIds?: string[];
    parentLevel: boolean;
    siteLevel: boolean;
  }>;
};

export default function DataTableLoader({ sourceId, parent, site, group, TableComponent }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (group) {
        const memberships = await getRows('public', 'site_group_memberships', {
          filters: [['group_id', 'eq', group.id]],
        });
        if (memberships.error) {
          return undefined;
        }

        return memberships.data.rows.map((m) => m.site_id);
      }

      if (site) {
        return [site.id];
      }

      if (parent) {
        const sites = await getRows('public', 'sites', {
          filters: [parent ? ['parent_id', 'eq', parent.id] : undefined],
        });
        if (sites.error) return undefined;

        return [parent.id, ...sites.data.rows.map((s) => s.id)];
      }

      return undefined;
    },
    render: (siteIds) => {
      if (!siteIds && (!!parent || !!site || !!group)) {
        return <strong>Failed to fetch data.</strong>;
      } else {
        if (siteIds && !siteIds.length) return <strong>No sites found.</strong>;
      }

      return (
        <TableComponent
          sourceId={sourceId}
          siteIds={siteIds || undefined}
          parentLevel={!!parent}
          siteLevel={!!site}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
