import SophosDevicesTable from "@/components/tables/SophosDevicesTable";
import { TabsContent } from "@/components/ui/tabs";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import { getSourceDevices } from "@/lib/actions/server/sources/source-devices";

type Props = {
  sourceId: string;
  siteId?: string;
  tabValue: string;
  search?: string;
}

export default async function SophosDevicesTab({ sourceId, siteId, tabValue, search }: Props) {
  const devices = await getSourceDevices(sourceId, siteId);

  if (!devices.ok) {
    return <ErrorDisplay message="Failed to fetch data" />
  }

  return (
    <TabsContent value={tabValue}>
      <SophosDevicesTable devices={devices.data} defaultSearch={search} />
    </TabsContent>
  );
}