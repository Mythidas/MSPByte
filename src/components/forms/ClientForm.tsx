'use client'

import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database";
import { useActionState } from "react";
import { FormFooterProps, FormState } from "@/types";
import FormAlert from "@/components/ux/FormAlert";
import { Label } from "@/components/ui/label";
import FormFooter from "@/components/ux/FormFooter";
import FormError from "@/components/ux/FormError";
import { ClientFormValues } from "@/lib/forms/clients";

type Props = {
  client: Tables<'clients'>;
  footer: FormFooterProps;
  action: (
    _prevState: any,
    params: FormData
  ) => Promise<FormState<ClientFormValues>>;
};

export default function ClientForm({ client, footer, action }: Props) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form className="space-y-6" action={formAction}>
      <input hidden name="id" defaultValue={client.id} />
      <input hidden name="tenant_id" defaultValue={client.tenant_id} />

      <FormAlert errors={state.errors} message={state.message} />
      <Label className="flex flex-col items-start">
        Name
        <Input name="name" placeholder="Enter name" defaultValue={state.values?.name} />
        <FormError name="name" errors={state.errors} />
      </Label>

      <FormFooter
        {...footer}
      />
    </form>
  );
}