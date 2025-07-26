import Loader from '@/components/shared/Loader';
import { getSites } from '@/services/sites';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { Tables } from '@/db/schema';
import MicrosoftLicensesTable from '@/components/source/integrations/microsoft/tables/MicrosoftLicensesTable';

type Props = {
  sourceId: string;
  site?: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

export default function MicrosoftLicensesTab({ sourceId, parent, site }: Props) {
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
        <MicrosoftLicensesTable
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
