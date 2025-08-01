'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared/Spinner';
import { type ComponentProps } from 'react';
import { useFormStatus } from 'react-dom';
import { useUser } from '@/lib/providers/UserContext';
import { RoleAccessLevel, RoleAccessModule } from '@/types/rights';

type Props = ComponentProps<typeof Button> & {
  pending?: boolean;
  disabled?: boolean;
  module?: RoleAccessModule;
  level?: RoleAccessLevel;
};

export function SubmitButton({ children, disabled, pending, module, level, ...props }: Props) {
  const { pending: status } = useFormStatus();
  const { hasAccess } = useUser();

  const isDisabled =
    disabled || status || pending || (module && level && !hasAccess(module, level));

  return (
    <Button type="submit" aria-disabled={isDisabled} disabled={isDisabled} {...props}>
      {(status || pending) && <Spinner size={18} />} {children}
    </Button>
  );
}
