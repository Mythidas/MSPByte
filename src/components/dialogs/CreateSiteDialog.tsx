import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormAlert from "@/components/ux/FormAlert";
import FormError from "@/components/ux/FormError";
import RouteButton from "@/components/ux/RouteButton";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { createSiteAction } from "@/lib/actions/form/clients";
import { SiteFormValues } from "@/lib/forms/clients";
import { FormState } from "@/types";
import { Tables } from "@/types/database";
import { HousePlus } from "lucide-react";
import { useActionState, useState } from "react";

type Props = {
  client: Tables<'clients'>;
}

export default function CreateSiteDialog(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<FormState<SiteFormValues>, FormData>(createSiteAction, {});

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RouteButton module="clients" level="edit">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Site
        </RouteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Site</AlertDialogTitle>
            <AlertDialogDescription>
              Create a child site.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <FormAlert errors={state.errors} message={state.message} />
          <Label className="flex flex-col items-start">
            Name
            <Input name="name" placeholder="Enter name" defaultValue={state.values?.name} />
            <FormError name="name" errors={state.errors} />
          </Label>
          <input hidden name="id" defaultValue={""} />
          <input hidden name="tenant_id" defaultValue={props.client.tenant_id} />
          <input hidden name="client_id" defaultValue={props.client.id} />

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <SubmitButton pendingText="Creating Site...">
              Create Site
            </SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}