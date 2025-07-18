import MicrosoftIdentitiesTable from '@/components/source/integrations/microsoft/tables/MicrosoftIdentitiesTable';
import Loader from '@/components/shared/Loader';
import { getSites } from '@/services/sites';
import { Tables } from '@/db/schema';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';

type Props = {
  sourceId: string;
  parent?: Tables<'sites'>;
  site?: Tables<'sites'>;
};

export default function MicrosoftIdentitiesTab({ sourceId, parent, site }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (site) {
        return [site];
      }

      const sites = await getSites(parent?.id || undefined);
      if (!sites.ok) return;

      return parent ? [parent, ...sites.data.rows] : sites.data.rows;
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch data.</strong>;

      return (
        <MicrosoftIdentitiesTable
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
