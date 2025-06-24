'use client';

import { createContext, useContext } from 'react';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';

export type UserContextView = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  roles: {
    rights: Record<RoleAccessModule, RoleAccessLevel>;
  };
};

type UserContextValue = {
  user: UserContextView | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue>({ user: null, isLoading: false });

export const useUser = () => useContext(UserContext);

export function hasAccess(
  context: UserContextView | null,
  module: RoleAccessModule,
  access: RoleAccessLevel
): boolean {
  if (!context || !context.roles || !context.roles.rights) return false;

  const current = context.roles.rights[module];
  if (!current || current === 'None') return false;

  const levels = ['None', 'Read', 'Write', 'Full'] as const;
  return levels.indexOf(current) >= levels.indexOf(access);
}

export default UserContext;
