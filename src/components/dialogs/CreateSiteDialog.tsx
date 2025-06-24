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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormAlert from '@/components/ux/FormAlert';
import FormError from '@/components/ux/FormError';
import RouteButton from '@/components/ux/RouteButton';
import { SubmitButton } from '@/components/ux/SubmitButton';
import { Tables } from '@/db/schema';
import { createSiteAction } from '@/lib/actions/sites';
import { SiteFormValues } from '@/lib/forms/sites';
import { useUser } from '@/lib/providers/UserContext';
import { FormState } from '@/types';
import { HousePlus } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';

type Props = {
  parentId?: string;
  onSuccess?: (site: Tables<'sites'>) => void;
};

export default function CreateSiteDialog({ parentId, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<FormState<SiteFormValues>, FormData>(
    createSiteAction,
    {}
  );
  const context = useUser();

  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess(state.values as Tables<'sites'>);
      setIsOpen(false);
    }
  }, [state]);

  const getValue = (name: string) => {
    if (state.success) return '';
    return state.values && state.values['name'];
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RouteButton module="Sites" level="Write">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Site
        </RouteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Site</AlertDialogTitle>
          </AlertDialogHeader>

          <FormAlert errors={state.errors} message={state.message} />
          <Label className="flex flex-col items-start">
            Name
            <Input name="name" placeholder="Enter name" defaultValue={getValue('name')} />
            <FormError name="name" errors={state.errors} />
          </Label>
          {!parentId && (
            <Label>
              <Checkbox name="is_parent" defaultChecked={false} />
              Parent?
            </Label>
          )}
          <input hidden name="id" defaultValue={''} />
          <input hidden name="tenant_id" defaultValue={context?.tenant_id} />
          <input hidden name="parent_id" defaultValue={parentId} />

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <SubmitButton pendingText="Creating Site...">Create Site</SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
