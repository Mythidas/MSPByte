'use client';

import FormAlert from '@/components/common/FormAlert';
import { DeleteFormValues } from '@/lib/forms';
import { FormState } from '@/types';
import { useActionState, useEffect } from 'react';

type Props = {
  id: string;
  url?: string;
  onSuccess?: () => void;
  children: React.ReactNode;
  action: (_prevState: unknown, params: FormData) => Promise<FormState<DeleteFormValues>>;
};

export default function DeleteForm({ id, url, onSuccess, children, action }: Props) {
  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (state.success && onSuccess) onSuccess();
  }, [state, onSuccess]);

  return (
    <form id={id} action={formAction}>
      <FormAlert errors={state.errors} message={state.message} />
      <input name="id" hidden defaultValue={id} />
      <input name="url" hidden defaultValue={url} />
      {children}
    </form>
  );
}
