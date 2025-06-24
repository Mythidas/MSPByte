'use client';

import SophosDevicesTable from '@/components/tables/SophosDevicesTable';
import { TabsContent } from '@/components/ui/tabs';
import { Tables } from '@/db/schema';
import { getSourceDevicesView } from 'packages/services/devices';
import { useEffect, useState } from 'react';

type Props = {
  sourceId: string;
  siteIds?: string[];
};

export default function SophosDevicesTab({ sourceId, siteIds }: Props) {
  const [devices, setDevices] = useState<Tables<'source_devices_view'>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const devices = await getSourceDevicesView(sourceId, siteIds);
      if (devices.ok) {
        setDevices(devices.data);
      }
    };

    loadData();
  }, [sourceId, siteIds]);

  return (
    <TabsContent value="devices">
      <SophosDevicesTable devices={devices} siteLevel={siteIds?.length === 1} />
    </TabsContent>
  );
}
