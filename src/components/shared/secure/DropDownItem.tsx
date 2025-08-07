'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/providers/UserContext';
import { cn } from '@/lib/utils';
import { RoleAccessKey } from '@/types/rights';
import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
  children: React.ReactNode;
  module: RoleAccessKey;
  route?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  inset?: boolean;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  type?: 'button' | 'submit';
  form?: string;
} & React.ComponentProps<typeof DropdownMenuItem>;

export default function DropDownItem({
  children,
  module,
  route,
  onClick,
  className,
  inset,
  variant,
  disabled,
  type,
  form,
  ...props
}: Props) {
  const router = useRouter();
  const { hasAccess } = useUser();

  if (type === 'submit') {
    return (
      <DropdownMenuItem
        className={cn(variant === 'destructive' && 'text-red-600', 'w-full', className)}
        inset={inset}
        disabled={disabled || !hasAccess(module)}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) {
            onClick(e);
          }
          if (route && hasAccess(module)) {
            router.push(route);
          }
        }}
        asChild
        {...props}
      >
        <Button
          type="submit"
          variant="ghost"
          className="flex !items-center !justify-start !ring-0"
          form={form}
        >
          {children}
        </Button>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      className={cn(variant === 'destructive' && 'text-red-600', 'w-full', className)}
      inset={inset}
      disabled={disabled || !hasAccess(module)}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick(e);
        }
        if (route && hasAccess(module)) {
          router.push(route);
        }
      }}
      {...props}
    >
      {children}
    </DropdownMenuItem>
  );
}
