'use client';

import { Tables } from '@/types/db';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { column, dateColumn, textColumn } from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import { useRef } from 'react';
import { getRows } from '@/db/orm';
import { SPFirewallLicense } from '@/integrations/sophos/types/license';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosLicensesTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const tableRef = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const devices = await getRows('source', 'licenses_view', {
      filters: [['source_id', 'eq', sourceId], siteIds ? ['site_id', 'in', siteIds] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        filterMap: {
          serialNumber: 'metadata->>serialNumber',
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
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
          }),
          textColumn({
            key: 'sku',
            label: 'SKU',
            enableHiding: false,
            simpleSearch: true,
          }),
          column({
            key: 'serialNumber',
            label: 'Serial',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => (
              <div>{(row.original.metadata as SPFirewallLicense).serialNumber}</div>
            ),
          }),
          dateColumn({
            key: 'start_at',
            label: 'Start',
            cell: ({ row }) => (
              <div>{new Date(row.original.start_at || '').toLocaleDateString()}</div>
            ),
          }),
          dateColumn({
            key: 'end_at',
            label: 'End',
            cell: ({ row }) => (
              <div>{new Date(row.original.end_at || '').toLocaleDateString()}</div>
            ),
          }),
        ] as DataTableColumnDef<Tables<'source', 'licenses_view'>>[]
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
      }}
    />
  );
}
