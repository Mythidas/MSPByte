import SophosDevicesTab from "@/components/tabs/SophosDevicesTab";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSourceMetrics } from "@/lib/actions/server/sources/source-metrics";
import { Tables } from "@/types/database";

type Props = {
  mapping: Tables<'site_mappings_view'>;
}

export default async function SophosPartnerMapping({ mapping }: Props) {
  const metrics = await getSourceMetrics(mapping.source_id!, mapping.site_id!);

  if (!metrics.ok) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data
        </CardHeader>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="dashboard">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="devices">Devices</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return (
            <Card key={metric.id}>
              <CardHeader>
                {metric.name}
              </CardHeader>
              <CardContent>
                {metric.metric} {metric.unit}
              </CardContent>
            </Card>
          )
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={mapping.source_id!} siteId={mapping.site_id!} tabValue="devices" />
    </Tabs>
  );
}