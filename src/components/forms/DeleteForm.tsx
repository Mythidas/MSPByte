'use client';

import FormAlert from "@/components/ux/FormAlert";
import { DeleteFormValues } from "@/lib/forms";
import { FormState } from "@/types";
import { useActionState, useEffect } from "react";

type Props = {
  id: string;
  url?: string;
  onSuccess?: () => void;
  children: React.ReactNode;
  action: (
    _prevState: any,
    params: FormData
  ) => Promise<FormState<DeleteFormValues>>;
};

export default function DeleteForm({ id, url, onSuccess, children, action }: Props) {
  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (state.success && onSuccess) onSuccess();
  }, [state])

  return (
    <form id={id} action={formAction}>
      <FormAlert errors={state.errors} message={state.message} />
      <input name="id" hidden defaultValue={id} />
      <input name="url" hidden defaultValue={url} />
      {children}
    </form>
  );
}