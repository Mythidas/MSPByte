import SophosDevicesTable from '@/components/domains/sophos/SophosDevicesTable';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Loader from '@/components/common/Loader';
import { useAsync } from '@/hooks/useAsync';
import { getSites } from '@/services/sites';

type Props = {
  sourceId: string;
  parentId?: string;
};

export default function SophosDevicesTab({ sourceId, parentId }: Props) {
  const { data, isLoading } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      const sites = await getSites(parentId);
      if (!sites.ok) throw 'Failed to fetch sites. Please refresh.';

      return {
        sites: sites.data,
      };
    },
    deps: [parentId],
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
    <TabsContent value="devices">
      <SophosDevicesTable sourceId={sourceId} siteIds={data.sites.map((s) => s.id)} />
    </TabsContent>
  );
}
