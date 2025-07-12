'use client';

import { pascalCase } from '@/lib/utils';
import { Tables } from '@/db/schema';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import DataTable from '@/components/common/table/DataTable';
import { DataTableHeader } from '@/components/common/table/DataTableHeader';
import { useEffect, useState } from 'react';
import { getSourceDevicesView } from '@/services/devices';
import { toast } from 'sonner';
import { textColumn } from '@/components/common/table/DataTableColumn';
import { DataTableColumnDef } from '@/types/data-table';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosDevicesTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const [devices, setDevices] = useState<Tables<'source_devices_view'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        const devices = await getSourceDevicesView(sourceId, siteIds);
        if (!devices.ok) {
          throw new Error();
        }

        setDevices(devices.data);
      } catch {
        toast.error('Failed to fetch data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sourceId, siteIds]);

  const protectionTypes = () => {
    const types = new Set<string>();
    for (const device of devices) {
      const name = (device.metadata as SPEndpoint)?.packages?.protection?.name;
      if (name) {
        types.add(name);
      }
    }

    return Array.from(types).map((type) => {
      return { label: type, value: type };
    });
  };

  return (
    <DataTable
      data={devices}
      isLoading={isLoading}
      initialVisibility={{ parent_name: !siteLevel && !parentLevel, site_name: !siteLevel }}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'site',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'parent_name',
            label: 'site',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'hostname',
            label: 'Hostname',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'os',
            label: 'OS',
            enableHiding: false,
            simpleSearch: true,
          }),
          {
            accessorKey: 'protection',
            header: ({ column }) => <DataTableHeader column={column} label="Protection" />,
            cell: ({ row }) => (
              <div>{(row.original.metadata as SPEndpoint).packages.protection?.name}</div>
            ),
            sortingFn: (rowA, rowB) => {
              if (
                !(rowB.original.metadata as SPEndpoint).packages.protection?.name ||
                !(rowA.original.metadata as SPEndpoint).packages.protection?.name
              ) {
                return 1;
              }
              return (rowA.original.metadata as SPEndpoint).packages.protection!.name.localeCompare(
                (rowB.original.metadata as SPEndpoint).packages.protection!.name
              );
            },
            filterFn: (row, colId, value) => {
              return (
                (row.original.metadata as SPEndpoint).packages.protection?.name === value.value
              );
            },
            filter: {
              type: 'select',
              options: protectionTypes(),
              placeholder: 'Search protection',
            },
            meta: {
              label: 'Protection',
            },
          },
          {
            accessorKey: 'status',
            header: ({ column }) => <DataTableHeader column={column} label="Status" />,
            cell: ({ row }) => (
              <div>
                {pascalCase(
                  (row.original.metadata as SPEndpoint)?.packages?.protection?.status || ''
                )}
              </div>
            ),
            filterFn: (row, colId, value) => {
              return (
                (row.original.metadata as SPEndpoint).packages.protection?.status === value.value
              );
            },
            sortingFn: (rowA, rowB) => {
              if (
                !(rowB.original.metadata as SPEndpoint).packages.protection?.status ||
                !(rowA.original.metadata as SPEndpoint).packages.protection?.status
              ) {
                return 1;
              }
              return (
                rowA.original.metadata as SPEndpoint
              ).packages.protection!.status.localeCompare(
                (rowB.original.metadata as SPEndpoint).packages.protection!.status
              );
            },
            filter: {
              type: 'select',
              options: [
                { label: 'Assigned', value: 'assigned' },
                { label: 'Upgradable', value: 'upgradable' },
                { label: 'Unassigned', value: 'unassigned' },
              ],
              placeholder: 'Search status',
            },
            meta: {
              label: 'Status',
            },
          },
          {
            accessorKey: 'tamper',
            header: ({ column }) => <DataTableHeader column={column} label="Tamper" />,
            cell: ({ row }) => (
              <div>
                {(row.original.metadata as SPEndpoint)?.tamperProtectionEnabled
                  ? 'Enabled'
                  : 'Disabled'}
              </div>
            ),
            filterFn: (row, colId, value) => {
              return (row.original.metadata as SPEndpoint).tamperProtectionEnabled === value.value;
            },
            sortingFn: (rowA, rowB) => {
              return (
                Number((rowB.original.metadata as SPEndpoint).tamperProtectionEnabled) -
                Number((rowA.original.metadata as SPEndpoint).tamperProtectionEnabled)
              );
            },
            filter: {
              type: 'boolean',
              placeholder: 'Search tamper',
            },
            meta: {
              label: 'Tamper',
            },
          },
        ] as DataTableColumnDef<Tables<'source_devices_view'>>[]
      }
    />
  );
}
