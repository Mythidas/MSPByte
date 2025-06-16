import Microsoft365InfoPopover from "@/components/popovers/Microsoft365InfoPopover";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import PaginatedTable from "@/components/ux/PaginatedTable";
import SkeletonTable from "@/components/ux/SkeletonTable";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { getSitesView } from "@/lib/actions/server/sites";
import { deleteSiteSourceMapping, getSiteMappings, putSiteSourceMapping } from "@/lib/actions/server/sources/site-source-mappings";
import { Tables } from "@/types/database";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
}

export default function Microsoft365MappingsDialog({ source }: Props) {
  const [mappings, setMappings] = useState<(Tables<'site_mappings_view'> & { changed?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
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
              site_name: site.name
            });
          }
        }

        setMappings(siteMappings.data.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
      } catch (error) {
        toast.error(`Failed to load mappings: ${error}`);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSave = (mapping: Tables<'site_mappings_view'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push(mapping);
    setMappings(newMappings.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
  }

  const handleClear = (mapping: Tables<'site_mappings_view'>) => {
    const newMappings = [...mappings].filter((m) => m.site_id !== mapping.site_id);
    newMappings.push({
      ...mapping,
      metadata: {},
      external_id: '',
      external_name: '',
    });
    setMappings(newMappings.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          Edit Mappings
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="!max-w-[100vw] w-[80vw] h-fit py-2">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Edit Mappings
          </AlertDialogTitle>
          <div className="flex w-full justify-between">
            <span>Missing Info: {mappings.filter((m) => !m.external_id).length}</span>
            <div className="flex gap-2">
            </div>
          </div>
        </AlertDialogHeader>
        {isLoading ? <SkeletonTable /> : <PaginatedTable
          data={mappings}
          head={() =>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="text-right">Microsoft Info</TableHead>
            </TableRow>
          }
          body={(data, page, size) => {
            return data.map((mapping, idx) =>
              <TableRow key={idx}>
                <TableCell>{mapping.site_name}</TableCell>
                <TableCell>{mapping.parent_name}</TableCell>
                <TableCell className="text-right">
                  <Microsoft365InfoPopover mapping={mapping} onSave={handleSave} onClear={handleClear} />
                </TableCell>
              </TableRow>
            )
          }}
        />}
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}