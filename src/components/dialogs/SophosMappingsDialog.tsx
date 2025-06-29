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
import SearchBox from '@/components/ux/SearchBox';
import { SubmitButton } from '@/components/ux/SubmitButton';
import DataTable from '@/components/ux/table/DataTable';
import { column, textColumn } from '@/components/ux/table/DataTableColumn';
import { Tables } from '@/db/schema';
import { getTenants } from '@/integrations/sophos/services/tenants';
import {
  getSiteMappings,
  putSiteSourceMapping,
  deleteSiteSourceMapping,
} from '@/services/siteSourceMappings';
import { DataTableColumnDef } from '@/types/data-table';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function SophosMappingsDialog(props: Props) {
  const [mappings, setMappings] = useState<
    (Tables<'site_mappings_view'> & { changed?: boolean })[]
  >([]);
  const [external, setExternal] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenants = await getTenants(props.integration);
        const siteMappings = await getSiteMappings(props.source.id);

        if (!tenants.ok || !siteMappings.ok) {
          throw new Error('Failed to fetch data');
        }

        setMappings(siteMappings.data);
        setExternal(tenants.data);
      } catch (error) {
        toast.error(`Failed to load mappings: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [props.integration, props.source.id]);

  const handleSave = async () => {
    setIsSubmitting(true);

    for await (const mapping of mappings) {
      if (mapping.changed) {
        if (mapping.external_id) {
          await putSiteSourceMapping([
            {
              tenant_id: props.integration.tenant_id,
              site_id: mapping.site_id!,
              source_id: props.source.id,
              external_id: mapping.external_id!,
              external_name: mapping.external_name!,
              metadata: mapping.metadata,
            },
          ]);
        } else if (mapping.id) {
          await deleteSiteSourceMapping(mapping.id);
        }
      }
    }

    setIsSubmitting(false);
    setMappings(
      [...mappings].map((m) => {
        return { ...m, changed: false };
      })
    );
    toast.info('Site Mappings Saved!', { position: 'top-center' });
  };

  const handleAutoMatch = () => {
    const newMappings = [...mappings];
    for (const mapping of newMappings) {
      if (mapping.external_id) continue;

      const match = external.find((ex) => isSimilarStr(ex.name, mapping.site_name!));
      if (match) {
        mapping.external_id = match.id!;
        mapping.external_name = match.name;
        mapping.changed = true;
        mapping.metadata = match;
      }
    }

    setMappings(newMappings);
  };

  const handleClearAll = () => {
    setMappings(
      [...mappings].map((m) => {
        return { ...m, external_name: '', external_id: '', changed: true };
      })
    );
  };

  function cleanName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, ' ') // Collapse spaces
      .trim();
  }

  const isSimilarStr = (first: string, second: string) => {
    return cleanName(first) === cleanName(second);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">Edit Mappings</Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!max-w-[100vw] w-[80vw] h-fit py-2">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Mappings</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <DataTable
          data={mappings}
          isLoading={isLoading}
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button onClick={handleAutoMatch}>Auto-Match</Button>
            </div>
          }
          columns={
            [
              textColumn({
                key: 'site_name',
                label: 'Site',
                enableHiding: false,
                simpleSearch: true,
              }),
              textColumn({
                key: 'parent_name',
                label: 'Parent',
                enableHiding: false,
                simpleSearch: true,
              }),
              column({
                key: 'external_id',
                label: 'Sophos Site',
                enableHiding: false,
                simpleSearch: true,
                cell: ({ row, table }) => {
                  return (
                    <SearchBox
                      placeholder="Search sites"
                      options={external.map((e) => {
                        return { label: e.name, value: e.id };
                      })}
                      defaultValue={row.original.external_id || ''}
                      portal
                      delay={0}
                      onSelect={(e) => {
                        const site = external.find((site) => site.id === e);
                        if (!site) return;

                        const index =
                          row.index +
                          table.getState().pagination.pageIndex *
                            table.getState().pagination.pageSize;
                        const newMappings = [...mappings];
                        newMappings[index].external_id = site.id;
                        newMappings[index].external_name = site.name;
                        newMappings[index].changed = true;
                        newMappings[index].metadata = site;
                        setMappings(newMappings);
                      }}
                      loading={isLoading}
                    />
                  );
                },
              }),
            ] as DataTableColumnDef<Tables<'site_mappings_view'>>[]
          }
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton onClick={handleSave} pending={isSubmitting}>
            Save Changes
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
