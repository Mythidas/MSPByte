'use client'

import SophosDevicesTable from "@/components/tables/SophosDevicesTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSourceMetrics } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { useEffect, useState } from "react";

type Props = {
  site: Tables<'sites'>;
  mapping: Tables<'site_source_mappings'>;
}

export default function SophosPartnerTab(props: Props) {
  const [metrics, setMetrics] = useState<Tables<'source_metrics'>[]>([]);

  useEffect(() => {
    const loadMetrics = async () => {
      const metrics = await getSourceMetrics(props.mapping.source_id, props.mapping.site_id);
      const uniqueMetrics: Tables<'source_metrics'>[] = [];

      const mdrManaged = metrics.find((m) => m.name === 'MDR Managed Endpoints');
      const upgradable = metrics.find((m) => m.name === 'Upgradable Endpoints');

      if (mdrManaged) uniqueMetrics.push(mdrManaged);
      if (upgradable) uniqueMetrics.push(upgradable);
      setMetrics(uniqueMetrics);
    }

    loadMetrics();
  }, [props.site]);

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
          <SophosDevicesTable site={props.site} mapping={props.mapping} />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}