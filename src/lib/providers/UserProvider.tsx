'use client';

import { ReactNode } from 'react';
import UserContext from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { RoleAccessKey } from '@/types/rights';

type Props = {
  user: Tables<'user_view'>;
  options: Tables<'user_options'>;
  tenant: Tables<'tenants'>;
  children: ReactNode;
};

export function UserProvider({ children, user, options, tenant }: Props) {
  const hasAccess = (key: RoleAccessKey) => {
    if (!user || !user.rights) return false;
    if ((user.rights as Record<RoleAccessKey, boolean>)['Global.Admin']) return true;

    const current = (user.rights as Record<RoleAccessKey, boolean>)[key];
    return current || false;
  };

  const hasModule = (module: string) => {
    if (!user || !user.rights) return false;
    if ((user.rights as Record<RoleAccessKey, boolean>)['Global.Admin']) return true;

    for (const [key, value] of Object.entries(user.rights)) {
      if (key.includes(module) && value) return true;
    }

    return false;
  };

  return (
    <UserContext.Provider value={{ user, options, tenant, hasAccess, hasModule }}>
      {children}
    </UserContext.Provider>
  );
}
