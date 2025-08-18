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
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/shared/components/secure/SubmitButton';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import SearchBox from '@/shared/components/SearchBox';
import { Tables } from '@/types/db';
import { getRows, updateRow } from '@/db/orm';

type Props = {
  sites: Tables<'public', 'sites'>[];
  parentId: string;
  onSuccess?: (site: Tables<'public', 'sites'>, parent: string) => void;
};

export default function MoveSiteDialog({ sites, parentId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [parents, setParents] = useState<Tables<'public', 'sites'>[]>([]);
  const [parent, setParent] = useState<Tables<'public', 'sites'> | undefined>(undefined);
  const [site, setSite] = useState<Tables<'public', 'sites'> | undefined>(undefined);

  useEffect(() => {
    const loadSites = async () => {
      setIsLoading(true);

      try {
        const sites = await getRows('public', 'sites', {
          filters: [['is_parent', 'eq', true]],
        });
        if (sites.error) {
          throw new Error(sites.error.message);
        }

        setParents(sites.data.rows.filter((p) => p.id !== parentId));
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    loadSites();
  }, [parentId]);

  const handleMove = async () => {
    setIsLoading(true);

    try {
      if (!parent) {
        throw new Error('No parent selected');
      }
      if (!site) {
        throw new Error('No site selected');
      }

      const result = await updateRow('public', 'sites', {
        id: site.id,
        row: {
          ...site,
          parent_id: parent.id,
        } as Tables<'public', 'sites'>,
      });
      if (result.error && onSuccess && site) {
        onSuccess(site, parent.name);
      }
    } catch (err) {
      toast.error(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <SubmitButton variant="secondary" module="Sites.Write">
          Move Site
        </SubmitButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move Site</AlertDialogTitle>
          <AlertDialogDescription>Move site to a new parent</AlertDialogDescription>
        </AlertDialogHeader>

        <Label className="flex flex-col gap-2 items-start">
          Parent
          <SearchBox
            placeholder="Select a parent"
            options={parents.map((p) => {
              return { label: p.name, value: p.id };
            })}
            onSelect={(e) => {
              const parent = parents.find((p) => p.id === e);
              setParent(parent);
            }}
          />
        </Label>

        <Label className="flex flex-col gap-2 items-start">
          Site
          <SearchBox
            placeholder="Select a site"
            options={sites.map((p) => {
              return { label: p.name, value: p.id };
            })}
            onSelect={(e) => {
              const site = sites.find((p) => p.id === e);
              setSite(site);
            }}
          />
        </Label>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <SubmitButton onClick={handleMove} pending={isLoading}>
            Move Site
          </SubmitButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
