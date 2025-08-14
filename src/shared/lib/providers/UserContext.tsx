'use client';

import { createContext, useContext } from 'react';
import { RoleAccessKey } from '@/features/users/types';
import { Tables } from '@/types/db';

type UserContextValue = {
  user: Tables<'public', 'user_view'> | undefined;
  options: Tables<'public', 'user_options'> | undefined;
  tenant: Tables<'public', 'tenants'> | undefined;
  hasAccess: (key: RoleAccessKey) => boolean;
  hasModule: (module: string) => boolean;
};

const UserContext = createContext<UserContextValue>({
  user: undefined,
  options: undefined,
  tenant: undefined,
  hasAccess: () => false,
  hasModule: () => false,
});

export const useUser = () => useContext(UserContext);

export default UserContext;
