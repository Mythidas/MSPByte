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
import { TableCell, TableHead, TableRow } from '@/components/ui/table';
import SearchBox from '@/components/ux/SearchBox';
import SkeletonTable from '@/components/ux/SkeletonTable';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { Tables } from '@/db/schema';
import { getTenants } from '@/lib/actions/server/sources/sophos/tenants';
import {
  getSiteMappings,
  putSiteSourceMapping,
  deleteSiteSourceMapping,
} from '@/services/siteSourceMappings';
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
  const [external, setExternal] = useState<any[]>([]);
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
  }, []);

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
          <div className="flex w-full justify-between">
            <span>Incomplete: {mappings.filter((m) => !m.external_id).length}</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClearAll}>
                Clear All
              </Button>
              <Button onClick={handleAutoMatch}>Auto-Match</Button>
            </div>
          </div>
        </AlertDialogHeader>
        {isLoading ? (
          <SkeletonTable />
        ) : null
        // <PaginatedTable
        //   data={mappings}
        //   head={() => (
        //     <TableRow>
        //       <TableHead>Site</TableHead>
        //       <TableHead>Parent</TableHead>
        //       <TableHead className="w-2/5">Sophos Site</TableHead>
        //     </TableRow>
        //   )}
        //   body={(data, page, size) => {
        //     return data.map((mapping, idx) => (
        //       <TableRow key={idx}>
        //         <TableCell>{mapping.site_name}</TableCell>
        //         <TableCell>{mapping.parent_name}</TableCell>
        //         <TableCell className="w-2/5">
        //           <SearchBox
        //             placeholder="Search sites"
        //             options={external.map((e) => {
        //               return { label: e.name, value: e.id };
        //             })}
        //             defaultValue={mapping.external_id || ''}
        //             onSelect={(e) => {
        //               const site = external.find((site) => site.id === e);
        //               const index = idx + (page - 1) * size;
        //               const newMappings = [...mappings];
        //               newMappings[index].external_id = site.id;
        //               newMappings[index].external_name = site.name;
        //               newMappings[index].changed = true;
        //               newMappings[index].metadata = site;
        //               setMappings(newMappings);
        //             }}
        //             loading={isLoading}
        //           />
        //         </TableCell>
        //       </TableRow>
        //     ));
        //   }}
        // />
        }
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton onClick={handleSave} pendingText="Saving..." pending={isSubmitting}>
            Save Changes
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
