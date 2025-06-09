'use client';

import { RoleAccessLevel, RoleAccessModule } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { QueryData } from "@supabase/supabase-js";
import { createContext, useContext } from 'react';

const supabase = createClient();
export const userWithRoleQuery = (id: string) => supabase
  .from('users')
  .select(`
    id,
    tenant_id,
    name,
    email,
    roles (
      rights
    )
  `).eq('id', id).single();
export type UserContextView = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  roles: {
    rights: Record<RoleAccessModule, RoleAccessLevel>;
  };
}

const UserContext = createContext<UserContextView | null>(null);

export const useUser = () => useContext(UserContext);

export default UserContext;

export function hasAccess(context: UserContextView | null, module: RoleAccessModule, access: RoleAccessLevel) {
  if (!context || !context.roles || !context.roles.rights) return false;
  const rights = context.roles.rights as Record<RoleAccessModule, string>;
  const value = rights[module];

  if (value === "none") return false;
  else if (access === "read") {
    return value === "read" || value === "edit" || value === "full";
  } else if (access === "edit") {
    return value === "edit" || value === "full";
  }

  return value === "full";
}