'use client';

import { Tables } from '@/types/db';
import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { numberColumn, textColumn } from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import { useRef } from 'react';
import { getRows } from '@/db/orm';

type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function SophosTenantsTable({ sourceId, siteIds, siteLevel, parentLevel }: Props) {
  const tableRef = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const devices = await getRows('source', 'tenants_view', {
      filters: [['source_id', 'eq', sourceId], siteIds ? ['site_id', 'in', siteIds] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
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
      initialSorting={[{ id: 'site_name', desc: false }]}
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
          numberColumn({
            key: 'health_score',
            label: 'Score',
            cell: ({ row }) => (
              <span>
                {row.original.health_score === 0 ? 'Unknown' : `${row.original.health_score}%`}
              </span>
            ),
          }),
        ] as DataTableColumnDef<Tables<'source', 'tenants_view'>>[]
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
