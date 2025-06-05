'use client'

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/types/database";
import { useUser } from "@/lib/providers/UserContext";
import { useActionState, useState } from "react";
import { FormFooterProps, FormState } from "@/types";
import { UserFormValues } from "@/lib/forms/users";
import FormAlert from "@/components/ux/FormAlert";
import { Label } from "@/components/ui/label";
import FormFooter from "@/components/ux/FormFooter";
import FormError from "@/components/ux/FormError";

type Props = {
  user: Tables<'users'>;
  roles: Tables<'roles'>[];
  footer: FormFooterProps;
  action: (
    _prevState: any,
    params: FormData
  ) => Promise<FormState<UserFormValues>>;
};

export default function UserForm({ user, roles, footer, action }: Props) {
  const [state, formAction] = useActionState(action, {});
  const [role, setRole] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const context = useUser();

  return (
    <form className="space-y-6" action={formAction}>
      <input hidden name="tenant_id" defaultValue={user.tenant_id} />

      <FormAlert errors={state.errors} message={state.message} />
      <Label className="flex flex-col items-start">
        Name
        <Input name="name" placeholder="John Doe" defaultValue={state.values?.name} />
        <FormError name="name" errors={state.errors} />
      </Label>
      <Label className="flex flex-col items-start">
        Email
        <Input name="email" placeholder="John.Doe@email.com" disabled={context?.id === user.id} defaultValue={state.values?.email} />
        <FormError name="email" errors={state.errors} />
      </Label>

      <Separator />

      <Label className="flex flex-col items-start">
        Role
        <Select onValueChange={(e) => setRole(e)} defaultValue={state.values?.role_id} disabled={context?.id === user.id}>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormError name="role_id" errors={state.errors} />
      </Label>
      <input hidden id="role_id" name="role_id" defaultValue={role} />

      <Label>
        <Checkbox
          defaultChecked={sendEmail}
          onChange={(e) => setSendEmail(!sendEmail)}
        />
        Send invitation email?
        <FormError name="send_email" errors={state.errors} />
      </Label>
      <input hidden id="send_email" name="send_email" type="checkbox" checked={sendEmail} readOnly />

      <FormFooter
        {...footer}
      />
    </form>
  );
}