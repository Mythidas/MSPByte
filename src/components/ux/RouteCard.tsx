'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { RoleAccessLevel, RoleAccessModule } from "@/types";
import { hasAccess, useUser } from "@/lib/providers/UserContext";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Props = {
  module: RoleAccessModule;
  level: RoleAccessLevel;
  route?: string;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<typeof Card>; // inherit all Button props

export default function RouteCard({ route, children, module, level, disabled, className, ...props }: Props) {
  const router = useRouter();
  const context = useUser();

  const handleRoute = () => {
    if (route && !disabled && hasAccess(context, module, level)) {
      router.push(route);
    }
  }

  return (
    <Card className={cn(className, 'hover:cursor-pointer')} onClick={handleRoute} {...props}>
      {children}
    </Card>
  );
}