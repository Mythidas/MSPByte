'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserContext from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { getCurrentUserView, getUserOptions } from '@/services/users';
import { RoleAccessKey } from '@/types/rights';
import { getRow } from '@/db/orm';

const fetchUserContext = async () => {
  const user = await getCurrentUserView();

  if (user.ok) {
    const options = await getUserOptions(user.data.id!);
    const tenant = await getRow('tenants');
    return {
      user: user.data,
      options: options.ok ? options.data : undefined,
      tenant: tenant.ok ? tenant.data : undefined,
    };
  }

  return {
    user: undefined,
    options: undefined,
  };
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Tables<'user_view'>>();
  const [options, setOptions] = useState<Tables<'user_options'>>();
  const [tenant, setTenant] = useState<Tables<'tenants'>>();
  const [isLoading, setIsLoading] = useState(true);

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

  const load = () => {
    setIsLoading(true);
    fetchUserContext()
      .then(({ user, options, tenant }) => {
        setUser(user);
        setOptions(options);
        setTenant(tenant);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, options, tenant, isLoading, hasAccess, hasModule, refresh: load }}
    >
      {children}
    </UserContext.Provider>
  );
}
