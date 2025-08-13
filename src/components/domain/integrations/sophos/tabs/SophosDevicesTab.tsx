import SophosDevicesTable from '@/components/domain/integrations/sophos/SophosDevicesTable';
import Loader from '@/components/shared/Loader';
import { getRows } from '@/db/orm';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Tables } from '@/types/db';

type Props = {
  sourceId: string;
  site?: Tables<'public', 'sites'>;
  parent?: Tables<'public', 'sites'>;
};

export default function SophosDevicesTab({ sourceId, parent, site }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (site) return [site];
      const sites = await getRows('public', 'sites', {
        filters: [parent ? ['parent_id', 'eq', parent?.id] : undefined],
      });
      if (!sites.error) {
        return parent ? [parent!, ...sites.data.rows] : sites.data.rows;
      }
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch children. Please refresh.</strong>;

      return (
        <SophosDevicesTable
          sourceId={sourceId}
          siteIds={data.map((s) => s.id)}
          parentLevel={!!parent}
          siteLevel={!!site}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
