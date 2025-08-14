'use client';

import DataTable, { DataTableRef } from '@/features/data-table/components/DataTable';
import { Tables } from '@/types/db';
import { column, dateColumn, textColumn } from '@/features/data-table/components/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/features/data-table/types/table';
import Link from 'next/link';
import { prettyText } from '@/shared/lib/utils';
import { useRef } from 'react';
import MicrosoftTenantDrawer from '@/integrations/microsoft/components/drawers/MicrosoftTenantDrawer';
import { getRows } from '@/db/orm';
import Microsoft365MappingsDialog from '@/integrations/microsoft/components/Microsoft365MappingsDialog';
import { MicrosoftTenantMetadata } from '@/integrations/microsoft/types';

type TData = Tables<'source', 'tenants_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function MicrosoftTenantsTable({ sourceId, siteIds, siteLevel }: Props) {
  const ref = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const tenants = await getRows('source', 'tenants_view', {
      filters: [['source_id', 'eq', sourceId], siteIds ? ['site_id', 'in', siteIds] : undefined],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
        sorting: Object.entries(props.sorting).length > 0 ? props.sorting : { site_name: 'asc' },
        filterMap: {
          mfa_enforcement: 'metadata->>mfa_enforcement',
        },
      },
    });
    if (tenants.error) {
      return { rows: [], total: 0 };
    }

    return tenants.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      lead={() =>
        !siteLevel && (
          <Microsoft365MappingsDialog
            sourceId={sourceId}
            onSave={() => ref.current?.refetch()}
            parentId={siteIds && siteIds[0]}
          />
        )
      }
      ref={ref}
      columns={
        [
          textColumn({
            key: 'site_name',
            label: 'Site',
            enableHiding: true,
            simpleSearch: true,
            cell: ({ row }) => (
              <MicrosoftTenantDrawer
                tenant={row.original}
                label={row.original.site_name || ''}
                onDelete={() => ref.current?.refetch()}
              />
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
          column({
            key: 'external_name',
            label: 'Domains',
            enableHiding: false,
            cell: ({ row }) => (
              <div>{(row.original.metadata as MicrosoftTenantMetadata).domains?.length || 0}</div>
            ),
          }),
          column({
            key: 'mfa_enforcement',
            label: 'MFA Enforcement',
            cell: ({ row }) => (
              <div>
                {prettyText((row.original.metadata as MicrosoftTenantMetadata).mfa_enforcement)}
              </div>
            ),
          }),
          dateColumn({
            key: 'last_sync',
            label: 'Last Sync',
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
        Security: {
          mfa_enforcement: {
            label: 'MFA Enforcement',
            type: 'select',
            placeholder: 'Select enforcement',
            options: [
              { label: 'Conditional Access', value: 'conditional_access' },
              { label: 'Security Defaults', value: 'security_defaults' },
              { label: 'None', value: 'none' },
            ],
          },
        },
      }}
    />
  );
}
