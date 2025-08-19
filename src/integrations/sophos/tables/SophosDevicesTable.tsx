'use client';

import { pascalCase } from '@/shared/lib/utils';
import { Tables } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { DataTableHeader } from '@/features/data-table/components/DataTableHeader';
import { textColumn } from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import enableSophosTamperProtection from '@/integrations/sophos/services/actions/enableSophosTamperProtection';
import { useUser } from '@/shared/lib/providers/UserContext';
import { useRef } from 'react';
import { getRows } from '@/db/orm';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosDevicesTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const { user } = useUser();
  const tableRef = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const devices = await getRows('source', 'devices_view', {
      filters: [
        ['source_id', 'eq', sourceId],
        ['type', 'eq', 'computer'],
        siteIds ? ['site_id', 'in', siteIds] : undefined,
      ],
      pagination: {
        page: pageIndex,
        size: pageSize,
        filterMap: {
          protection: 'metadata->packages->protection->>name',
          status: 'metadata->packages->protection->>status',
          tamper: 'metadata->>tamperProtectionEnabled',
        },
        ...props,
      },
    });
    if (devices.error) {
      return { rows: [], total: 0 };
    }

    return devices.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      initialVisibility={{ parent_name: !siteLevel && !parentLevel, site_name: !siteLevel }}
      ref={tableRef}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => {
              return (
                <Link
                  href={`/sites/${row.original.site_slug}/${sourceId}`}
                  className="hover:text-primary"
                  target="_blank"
                >
                  {row.original.site_name}
                </Link>
              );
            },
          }),
          textColumn({
            key: 'parent_name',
            label: 'Parent',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => {
              return (
                <Link
                  href={`/sites/${row.original.parent_slug}/${sourceId}`}
                  className="hover:text-primary"
                  target="_blank"
                >
                  {row.original.parent_name}
                </Link>
              );
            },
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
          },
        ] as DataTableColumnDef<Tables<'source', 'devices_view'>>[]
      }
      actions={[
        {
          label: 'Enable Tamper Protection',
          action: async (data) => {
            enableSophosTamperProtection(data, user?.id || undefined);
          },
        },
      ]}
      filters={{
        Tenant: {
          site_name: {
            label: 'Site',
            type: 'text',
            placeholder: 'Search site',
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            simpleSearch: true,
          },
        },
        Device: {
          hostname: {
            label: 'Site',
            type: 'text',
            placeholder: 'Search hostname',
            simpleSearch: true,
          },
          os: {
            label: 'OS',
            type: 'text',
            placeholder: 'Search OS',
            simpleSearch: true,
          },
        },
        Security: {
          protection: {
            label: 'Protection',
            type: 'select',
            placeholder: 'Select protection',
            options: [
              { label: 'MDR', value: 'MDR' },
              { label: 'XDR', value: 'XDR' },
              { label: 'Endpoint', value: 'Endpoint' },
            ],
          },
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            options: [
              { label: 'Assigned', value: 'assigned' },
              { label: 'Upgradable', value: 'upgradable' },
              { label: 'Unassigned', value: 'unassigned' },
            ],
          },
          tamper: {
            label: 'Tamper Protection',
            type: 'boolean',
          },
        },
      }}
    />
  );
}
