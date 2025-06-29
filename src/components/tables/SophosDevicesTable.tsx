'use client';

import { pascalCase } from '@/lib/utils';
import Link from 'next/link';
import { Tables } from '@/db/schema';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import DataTable from '@/components/ux/table/DataTable';
import { DataTableHeader } from '@/components/ux/table/DataTableHeader';
import { useEffect, useState } from 'react';
import { getSourceDevicesView } from '@/services/devices';
import { toast } from 'sonner';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
};

export default function SophosDevicesTable({ sourceId, siteIds, siteLevel }: Props) {
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
      initialVisibility={siteLevel ? { parent_name: false, site_name: false } : {}}
      columns={[
        {
          accessorKey: 'site_name',
          header: ({ column }) => <DataTableHeader column={column} label="Site" />,
          cell: ({ row }) => (
            <Link
              href={`/sites/${row.original.site_id}/sophos-partner?tab=devices`}
              className="hover:text-primary"
            >
              {row.original.site_name}
            </Link>
          ),
          enableHiding: true,
          simpleSearch: true,
          filter: {
            type: 'text',
            placeholder: 'Search site',
          },
          meta: {
            label: 'Site',
          },
        },
        {
          accessorKey: 'parent_name',
          header: ({ column }) => <DataTableHeader column={column} label="Parent" />,
          cell: ({ row }) => (
            <Link
              href={`/sites/${row.original.parent_id}/sophos-partner?tab=devices`}
              className="hover:text-primary"
            >
              {row.original.parent_name}
            </Link>
          ),
          enableHiding: true,
          simpleSearch: true,
          filter: {
            type: 'text',
            placeholder: 'Search parent',
          },
          meta: {
            label: 'Parent',
          },
        },
        {
          accessorKey: 'hostname',
          header: ({ column }) => <DataTableHeader column={column} label="Hostname" />,
          enableHiding: false,
          simpleSearch: true,
          filter: {
            type: 'text',
            placeholder: 'Search hostname',
          },
          meta: {
            label: 'Hostname',
          },
        },
        {
          accessorKey: 'os',
          header: ({ column }) => <DataTableHeader column={column} label="OS" />,
          filter: {
            type: 'text',
            placeholder: 'Search os',
          },
          meta: {
            label: 'OS',
          },
        },
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
            return (rowA.original.metadata as SPEndpoint).packages.protection!.status.localeCompare(
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
      ]}
    />
  );
}
