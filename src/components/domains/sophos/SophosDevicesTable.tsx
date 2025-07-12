'use client';

import { pascalCase } from '@/lib/utils';
import { Tables } from '@/db/schema';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import DataTable, { FetcherProps } from '@/components/common/table/DataTable';
import { DataTableHeader } from '@/components/common/table/DataTableHeader';
import { getSourceDevicesViewPaginated } from '@/services/devices';
import { textColumn } from '@/components/common/table/DataTableColumn';
import { DataTableColumnDef } from '@/types/data-table';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosDevicesTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const fetcher = async ({ pageIndex, pageSize, ...props }: FetcherProps) => {
    const devices = await getSourceDevicesViewPaginated(
      {
        page: pageIndex,
        size: pageSize,
        filterMap: {
          protection: 'metadata->packages->protection->>name',
          status: 'metadata->packages->protection->>status',
          tamper: 'metadata->>tamperProtectionEnabled',
        },
        ...props,
      },
      sourceId,
      siteIds
    );
    if (!devices.ok) {
      return { rows: [], total: 0 };
    }

    return devices.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      initialVisibility={{ parent_name: !siteLevel && !parentLevel, site_name: !siteLevel }}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'parent_name',
            label: 'Parent',
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
              options: [
                { label: 'MDR', value: 'MDR' },
                { label: 'XDR', value: 'XDR' },
                { label: 'Endpoint', value: 'Endpoint' },
              ],
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
