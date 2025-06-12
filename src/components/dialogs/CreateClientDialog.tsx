import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormAlert from "@/components/ux/FormAlert";
import FormError from "@/components/ux/FormError";
import RouteButton from "@/components/ux/RouteButton";
import { SubmitButton } from "@/components/ux/SubmitButton";
import { createClientAction } from "@/lib/actions/clients";
import { ClientFormValues } from "@/lib/forms/clients";
import { useUser } from "@/lib/providers/UserContext";
import { FormState } from "@/types";
import { HousePlus } from "lucide-react";
import { useActionState, useState } from "react";

export default function CreateClientDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState<FormState<ClientFormValues>, FormData>(createClientAction, {});
  const context = useUser();

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <RouteButton module="clients" level="edit">
          <HousePlus className="h-4 w-4 mr-2" />
          Add Client
        </RouteButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form className="flex flex-col gap-4" action={formAction}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Client</AlertDialogTitle>
            <AlertDialogDescription>
              Create a parent client.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <FormAlert errors={state.errors} message={state.message} />
          <Label className="flex flex-col items-start">
            Name
            <Input name="name" placeholder="Enter name" defaultValue={state.values?.name} />
            <FormError name="name" errors={state.errors} />
          </Label>
          <input hidden name="id" defaultValue={""} />
          <input hidden name="tenant_id" defaultValue={context?.tenant_id} />

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <SubmitButton pendingText="Creating Client...">
              Create Client
            </SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}