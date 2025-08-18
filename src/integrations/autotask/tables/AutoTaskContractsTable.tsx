'use client';

import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { Tables } from '@/types/db';
import {
  dateColumn,
  numberColumn,
  textColumn,
} from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import { prettyText } from '@/shared/lib/utils';
import { useRef } from 'react';
import { getRows } from '@/db/orm';
import AutoTaskContractDrawer from '@/integrations/autotask/drawers/AutoTaskContractDrawer';
import { useAsync } from '@/shared/hooks/useAsync';

type TData = Tables<'source', 'contracts_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function AutoTaskContractsTable({ sourceId, siteIds }: Props) {
  const ref = useRef<DataTableRef>(null);

  const { data: services } = useAsync({
    initial: [],
    fetcher: async () => {
      const services = await getRows('source', 'services', {
        filters: [['source_id', 'eq', sourceId]],
        sorting: [['name', 'asc']],
      });
      if (!services.error) return services.data.rows;

      return [];
    },
    deps: [],
  });

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const contracts = await getRows('source', 'contracts_view', {
      filters: [['source_id', 'eq', sourceId], siteIds ? ['site_id', 'in', siteIds] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
        sorting: Object.entries(props.sorting).length > 0 ? props.sorting : { site_name: 'asc' },
      },
    });
    if (contracts.error) {
      return { rows: [], total: 0 };
    }

    return contracts.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={ref}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/sites/${row.original.site_slug}/${row.original.source_id}?tab=dashboard`}
                className="hover:text-primary"
                target="_blank"
              >
                {row.original.site_name}
              </Link>
            ),
          }),
          textColumn({
            key: 'parent_name',
            label: 'Parent',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <Link
                href={`/sites/${row.original.parent_slug}/${row.original.source_id}?tab=dashboard`}
                className="hover:text-primary"
                target="_blank"
              >
                {row.original.parent_name}
              </Link>
            ),
          }),
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => <AutoTaskContractDrawer contract={row.original} />,
          }),
          textColumn({
            key: 'status',
            label: 'Status',
            cell: ({ row }) => prettyText(row.original.status || ''),
          }),
          textColumn({
            key: 'revenue',
            label: 'Est. Revenue',
            cell: ({ row }) =>
              new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(row.original.revenue ?? 0),
          }),
          numberColumn({
            key: 'contract_item_count',
            label: 'Services',
          }),
          dateColumn({
            key: 'end_at',
            label: 'End',
            cell: ({ row }) =>
              row.original.end_at ? new Date(row.original.end_at).toLocaleDateString() : 'Unknown',
          }),
        ] as DataTableColumnDef<TData>[]
      }
      filters={{
        Tenant: {
          site_name: {
            label: 'Site',
            type: 'text',
            placeholder: 'Search site',
            operations: ['ilike'],
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            operations: ['ilike'],
            simpleSearch: true,
          },
        },
        Contract: {
          external_service_ids: {
            label: 'Service',
            type: 'multiselect',
            placeholder: 'Select service',
            operations: ['ov'],
            options: services.map((s) => ({ label: s.name, value: s.external_id })),
          },
        },
      }}
    />
  );
}
