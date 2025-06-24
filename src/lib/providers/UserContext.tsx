'use client';

import { createClient } from '@/db/client';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';
import { createContext, useContext } from 'react';

const supabase = createClient();
export const userWithRoleQuery = (id: string) =>
  supabase
    .from('users')
    .select(
      `
    id,
    tenant_id,
    name,
    email,
    roles (
      rights
    )
  `
    )
    .eq('id', id)
    .single();
export type UserContextView = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  roles: {
    rights: Record<RoleAccessModule, RoleAccessLevel>;
  };
};

const UserContext = createContext<UserContextView | null>(null);

export const useUser = () => useContext(UserContext);

export default UserContext;

export function hasAccess(
  context: UserContextView | null,
  module: RoleAccessModule,
  access: RoleAccessLevel
) {
  if (!context || !context.roles || !context.roles.rights) return false;
  const rights = context.roles.rights as Record<RoleAccessModule, string>;
  const value = rights[module] as RoleAccessLevel;

  if (value === 'None') return false;
  else if (access === 'Read') {
    return value === 'Read' || value === 'Write' || value === 'Full';
  } else if (access === 'Write') {
    return value === 'Write' || value === 'Full';
  }

  return value === 'Full';
}
