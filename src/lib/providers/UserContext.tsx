'use client';

import { createContext, useContext } from 'react';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';
import { Tables } from '@/db/schema';

type UserContextValue = {
  user: Tables<'user_view'> | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextValue>({ user: null, isLoading: false });

export const useUser = () => useContext(UserContext);

export function hasAccess(
  context: Tables<'user_view'> | null,
  module: RoleAccessModule,
  access: RoleAccessLevel
): boolean {
  if (!context || !context.rights) return false;

  const current = (context.rights as Record<RoleAccessModule, RoleAccessLevel>)[module];
  if (!current || current === 'None') return false;

  const levels = ['None', 'Read', 'Write', 'Full'] as const;
  return levels.indexOf(current) >= levels.indexOf(access);
}

export default UserContext;
