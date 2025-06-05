'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { RoleAccessLevel, RoleAccessModule } from "@/types";
import { Button } from "@/components/ui/button";
import { hasAccess, useUser } from "@/lib/providers/UserContext";

type Props = {
  route: string;
  module?: RoleAccessModule;
  level?: RoleAccessLevel;
  disabled?: boolean;
} & React.ComponentProps<typeof Button>; // inherit all Button props

export default function RouteButton({ route, children, module, level, disabled, ...props }: Props) {
  const router = useRouter();
  const context = useUser();
  const access = (module && level && !hasAccess(context, module, level));

  return (
    <Button onClick={() => router.push(route)} {...props} disabled={disabled || access}>
      {children}
    </Button>
  );
}