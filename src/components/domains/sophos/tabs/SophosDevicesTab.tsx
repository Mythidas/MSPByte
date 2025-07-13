import SophosDevicesTable from '@/components/domains/sophos/SophosDevicesTable';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import Loader from '@/components/common/Loader';
import { useAsync } from '@/hooks/common/useAsync';
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
        sites: sites.data.rows,
      };
    },
    deps: [parentId],
  });

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <ErrorDisplay message="Failed to fetch data. Please refresh." />;
  }

  return (
    <SophosDevicesTable
      sourceId={sourceId}
      siteIds={data.sites.map((s) => s.id)}
      parentLevel={!!parentId}
    />
  );
}
