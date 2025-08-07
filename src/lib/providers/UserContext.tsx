'use client';

import { createContext, useContext } from 'react';
import { RoleAccessKey } from '@/types/rights';
import { Tables } from '@/db/schema';

type UserContextValue = {
  user: Tables<'user_view'> | undefined;
  options: Tables<'user_options'> | undefined;
  tenant: Tables<'tenants'> | undefined;
  isLoading: boolean;
  hasAccess: (key: RoleAccessKey) => boolean;
  hasModule: (module: string) => boolean;
  refresh: () => void;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  options: undefined,
  tenant: undefined,
  isLoading: false,
  hasAccess: () => false,
  hasModule: () => false,
  refresh: () => {},
});

export const useUser = () => useContext(UserContext);

export default UserContext;
