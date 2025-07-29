'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/db/schema';
import { getSourceIntegrations } from '@/services/integrations';
import { getSources } from '@/services/sources';
import DataTable from '@/components/shared/table/DataTable';
import { DataTableColumnDef, DataTableFetcher } from '@/types/data-table';
import { column, textColumn } from '@/components/shared/table/DataTableColumn';
import Link from 'next/link';

export default function IntegrationsTable() {
  const [integrations, setIntegrations] = useState<Tables<'source_integrations'>[]>([]);

  const fetcher = async ({ pageIndex, pageSize, ...props }: DataTableFetcher) => {
    const sources = await getSources({
      page: pageIndex,
      size: pageSize,
      filterMap: {
        protection: 'metadata->packages->protection->>name',
        status: 'metadata->packages->protection->>status',
        tamper: 'metadata->>tamperProtectionEnabled',
      },
      ...props,
    });
    const integrations = await getSourceIntegrations();
    if (integrations.ok) {
      setIntegrations(integrations.data.rows);
    }

    if (!sources.ok) {
      return { rows: [], total: 0 };
    }

    return sources.data;
  };

  return (
    <DataTable
      fetcher={fetcher}
      columns={
        [
          textColumn({
            key: 'name',
            label: 'Name',
            enableHiding: false,
            simpleSearch: true,
            cell: ({ row }) => {
              return (
                <div className="flex items-center gap-2">
                  <Image
                    src={row.original.icon_url || ''}
                    alt={row.original.name}
                    width={30}
                    height={30}
                  />
                  <Link href={`/integrations/${row.original.id}`} className="hover:text-primary">
                    {row.original.name}
                  </Link>
                </div>
              );
            },
          }),
          textColumn({
            key: 'description',
            label: 'Description',
            enableHiding: false,
            simpleSearch: true,
          }),
          column({
            key: 'is_active',
            label: 'Status',
            enableHiding: false,
            cell: ({ row }) => {
              const exists = integrations.find((i) => i.source_id === row.original.id);
              return (
                <Badge variant={exists ? 'default' : 'secondary'}>
                  {exists ? 'Enabled' : 'Disabled'}
                </Badge>
              );
            },
          }),
        ] as DataTableColumnDef<Tables<'sources'>>[]
      }
      filters={{
        Integration: {
          name: {
            label: 'Name',
            type: 'text',
            placeholder: 'Search name',
          },
          description: {
            label: 'Description',
            type: 'text',
            placeholder: 'Search description',
          },
        },
      }}
    />
  );
}
