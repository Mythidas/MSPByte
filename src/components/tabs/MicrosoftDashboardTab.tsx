import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import { Spinner } from '@/components/ux/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { getSiteSourceMapping } from '@/services/siteSourceMappings';

type Props = {
  sourceId: string;
  siteId: string;
};

export default function MicrosoftDashboardTab({ sourceId, siteId }: Props) {
  const { data, isLoading } = useAsync({
    fetcher: async () => {
      const mapping = await getSiteSourceMapping(sourceId, siteId);
      if (!mapping.ok) throw 'Failed to fetch mapping. Please refresh.';

      return {
        mapping: mapping.data,
      };
    },
    deps: [sourceId, siteId],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-[50vh] justify-center items-center">
        <Spinner size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <ErrorDisplay message="No valid mapping exists. Please map this site and source in Intergrations." />
    );
  }

  return (
    <TabsContent value="dashboard">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-2xl">Microsoft 365</h1>
        <div>
          <h2 className="font-bold text-xl">Domains</h2>
          <div>
            <Badge>{data.mapping.external_name}</Badge>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
