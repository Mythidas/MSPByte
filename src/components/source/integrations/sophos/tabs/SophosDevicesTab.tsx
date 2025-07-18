import SophosDevicesTable from '@/components/source/integrations/sophos/SophosDevicesTable';
import Loader from '@/components/shared/Loader';
import { getSites } from '@/services/sites';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Tables } from '@/db/schema';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

export default function SophosDevicesTab({ sourceId, parent, site }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (site) return [site];
      const sites = await getSites(parent?.id);
      if (sites.ok) {
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
