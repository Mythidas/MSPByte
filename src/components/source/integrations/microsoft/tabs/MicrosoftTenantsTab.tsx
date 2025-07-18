import Loader from '@/components/shared/Loader';
import { getSites } from '@/services/sites';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import MicrosoftTenantsTable from '@/components/source/integrations/microsoft/tables/MicrosoftTenantsTable';
import { Tables } from '@/db/schema';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

export default function MicrosoftTenantsTab({ sourceId, parent, site }: Props) {
  const { content } = useLazyLoad({
    fetcher: async () => {
      if (site) {
        return [site.id];
      }

      const sites = await getSites(parent?.id);
      if (!sites.ok) return;

      return parent
        ? [parent.id, ...sites.data.rows.map((s) => s.id)]
        : sites.data.rows.map((s) => s.id);
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch data.</strong>;

      return (
        <MicrosoftTenantsTable
          sourceId={sourceId}
          siteIds={data}
          parentLevel={!!parent}
          siteLevel={!!site}
        />
      );
    },
    skeleton: () => <Loader />,
  });

  return content;
}
