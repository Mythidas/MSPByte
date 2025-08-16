'use client';

import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { Tables } from '@/types/db';
import {
  column,
  dateColumn,
  numberColumn,
  textColumn,
} from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import { prettyText } from '@/shared/lib/utils';
import { useRef } from 'react';
import MicrosoftPolicyDrawer from '@/integrations/microsoft/components/drawers/MicrosoftPolicyDrawer';
import Link from 'next/link';
import { getRows } from '@/db/orm';
import { MicrosoftPolicyMetadata } from '@/integrations/microsoft/types';

type TData = Tables<'source', 'policies_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function MicrosoftPoliciesTable({
  sourceId,
  siteIds,
  parentLevel,
  siteLevel,
}: Props) {
  const ref = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const policies = await getRows('source', 'policies_view', {
      filters: [['source_id', 'eq', sourceId], siteIds ? ['site_id', 'in', siteIds] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
        sorting: Object.entries(props.sorting).length > 0 ? props.sorting : { site_name: 'asc' },
        filterMap: {
          external_created_at: 'metadata->createdDateTime',
        },
      },
    });
    if (policies.error) {
      return { rows: [], total: 0 };
    }

    return policies.data;
  };

  const initialVisibility = {
    parent_name: !siteLevel && !parentLevel,
    site_name: !siteLevel,
  };

  return (
    <DataTable
      fetcher={fetcher}
      ref={ref}
      initialVisibility={initialVisibility}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <MicrosoftPolicyDrawer policy={row.original} label={row.original.site_name || ''} />
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
            cell: ({ row }) => (
              <MicrosoftPolicyDrawer label={row.original.name!} policy={row.original} />
            ),
          }),
          textColumn({
            key: 'status',
            label: 'Status',
            cell: ({ row }) => prettyText(row.original.status!),
          }),
          numberColumn({
            key: 'exclusions',
            label: 'Exclusions',
          }),
          column({
            key: 'external_created_at',
            label: 'Created',
            cell: ({ row }) => (
              <div>
                {new Date(
                  (row.original.metadata as unknown as MicrosoftPolicyMetadata).createdDateTime
                ).toLocaleString()}
              </div>
            ),
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
        Policy: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
            operations: ['ilike'],
            simpleSearch: true,
          },
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            operations: ['eq'],
            options: [
              { label: 'Enabled', value: 'enabled' },
              { label: 'Disabled', value: 'disabled' },
              { label: 'Report Only', value: 'report_only' },
            ],
          },
        },
      }}
    />
  );
}
