'use client'

import SophosDevicesTable from "@/components/tables/SophosDevicesTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSourceDevices, getSourceMetrics } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { useEffect, useState } from "react";

type Props = {
  site: Tables<'sites'>;
  mapping: Tables<'site_source_mappings'>;
}

export default function SophosPartnerTab({ site, mapping }: Props) {
  const [metrics, setMetrics] = useState<Tables<'source_metrics'>[]>([]);
  const [devices, setDevices] = useState<Tables<'source_devices_view'>[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const metrics = await getSourceMetrics(mapping.source_id, mapping.site_id);
      setMetrics(metrics);
    }

    const loadDevices = async () => {
      const devices = await getSourceDevices(mapping.source_id, mapping.site_id);
      setDevices(devices.sort((a, b) => a.hostname!.localeCompare(b.hostname!)));
    }

    loadMetrics();
    loadDevices();
  }, [site]);

  return (
    <TabsContent value="sophos-partner">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
          {metrics.map((metric) => {
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
        <TabsContent value="devices">
          <SophosDevicesTable devices={devices} />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}