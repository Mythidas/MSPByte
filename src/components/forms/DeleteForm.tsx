'use client';

import FormAlert from "@/components/ux/FormAlert";
import { DeleteFormValues } from "@/lib/forms";
import { FormState } from "@/types";
import { useActionState } from "react";

type Props = {
  id: string;
  url?: string;
  children: React.ReactNode;
  action: (
    _prevState: any,
    params: FormData
  ) => Promise<FormState<DeleteFormValues>>;
};

export default function DeleteForm({ id, url, children, action }: Props) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form id={id} action={formAction}>
      <FormAlert errors={state.errors} message={state.message} />
      <input name="id" hidden defaultValue={id} />
      <input name="url" hidden defaultValue={url} />
      {children}
    </form>
  );
}