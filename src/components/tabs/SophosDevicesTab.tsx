'use client'

import SophosDevicesTable from "@/components/tables/SophosDevicesTable";
import { TabsContent } from "@/components/ui/tabs";
import { getSourceDevices } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { useEffect, useState } from "react";

type Props = {
  integration: Tables<'source_integrations_view'>;
  search: string;
}

export default function SophosDevicesTab({ integration, search }: Props) {
  const [devices, setDevices] = useState<Tables<'source_devices_view'>[]>([]);

  useEffect(() => {
    const loadDevices = async () => {
      const devices = await getSourceDevices(integration.source_id!);
      setDevices(devices.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
    }

    loadDevices();
  }, [search]);

  return (
    <TabsContent value={integration.source_slug || ""}>
      <SophosDevicesTable devices={devices} defaultSearch={search} />
    </TabsContent>
  );
}