import Loader from '@/components/shared/Loader';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
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
    siteIds: string[];
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
        if (!memberships.ok) {
          return [];
        }

        return memberships.data.rows.map((m) => m.site_id);
      }

      if (site) {
        return [site.id];
      }

      const sites = await getRows('public', 'sites', {
        filters: [['parent_id', 'is', parent?.id]],
      });
      if (!sites.ok) return [];

      return parent
        ? [parent.id, ...sites.data.rows.map((s) => s.id)]
        : sites.data.rows.map((s) => s.id);
    },
    render: (siteIds) => {
      if (!siteIds) return <strong>Failed to fetch data.</strong>;
      if (!siteIds.length) return <strong>No sites found.</strong>;

      return (
        <TableComponent
          sourceId={sourceId}
          siteIds={siteIds}
          parentLevel={!!parent}
          siteLevel={!!site}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
