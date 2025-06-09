'use client'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import { getSourceDevices } from "@/lib/functions/sources";
import { pascalCase } from "@/lib/utils";

type Props = {
  site: Tables<'sites'>;
  mapping: Tables<'site_source_mappings'>;
}

export default function SophosDevicesTable(props: Props) {
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<Tables<'source_devices'>[]>([]);

  useEffect(() => {
    const loadDevices = async () => {
      const devices = await getSourceDevices(props.mapping.source_id, props.mapping.site_id);
      setDevices(devices);
    }

    loadDevices();
  }, [props.site])

  function filterDevices(device: Tables<'source_devices'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = device.hostname.toLowerCase();
    const lowerOS = device.os.toLowerCase();
    const lowerSerial = device.serial.toLowerCase();
    return lowerName.includes(lowerSearch) || lowerOS.includes(lowerSearch) || lowerSerial.includes(lowerSearch);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full max-w-sm space-x-2">
          <Input
            placeholder="Search devices..."
            className="h-9"
            type="search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="py-2">
        <Table>
          <TableCaption>Total Devices: {devices.length}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Hostname</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Protection</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.filter(filterDevices).map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.hostname}</TableCell>
                <TableCell>{device.os}</TableCell>
                <TableCell>{(device.metadata as any).packages.protection.name}</TableCell>
                <TableCell>{pascalCase((device.metadata as any).packages.protection.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}