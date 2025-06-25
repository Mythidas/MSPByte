'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ux/Spinner';
import { type ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  pending?: boolean;
};

export function SubmitButton({ children, pending = false, pendingText, ...props }: Props) {
  const { pending: status } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={status || pending} disabled={status || pending} {...props}>
      {(status || pending) && <Spinner size={18} />} {children}
    </Button>
  );
}
