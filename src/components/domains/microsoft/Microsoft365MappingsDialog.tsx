import Microsoft365InfoPopover from '@/components/domains/microsoft/Microsoft365InfoPopover';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/common/table/DataTable';
import { textColumn } from '@/components/common/table/DataTableColumn';
import { DataTableHeader } from '@/components/common/table/DataTableHeader';
import { Tables } from '@/db/schema';
import { useAsync } from '@/hooks/common/useAsync';
import { getSitesView } from '@/services/sites';
import { getSourceTenants } from '@/services/source/tenants';
import { DataTableColumnDef } from '@/types/data-table';
import { useState } from 'react';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function Microsoft365MappingsDialog({ source }: Props) {
  const [mappings, setMappings] = useState<(Tables<'source_tenants'> & { changed?: boolean })[]>(
    []
  );
  const [sites, setSites] = useState<Tables<'sites_view'>[]>([]);

  const { isLoading } = useAsync({
    initial: undefined,
    fetcher: async () => {
      const siteMappings = await getSourceTenants(source.id);
      const sites = await getSitesView();

      if (!siteMappings.ok || !sites.ok) {
        throw new Error('Failed to fetch data');
      }

      setMappings(siteMappings.data.rows);
      setSites(sites.data.rows.sort((a, b) => a.name!.localeCompare(b.name!)));
    },
    deps: [source],
  });

  const handleSave = (mapping: Tables<'source_tenants'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push(mapping);
    setMappings(newMappings);
  };

  const handleClear = (mapping: Tables<'source_tenants'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push({
      ...mapping,
      id: '',
      metadata: {},
      external_id: '',
      external_name: '',
    });
    setMappings(newMappings);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Edit Mappings</Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!max-w-[100vw] w-[80vw] h-fit">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Mappings</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Table of Microsoft 365 site mappings with Graph API info
        </AlertDialogDescription>
        <DataTable
          data={sites}
          isLoading={isLoading}
          columns={
            [
              textColumn({
                key: 'name',
                label: 'Name',
                enableHiding: false,
                simpleSearch: true,
              }),
              textColumn({
                key: 'parent_name',
                label: 'Parent',
                enableHiding: false,
                simpleSearch: true,
              }),
              {
                accessorKey: 'MicrosoftInfo',
                header: ({ column }) => <DataTableHeader column={column} label="Microsoft Info" />,
                headerClass: 'text-right',
                cell: ({ row }) => (
                  <Microsoft365InfoPopover
                    site={row.original}
                    mapping={mappings.find((m) => m.site_id === row.original.id)}
                    onSave={handleSave}
                    onClear={handleClear}
                  />
                ),
                cellClass: 'text-right',
                enableHiding: false,
                sortingFn: (rowA, rowB) => {
                  const mappingA = mappings.find((m) => m.site_id === rowA.original.id);
                  const mappingB = mappings.find((m) => m.site_id === rowB.original.id);
                  const a = mappingA ? 1 : 0;
                  const b = mappingB ? 1 : 0;

                  return b - a;
                },
              },
            ] as DataTableColumnDef<Tables<'sites_view'>>[]
          }
          filters={{
            Tenant: {
              name: {
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
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
