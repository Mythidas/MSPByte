import Microsoft365InfoPopover from '@/components/popovers/Microsoft365InfoPopover';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import DataTable, { DataTableHeader } from '@/components/ux/DataTable';
import { Tables } from '@/db/schema';
import { getSitesView } from '@/services/sites';
import { getSiteMappings } from '@/services/siteSourceMappings';
import { DataTableColumnDef } from '@/types/data-table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function Microsoft365MappingsDialog({ source }: Props) {
  const [mappings, setMappings] = useState<
    (Tables<'site_mappings_view'> & { changed?: boolean })[]
  >([]);

  useEffect(() => {
    async function loadData() {
      try {
        const siteMappings = await getSiteMappings(source.id);
        const sites = await getSitesView();

        if (!siteMappings.ok || !sites.ok) {
          throw new Error('Failed to fetch data');
        }

        for (const site of sites.data) {
          const exists = siteMappings.data.find((m) => m.site_id === site.id);
          if (!exists) {
            siteMappings.data.push({
              id: null,
              site_id: site.id,
              source_id: source.id,
              tenant_id: site.tenant_id,
              is_parent: site.is_parent,
              parent_id: site.parent_id,
              parent_name: site.parent_name,
              source_name: source.name,
              source_slug: source.slug,
              metadata: {},
              external_id: '',
              external_name: '',
              site_name: site.name,
            });
          }
        }

        setMappings(siteMappings.data.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
      } catch (error) {
        toast.error(`Failed to load mappings: ${error}`);
      }
    }

    loadData();
  }, [source.id, source.name, source.slug]);

  const handleSave = (mapping: Tables<'site_mappings_view'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push(mapping);
    setMappings(newMappings.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
  };

  const handleClear = (mapping: Tables<'site_mappings_view'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push({
      ...mapping,
      metadata: {},
      external_id: '',
      external_name: '',
    });
    setMappings(newMappings.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Edit Mappings</Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!max-w-[100vw] w-[80vw] h-fit py-2">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Mappings</AlertDialogTitle>
        </AlertDialogHeader>
        <DataTable
          columns={
            [
              {
                accessorKey: 'site_name',
                header: ({ column }) => <DataTableHeader column={column} label="Site" />,
                enableHiding: false,
                simpleSearch: true,
              },
              {
                accessorKey: 'parent_name',
                header: ({ column }) => <DataTableHeader column={column} label="Parent" />,
                enableHiding: false,
                simpleSearch: true,
              },
              {
                accessorKey: 'MicrosoftInfo',
                header: ({ column }) => <DataTableHeader column={column} label="Microsoft Info" />,
                headerClass: 'text-right',
                cell: ({ row }) => (
                  <Microsoft365InfoPopover
                    mapping={row.original}
                    onSave={handleSave}
                    onClear={handleClear}
                  />
                ),
                cellClass: 'text-right',
                enableHiding: false,
                sortingFn: (rowA, rowB) => {
                  const a = rowA.original.external_id ? 1 : 0;
                  const b = rowB.original.external_id ? 1 : 0;

                  return b - a;
                },
              },
            ] as DataTableColumnDef<Tables<'site_mappings_view'>>[]
          }
          data={mappings}
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
