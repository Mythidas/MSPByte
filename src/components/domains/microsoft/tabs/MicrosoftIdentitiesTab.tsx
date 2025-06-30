import MicrosoftIdentitiesTable from '@/components/domains/microsoft/tables/MicrosoftIdentitiesTable';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Loader from '@/components/common/Loader';
import { useAsync } from '@/hooks/useAsync';
import { getSites } from '@/services/sites';

type Props = {
  sourceId: string;
  siteId?: string;
};

export default function MicrosoftIdentitiesTab({ sourceId, siteId }: Props) {
  const { data, isLoading } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      const sites = await getSites(siteId);
      if (!sites.ok) throw 'Failed to fetch sites. Please refresh.';

      return {
        sites: sites.data,
      };
    },
    deps: [siteId],
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
        siteLevel={!siteId}
      />
    </TabsContent>
  );
}
