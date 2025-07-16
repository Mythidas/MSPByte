import Loader from '@/components/common/Loader';
import { getSites } from '@/services/sites';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import MicrosoftTenantsTable from '@/components/domains/microsoft/tables/MicrosoftTenantsTable';

type Props = {
  sourceId: string;
  parentId?: string;
  siteId?: string;
};

export default function MicrosoftTenantsTab({ sourceId, parentId, siteId }: Props) {
  const { content } = useLazyLoad({
    loader: async () => {
      if (siteId) {
        return [siteId];
      }

      const sites = await getSites(parentId);
      if (!sites.ok) return;

      return parentId
        ? [parentId, ...sites.data.rows.map((s) => s.id)]
        : sites.data.rows.map((s) => s.id);
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch data.</strong>;

      return (
        <MicrosoftTenantsTable
          sourceId={sourceId}
          siteIds={data}
          parentLevel={!!parent}
          siteLevel={!!siteId}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
