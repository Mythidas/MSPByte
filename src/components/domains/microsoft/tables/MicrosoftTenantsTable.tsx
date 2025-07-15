'use client';

import DataTable, { DataTableRef } from '@/components/common/table/DataTable';
import { Tables } from '@/db/schema';
import { column, dateColumn, textColumn } from '@/components/common/table/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import Link from 'next/link';
import { prettyText } from '@/lib/utils';
import { getSourceTenantsView } from '@/services/source/tenants';
import MicrosoftTenantDrawer from '@/components/domains/microsoft/drawers/MicrosoftTenantDrawer';
import { MicrosoftTenantMetadata } from '@/integrations/microsoft/types';
import Microsoft365MappingsDialog from '@/components/domains/microsoft/Microsoft365MappingsDialog';
import { useRef } from 'react';

type TData = Tables<'source_tenants_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function MicrosoftTenantsTable({
  sourceId,
  siteIds,
  siteLevel,
  parentLevel,
}: Props) {
  const ref = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const tenants = await getSourceTenantsView(sourceId, siteIds, {
      page: pageIndex,
      size: pageSize,
      ...props,
      filterMap: {
        mfa_enforcement: 'metadata->>mfa_enforcement',
      },
    });

    if (!tenants.ok) {
      return { rows: [], total: 0 };
    }

    return tenants.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      height="max-h-[50vh]"
      action={
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
                href={`/sites/${row.original.parent_id}/microsoft-365?tab=dashboard`}
                className="hover:text-primary"
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
            operations: ['lk'],
            simpleSearch: true,
          },
          parent_name: {
            label: 'Parent',
            type: 'text',
            placeholder: 'Search parent',
            operations: ['lk'],
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
