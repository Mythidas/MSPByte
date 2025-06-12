'use client'

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { Input } from "@/components/ui/input";
import { pascalCase } from "@/lib/utils";
import PaginatedTable from "@/components/ux/PaginatedTable";

type Props = {
  devices: Tables<'source_devices_view'>[];
  defaultSearch?: string;
}

export default function SophosDevicesTable({ devices, defaultSearch }: Props) {
  const [search, setSearch] = useState(defaultSearch || "");

  function filterDevices(device: Tables<'source_devices_view'>) {
    const lowerSearch = search.toLowerCase();
    const lowerName = device.hostname!.toLowerCase();
    const lowerOS = device.os!.toLowerCase();
    const lowerSerial = device.serial!.toLowerCase();
    const lowerProt = (device.metadata as any).packages.protection.name.toLowerCase();
    const lowerStatus = (device.metadata as any).packages.protection.status.toLowerCase();
    const lowerSite = device.site_name!.toLowerCase();
    const lowerClient = device.client_name!.toLowerCase();
    return lowerName.includes(lowerSearch) ||
      lowerOS.includes(lowerSearch) ||
      lowerSerial.includes(lowerSearch) ||
      lowerProt.includes(lowerSearch) ||
      lowerStatus.includes(lowerSearch) ||
      lowerSite.includes(lowerSearch) ||
      lowerClient.includes(lowerSearch);
  }

  return (
    <div className="flex flex-col size-full gap-4">
      <div className="flex items-center w-full max-w-sm space-x-2">
        <Input
          placeholder="Search devices..."
          className="h-9"
          type="search"
          defaultValue={defaultSearch}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="py-2">
        <PaginatedTable
          data={devices.filter(filterDevices)}
          head={() =>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Protection</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          }
          body={(data) =>
            <>
              {data.map((device) =>
                <TableRow key={device.id}>
                  <TableCell>{device.site_name}</TableCell>
                  <TableCell>{device.client_name!.length > 15 ? `${device.client_name?.substring(0, 15)}...` : device.client_name}</TableCell>
                  <TableCell>{device.hostname}</TableCell>
                  <TableCell>{device.os}</TableCell>
                  <TableCell>{(device.metadata as any).packages.protection.name}</TableCell>
                  <TableCell>{pascalCase((device.metadata as any).packages.protection.status)}</TableCell>
                </TableRow>
              )}
            </>
          }
        />
      </Card>
    </div>
  );
}