'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserContext from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { getCurrentUserView, getUserOptions } from '@/services/users';
import { RoleAccessModule, RoleAccessLevel } from '@/types/rights';
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

  const hasAccess = (module: RoleAccessModule, access: RoleAccessLevel) => {
    if (!user || !user.rights) return false;

    const current = (user.rights as Record<RoleAccessModule, RoleAccessLevel>)[module];
    if (!current || current === 'None') return false;

    const levels = ['None', 'Read', 'Write', 'Full'] as const;
    return levels.indexOf(current) >= levels.indexOf(access);
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
    <UserContext.Provider value={{ user, options, tenant, isLoading, hasAccess, refresh: load }}>
      {children}
    </UserContext.Provider>
  );
}
