'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { RoleAccessLevel, RoleAccessModule } from '@/types';
import { hasAccess, useUser } from '@/lib/providers/UserContext';
import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

type Props = {
  module: RoleAccessModule;
  level: RoleAccessLevel;
  route?: string;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<typeof TableRow>; // inherit all Button props

export default function RouteTableRow({
  route,
  children,
  module,
  level,
  disabled,
  className,
  ...props
}: Props) {
  const router = useRouter();
  const context = useUser();

  const handleRoute = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    if (e.isPropagationStopped()) {
      return;
    }

    if (route && !disabled && hasAccess(context, module, level)) {
      router.push(route);
    }
  };

  return (
    <TableRow className={cn(className, 'hover:cursor-pointer')} onClick={handleRoute} {...props}>
      {children}
    </TableRow>
  );
}
