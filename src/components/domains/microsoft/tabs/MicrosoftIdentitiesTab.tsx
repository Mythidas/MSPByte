import MicrosoftIdentitiesTable from '@/components/domains/microsoft/tables/MicrosoftIdentitiesTable';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Loader from '@/components/common/Loader';
import { useAsync } from '@/hooks/common/useAsync';
import { getSites } from '@/services/sites';
import { Tables } from '@/db/schema';

type Props = {
  sourceId: string;
  parent?: Tables<'sites'>;
};

export default function MicrosoftIdentitiesTab({ sourceId, parent }: Props) {
  const { data, isLoading } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      const sites = await getSites(parent?.id || '');
      if (!sites.ok) throw 'Failed to fetch sites. Please refresh.';

      return {
        sites: parent ? [parent, ...sites.data] : sites.data,
      };
    },
    deps: [parent],
  });

  if (isLoading) {
    return (
      <TabsContent value="identities">
        <Loader />
      </TabsContent>
    );
  }

  if (!data) {
    return (
      <TabsContent value="identities">
        <ErrorDisplay message="Failed to fetch data. Please refresh." />
      </TabsContent>
    );
  }

  return (
    <TabsContent value="identities">
      <MicrosoftIdentitiesTable
        sourceId={sourceId}
        siteIds={data.sites.map((s) => s.id)}
        parentLevel={!!parent}
      />
    </TabsContent>
  );
}
