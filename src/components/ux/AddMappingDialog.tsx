'use client'

import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getTenants } from "@/lib/functions/external/sophos/tenants";
import { putSiteSourceMapping } from "@/lib/functions/sources";
import { Tables } from "@/types/database";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function AddMappingDialog({ integration, sites, existingMappings }: {
  integration: Tables<'source_integrations'>,
  sites: Tables<'sites'>[],
  existingMappings: Tables<'site_source_mappings'>[]
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [availableSites, setAvailableSites] = useState<Tables<'sites'>[]>([]);
  const [sophosId, setSophosId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [external, setExternal] = useState<{ id: string, name: string }[]>([]);

  async function loadSites() {
    setIsLoading(true);
    try {
      const mappedSiteIds = existingMappings.map(m => m.site_id);
      setAvailableSites(sites.filter((site: Tables<'sites'>) => !mappedSiteIds.includes(site.id)));

      const tenants = await getTenants(integration);
      setExternal(tenants);
    } catch (error) {
      console.error("Failed to load sites:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateMapping() {
    if (!selectedSite || !sophosId) return;

    try {
      setIsPending(true);

      const sophosTenant = external.find((e) => e.id === sophosId)!;
      await putSiteSourceMapping({
        id: "",
        site_id: selectedSite,
        source_id: integration.source_id,
        tenant_id: integration.tenant_id,
        external_name: sophosTenant.name,
        external_id: sophosTenant.id,
        metadata: sophosTenant
      });
      setIsOpen(false);
      window.location.reload(); // Refresh to see new mapping
    } catch (error) {
      console.error("Failed to create mapping:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) loadSites();
    }}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Mapping
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create Site Mapping</AlertDialogTitle>
          <AlertDialogDescription>
            Map a site from your account to a site in your Sophos Partner account.
            Please enter the Sophos site identifier.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ?
          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label>Site</Label>
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="grid gap-2">
              <Label>Sophos Site</Label>
              <Skeleton className="h-6 w-full" />
            </div>
          </div>
          :
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="site">Site</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedSite ? sites.find(site => site.id === selectedSite)?.name : "Select a site..."}
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
                          availableSites.map((site) => (
                            <CommandItem
                              key={site.id}
                              value={site.name}
                              onSelect={(value) => {
                                setSelectedSite(site.id);
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sophosId">Sophos Site</Label>
              <div className="flex flex-col space-y-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {sophosId ? external.find(site => site.id === sophosId)?.name : "Select a Sophos site..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search Sophos sites..."
                      />
                      <CommandList>
                        <CommandEmpty>No sites found</CommandEmpty>
                        <CommandGroup>
                          {isLoading ? (
                            <CommandItem disabled>Loading sites...</CommandItem>
                          ) : (
                            external.map((site) => (
                              <CommandItem
                                key={site.id}
                                value={site.name}
                                onSelect={(value) => {
                                  setSophosId(site.id);
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
                {sophosId && (
                  <p className="text-xs text-muted-foreground">
                    Selected Sophos Site ID: {sophosId}
                  </p>
                )}
              </div>
            </div>
          </div>}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={handleCreateMapping}
            disabled={!selectedSite || !sophosId || isPending}
          >
            {isPending ? "Creating..." : "Create Mapping"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent >
    </AlertDialog >
  );
}