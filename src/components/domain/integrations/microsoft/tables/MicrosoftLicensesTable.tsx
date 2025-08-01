'use client';

import DataTable, { DataTableRef } from '@/components/shared/table/DataTable';
import { Tables } from '@/db/schema';
import { column, textColumn, numberColumn } from '@/components/shared/table/DataTableColumn';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import Link from 'next/link';
import { prettyText } from '@/lib/utils';
import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getRows } from '@/db/orm';
import { MicrosoftLicenseMetadata } from '@/types/source/licenses';

type TData = Tables<'source_licenses_view'>;
type Props = {
  sourceId: string;
  siteIds?: string[];
  siteLevel?: boolean;
  parentLevel?: boolean;
};

export default function MicrosoftLicensesTable({
  sourceId,
  siteIds,
  parentLevel,
  siteLevel,
}: Props) {
  const ref = useRef<DataTableRef>(null);

  const fetcher = async ({ pageIndex, pageSize, sorting, ...props }: DataTableFetcher) => {
    const licenses = await getRows('source_licenses_view', {
      filters: [
        ['source_id', 'eq', sourceId],
        ['site_id', 'in', siteIds],
      ],
      pagination: {
        page: pageIndex,
        size: pageSize,
        ...props,
        sorting: Object.entries(sorting).length > 0 ? sorting : { site_name: 'asc' },
      },
    });

    if (!licenses.ok) {
      return { rows: [], total: 0 };
    }

    return licenses.data;
  };

  const initialVisibility = {
    parent_name: !siteLevel && !parentLevel,
    site_name: !siteLevel,
  };

  const getUsagePercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'enabled':
        return 'default';
      case 'suspended':
      case 'disabled':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'secondary';
    }
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
              <Link
                href={`/sites/${row.original.site_slug}/${row.original.source_id}`}
                className="hover:text-primary font-medium"
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
                href={`/sites/${row.original.parent_slug}/${row.original.source_id}`}
                className="hover:text-primary"
                target="_blank"
              >
                {row.original.parent_name}
              </Link>
            ),
          }),
          column({
            key: 'status',
            label: 'Status',
            cell: ({ row }) => {
              const metadata = row.original.metadata as unknown as MicrosoftLicenseMetadata;
              const status = metadata?.capabilityStatus || row.original.status || '';
              return <Badge variant={getVariant(status)}>{prettyText(status)}</Badge>;
            },
          }),
          textColumn({
            key: 'name',
            label: 'License Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
          }),
          numberColumn({
            key: 'used_units',
            label: 'Used Units',
            cell: ({ row }) => {
              const metadata = row.original.metadata as unknown as MicrosoftLicenseMetadata;
              const usedUnits = metadata?.consumedUnits || row.original.used_units || 0;
              return <div className="text-right">{usedUnits.toLocaleString()}</div>;
            },
          }),
          numberColumn({
            key: 'units',
            label: 'Total Units',
            cell: ({ row }) => {
              const metadata = row.original.metadata as unknown as MicrosoftLicenseMetadata;
              const totalUnits = metadata?.prepaidUnits?.enabled || row.original.units || 0;
              return <div className="text-right">{totalUnits.toLocaleString()}</div>;
            },
          }),
          column({
            key: 'usage',
            label: 'Usage',
            cell: ({ row }) => {
              const metadata = row.original.metadata as unknown as MicrosoftLicenseMetadata;
              const totalUnits = metadata?.prepaidUnits?.enabled || row.original.units || 0;
              const usedUnits = metadata?.consumedUnits || row.original.used_units || 0;
              const percentage = getUsagePercentage(usedUnits, totalUnits);

              return (
                <div className="w-full max-w-[100px]">
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            },
          }),
          column({
            key: 'account_name',
            label: 'Account',
            enableHiding: true,
            cell: ({ row }) => {
              const metadata = row.original.metadata as unknown as MicrosoftLicenseMetadata;
              return <div className="text-sm">{metadata?.accountName || 'N/A'}</div>;
            },
          }),
        ] as DataTableColumnDef<TData>[]
      }
      filters={{
        License: {
          name: {
            label: 'License Name',
            type: 'text',
            placeholder: 'Search license name',
            operations: ['ilike'],
            simpleSearch: true,
          },
          sku: {
            label: 'SKU',
            type: 'text',
            placeholder: 'Search SKU',
            operations: ['ilike'],
          },
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
          status: {
            label: 'Status',
            type: 'select',
            placeholder: 'Select status',
            options: [
              { label: 'Enabled', value: 'Enabled' },
              { label: 'Suspended', value: 'Suspended' },
              { label: 'Disabled', value: 'Disabled' },
              { label: 'Warning', value: 'Warning' },
            ],
          },
        },
        Usage: {
          units: {
            label: 'Total Units',
            type: 'number',
            placeholder: 'Min units',
            operations: ['gte', 'lte'],
          },
          used_units: {
            label: 'Used Units',
            type: 'number',
            placeholder: 'Min used',
            operations: ['gte', 'lte'],
          },
        },
      }}
    />
  );
}
