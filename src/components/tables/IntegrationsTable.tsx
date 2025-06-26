'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/db/schema';
import { getSourceIntegrations } from '@/services/integrations';
import { getSources } from '@/services/sources';
import DataTable from '@/components/ux/table/DataTable';
import { DataTableColumnDef } from '@/types/data-table';
import { column, textColumn } from '@/components/ux/table/DataTableColumn';
import Link from 'next/link';

export default function IntegrationsTable() {
  const [integrations, setIntegrations] = useState<Tables<'source_integrations'>[]>([]);
  const [sources, setSources] = useState<Tables<'sources'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const loadData = async () => {
      const integrations = await getSourceIntegrations();
      const sources = await getSources();

      if (integrations.ok && sources.ok) {
        setIntegrations(integrations.data);
        setSources(sources.data);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  return (
    <DataTable
      data={sources}
      isLoading={isLoading}
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
                  <Link href={`/integrations/${row.original.slug}`} className="hover:text-primary">
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
            filter: {
              type: 'select',
              placeholder: 'Select Status',
              options: [
                { label: 'Enabled', value: 'enabled' },
                { label: 'Disabled', value: 'disabled' },
              ],
            },
            filterFn: (row, colId, value) => {
              const exists = integrations.find((i) => i.source_id === row.original.id);
              return value.value === 'enabled' ? !!exists : !exists;
            },
          }),
        ] as DataTableColumnDef<Tables<'sources'>>[]
      }
    />
  );
}
