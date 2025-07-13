import Loader from '@/components/common/Loader';
import { getSites } from '@/services/sites';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import MicrosoftTenantsTable from '@/components/domains/microsoft/tables/MicrosoftTenantsTable';

type Props = {
  sourceId: string;
  parent?: Tables<'sites'>;
};

export default function MicrosoftTenantsTab({ sourceId, parent }: Props) {
  const { content } = useLazyLoad({
    loader: async () => {
      const sites = await getSites(parent?.id);
      if (!sites.ok) return;

      return parent ? [parent, ...sites.data.rows] : sites.data.rows;
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch data.</strong>;

      return (
        <MicrosoftTenantsTable
          sourceId={sourceId}
          siteIds={data.map((s) => s.id)}
          parentLevel={!!parent}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
