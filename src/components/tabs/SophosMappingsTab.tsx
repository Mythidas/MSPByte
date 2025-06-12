import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import PaginatedTable from "@/components/ux/PaginatedTable";
import { getTenants } from "@/lib/functions/external/sophos/tenants";
import { getSiteMappingsView, putSiteSourceMapping } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
}

export default function SophosMappingsTab(props: Props) {
  const [mappings, setMappings] = useState<(Tables<'site_mappings_view'> & { changed?: boolean })[]>([]);
  const [external, setExternal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenants = await getTenants(props.integration);
        const siteMappings = await getSiteMappingsView(props.source.id);

        setMappings(siteMappings.sort((a, b) => a.site_name!.localeCompare(b.site_name!)));
        setExternal(tenants);
      } catch (error) {
        console.error("Failed to load mappings: ", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);

    for await (const mapping of mappings) {
      if (mapping.changed) {
        await putSiteSourceMapping({
          id: "",
          tenant_id: props.integration.tenant_id,
          site_id: mapping.site_id!,
          source_id: props.source.id,
          external_id: mapping.external_id!,
          external_name: mapping.external_name!,
          metadata: mapping.metadata
        });
      }
    }

    setIsLoading(false);
    toast.info('Site Mappings Saved!', { position: 'top-center' });
  }

  return (
    <TabsContent value="mappings" className="py-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Site Mappings</h3>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save />
            Save
          </Button>
        </div>

        <Card className="py-2">
          <PaginatedTable
            pageSize={7}
            data={mappings}
            head={() =>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Sophos Site</TableHead>
              </TableRow>
            }
            body={(data, page) => {
              return data.map((mapping, idx) =>
                <TableRow key={idx}>
                  <TableCell>{mapping.client_name}</TableCell>
                  <TableCell>{mapping.site_name}</TableCell>
                  <TableCell className="w-96">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {mapping.external_name || "Select a site..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search sites..."
                          />
                          <CommandList>
                            <CommandEmpty>No sites available</CommandEmpty>
                            <CommandGroup>
                              {isLoading ? (
                                <CommandItem disabled>Loading sites...</CommandItem>
                              ) : (
                                external.map((site) => (
                                  <CommandItem
                                    key={site.id}
                                    value={site.name}
                                    onSelect={(value) => {
                                      const index = idx + (page - 1) * 7;
                                      const newMappings = [...mappings];
                                      newMappings[index].external_id = site.id;
                                      newMappings[index].external_name = site.name;
                                      newMappings[index].changed = true;
                                      newMappings[index].metadata = site;
                                      setMappings(newMappings);
                                    }}
                                  >
                                    {site.name}
                                  </CommandItem>
                                ))
                              )}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              )
            }}
          />
        </Card>
      </div>
    </TabsContent>
  );
}