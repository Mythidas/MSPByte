import SophosDevicesTable from '@/components/tables/SophosDevicesTable';
import { TabsContent } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import { getSourceDevices } from 'packages/services/devices';

type Props = {
  sourceId: string;
  siteIds?: string[];
  search?: string;
};

export default async function SophosDevicesTab({ sourceId, siteIds, search }: Props) {
  const devices = await getSourceDevices(sourceId, siteIds);

  if (!devices.ok) {
    return <ErrorDisplay message="Failed to fetch data" />;
  }

  return (
    <TabsContent value="devices">
      <SophosDevicesTable devices={devices.data} defaultSearch={search} />
    </TabsContent>
  );
}
