import SophosDevicesTable from '@/components/domains/sophos/SophosDevicesTable';
import Loader from '@/components/common/Loader';
import { getSites } from '@/services/sites';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';

type Props = {
  sourceId: string;
  parentId?: string;
};

export default function SophosDevicesTab({ sourceId, parentId }: Props) {
  const { content } = useLazyLoad({
    loader: async () => {
      const sites = await getSites(parentId);
      if (sites.ok) {
        return sites.data.rows;
      }
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch children. Please refresh.</strong>;

      return (
        <SophosDevicesTable
          sourceId={sourceId}
          siteIds={data.map((s) => s.id)}
          parentLevel={!!parentId}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
