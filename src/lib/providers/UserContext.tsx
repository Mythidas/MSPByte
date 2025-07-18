'use client';

import { createContext, useContext } from 'react';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';
import { Tables } from '@/db/schema';

type UserContextValue = {
  user: Tables<'user_view'> | undefined;
  options: Tables<'user_options'> | undefined;
  isLoading: boolean;
  hasAccess: (module: RoleAccessModule, access: RoleAccessLevel) => boolean;
  refresh: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  options: undefined,
  isLoading: false,
  hasAccess: () => false,
  refresh: () => {},
});

export const useUser = () => useContext(UserContext);

export default UserContext;
