import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { Tables } from "@/types/database";
import { CommandInput, CommandList, CommandEmpty, CommandItem, Command } from "@/components/ui/command";
import { useEffect, useState } from "react";
import { getParentSites, updateSite } from "@/lib/actions/server/sites";
import { toast } from "sonner";

type Props = {
  sites: Tables<'sites'>[];
  parentId: string;
  onSuccess?: (site: Tables<'sites'>, parent: string) => void;
}

export default function MoveSiteDialog({ sites, parentId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parents, setParents] = useState<Tables<'sites'>[]>([]);
  const [parent, setParent] = useState<Tables<'sites'> | undefined>(undefined);
  const [site, setSite] = useState<Tables<'sites'> | undefined>(undefined);

  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);

      try {
        const sites = await getParentSites();
        if (!sites.ok) {
          throw new Error(sites.error.message);
        }

        setParents(sites.data.filter((p) => p.id !== parentId));
      } catch (err) {

      } finally {
        setIsLoading(false);
      }
    }

    loadSites();
  }, []);

  const handleMove = async () => {
    setIsLoading(true);

    try {
      if (!parent) {
        throw new Error('No parent selected');
      }
      if (!site) {
        throw new Error('No site selected');
      }

      const result = await updateSite({ ...site, parent_id: parent.id } as Tables<'sites'>);
      if (result.ok) {
        (onSuccess && site) && onSuccess(site, parent.name);
      }
    } catch (err) {
      console.log(err)
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="secondary">
          Move Site
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move Site</AlertDialogTitle>
          <AlertDialogDescription>Move site to a new parent</AlertDialogDescription>
        </AlertDialogHeader>

        <Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {parent ? parent.name : "Select a parent..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search parents..."
                />
                <CommandList>
                  <CommandEmpty>No parents available</CommandEmpty>
                  {isLoading ? (
                    <CommandItem disabled>Loading parents...</CommandItem>
                  ) : (
                    parents.map((site) => (
                      <CommandItem
                        key={site.id}
                        value={site.name}
                        onSelect={(value) => {
                          setParent(site);
                        }}
                      >
                        {site.name}
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Label>

        <Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between"
              >
                {site ? site.name : "Select a site..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search sites..."
                />
                <CommandList>
                  <CommandEmpty>No sites available</CommandEmpty>
                  {isLoading ? (
                    <CommandItem disabled>Loading sites...</CommandItem>
                  ) : (
                    sites.map((site) => (
                      <CommandItem
                        key={site.id}
                        value={site.name}
                        onSelect={(value) => {
                          setSite(site);
                        }}
                      >
                        {site.name}
                      </CommandItem>
                    ))
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </Label>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <SubmitButton onClick={handleMove} pendingText="Move Site" pending={isLoading}>
            Move Site
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}