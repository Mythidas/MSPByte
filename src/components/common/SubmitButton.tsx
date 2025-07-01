'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common/Spinner';
import { type ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';

type Props = ComponentProps<typeof Button> & {
  pending?: boolean;
  disabled?: boolean;
};

export function SubmitButton({ children, disabled, pending, ...props }: Props) {
  const { pending: status } = useFormStatus();

  return (
    <Button
      type="submit"
      aria-disabled={disabled || status || pending}
      disabled={disabled || status || pending}
      {...props}
    >
      {(status || pending) && <Spinner size={18} />} {children}
    </Button>
  );
}
