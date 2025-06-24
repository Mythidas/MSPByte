'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { hasAccess, useUser } from '@/lib/providers/UserContext';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';

type Props = {
  module: RoleAccessModule;
  level: RoleAccessLevel;
  route?: string;
  disabled?: boolean;
} & React.ComponentProps<typeof Button>; // inherit all Button props

export default function RouteButton({ route, children, module, level, disabled, ...props }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const access = module && level && !hasAccess(user, module, level);

  return (
    <Button onClick={() => route && router.push(route)} {...props} disabled={disabled || access}>
      {children}
    </Button>
  );
}
