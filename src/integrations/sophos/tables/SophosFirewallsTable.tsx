'use client';

import { Tables } from '@/types/db';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { column, dateColumn, textColumn } from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import { useRef } from 'react';
import { getRows } from '@/db/orm';
import { SPFirewall } from '@/integrations/sophos/types/firewall';
import { CircleArrowUp } from 'lucide-react';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosFirewallsTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const tableRef = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const devices = await getRows('source', 'devices_view', {
      filters: [
        ['source_id', 'eq', sourceId],
        ['type', 'eq', 'firewall'],
        siteIds ? ['site_id', 'in', siteIds] : undefined,
      ],
      pagination: {
        page: pageIndex,
        size: pageSize,
        filterMap: {
          newestFirmware: 'metadata->firmware->>newestFirmware',
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
      initialSorting={[{ id: 'site_name', desc: false }]}
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
            cell: ({ row }) => row.original.hostname,
          }),
          textColumn({
            key: 'os',
            label: 'Firmware',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'serial',
            label: 'Serial',
            enableHiding: false,
            simpleSearch: true,
          }),
          column({
            key: 'newestFirmware',
            label: 'Upgradable',
            cell: ({ row }) => {
              const newest = (row.original.metadata as SPFirewall).firmware?.newestFirmware;

              if (newest) {
                return (
                  <div className="flex gap-2 items-center">
                    {newest} <CircleArrowUp className="w-4 h-4 text-amber-500" />
                  </div>
                );
              }
            },
          }),
          textColumn({
            key: 'status',
            label: 'Status',
          }),
          dateColumn({
            key: 'last_seen_at',
            label: 'State Changed',
          }),
          textColumn({
            key: 'external_ip',
            label: 'IP',
            simpleSearch: true,
          }),
        ] as DataTableColumnDef<Tables<'source', 'devices_view'>>[]
      }
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
            label: 'Firmware',
            type: 'text',
            placeholder: 'Search Firmware',
            simpleSearch: true,
          },
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            options: [
              { label: 'Online', value: 'online' },
              { label: 'Offline', value: 'offline' },
            ],
          },
        },
      }}
    />
  );
}
