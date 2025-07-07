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
import SearchBox from '@/components/common/SearchBox';
import { SubmitButton } from '@/components/common/SubmitButton';
import DataTable from '@/components/common/table/DataTable';
import { column, textColumn } from '@/components/common/table/DataTableColumn';
import { Tables } from '@/db/schema';
import { useAsync } from '@/hooks/useAsync';
import { getTenants } from '@/integrations/sophos/services/tenants';
import {
  getSourceTenants,
  putSourceTenant,
  deleteSourceTenant,
} from '@/services/source/tenants/tenants';
import { DataTableColumnDef } from '@/types/data-table';
import { useState } from 'react';
import { toast } from 'sonner';
import { getSitesView } from '@/services/sites';

// Util
function cleanName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSimilarStr(first: string, second: string) {
  return cleanName(first) === cleanName(second);
}

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function SophosMappingsDialog({ source, integration }: Props) {
  const [mappings, setMappings] = useState<
    Record<string, Tables<'source_tenants'> & { changed?: boolean }>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: { external, sites },
    isLoading,
  } = useAsync({
    initial: { external: [], sites: [] },
    fetcher: async () => {
      const tenants = await getTenants(integration);
      const siteMappings = await getSourceTenants(source.id);
      const sites = await getSitesView();

      if (!tenants.ok || !siteMappings.ok || !sites.ok) {
        throw new Error('Failed to fetch data');
      }

      const mapBySite: Record<string, Tables<'source_tenants'>> = {};
      for (const mapping of siteMappings.data) {
        mapBySite[mapping.site_id] = mapping;
      }

      setMappings(mapBySite);

      return { external: tenants.data, sites: sites.data };
    },
    deps: [integration, source.id],
  });

  const handleSave = async () => {
    setIsSubmitting(true);

    for (const site of sites) {
      const mapping = mappings[site.id!];
      if (!mapping?.changed) continue;

      if (mapping.external_id) {
        await putSourceTenant([
          {
            tenant_id: integration.tenant_id,
            site_id: site.id!,
            source_id: source.id,
            external_id: mapping.external_id,
            external_name: mapping.external_name,
            metadata: mapping.metadata,
          },
        ]);
      } else if (mapping.id) {
        await deleteSourceTenant(mapping.id);
      }
    }

    setIsSubmitting(false);
    setMappings((prev) => {
      const next = { ...prev };
      for (const key in next) {
        next[key] = { ...next[key], changed: false };
      }
      return next;
    });
    toast.info('Site Mappings Saved!', { position: 'top-center' });
  };

  const handleAutoMatch = () => {
    const updated = { ...mappings };
    for (const site of sites) {
      const match = external.find((ex) => isSimilarStr(ex.name, site.name ?? ''));
      if (!match) continue;
      updated[site.id!] = {
        ...updated[site.id!],
        site_id: site.id!,
        source_id: source.id,
        tenant_id: integration.tenant_id,
        external_id: match.id,
        external_name: match.name,
        metadata: match,
        changed: true,
      };
    }
    setMappings(updated);
  };

  const handleClearAll = () => {
    const updated = { ...mappings };
    for (const site of sites) {
      if (updated[site.id!]) {
        updated[site.id!] = {
          ...updated[site.id!],
          external_id: '',
          external_name: '',
          changed: true,
        };
      }
    }
    setMappings(updated);
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
          data={sites}
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
                key: 'name',
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
                key: 'tenant_id',
                label: 'Sophos Site',
                enableHiding: false,
                simpleSearch: true,
                cell: ({ row }) => {
                  const mapping = mappings[row.original.id!];

                  return (
                    <SearchBox
                      placeholder="Search sites"
                      options={external.map((e) => ({ label: e.name, value: e.id }))}
                      defaultValue={mapping?.external_name || ''}
                      onSelect={(val) => {
                        const site = external.find((site) => site.id === val);
                        console.log(site);
                        if (!site) return;
                        setMappings((prev) => ({
                          ...prev,
                          [row.original.id!]: {
                            ...prev[row.original.id!],
                            site_id: row.original.id!,
                            source_id: source.id,
                            tenant_id: integration.tenant_id,
                            external_id: site.id,
                            external_name: site.name,
                            metadata: site,
                            changed: true,
                          },
                        }));
                      }}
                      loading={isLoading}
                    />
                  );
                },
              }),
            ] as DataTableColumnDef<Tables<'sites_view'>>[]
          }
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton
            onClick={handleSave}
            pending={isSubmitting}
            disabled={Object.entries(mappings).filter((val) => val[1].changed).length === 0}
          >
            Save Changes {Object.entries(mappings).filter((val) => val[1].changed).length || ''}
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
