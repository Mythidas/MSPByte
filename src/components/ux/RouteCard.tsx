'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { hasAccess, useUser } from '@/lib/providers/UserContext';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { RoleAccessLevel, RoleAccessModule } from '@/types/rights';

type Props = {
  module?: RoleAccessModule;
  level?: RoleAccessLevel;
  route?: string;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<typeof Card>; // inherit all Button props

export default function RouteCard({
  route,
  children,
  module,
  level,
  disabled: _disabled,
  className,
  ...props
}: Props) {
  const router = useRouter();
  const { user } = useUser();

  const disabled = _disabled || (module && level && !hasAccess(user, module, level));

  const handleRoute = () => {
    if (route && !disabled) {
      router.push(route);
    }
  };

  return (
    <Card className={cn(className, 'hover:cursor-pointer')} onClick={handleRoute} {...props}>
      {children}
    </Card>
  );
}
