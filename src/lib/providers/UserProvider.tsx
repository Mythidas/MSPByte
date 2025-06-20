'use client';

import { ReactNode, useEffect, useState } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { RoleAccessModule } from '@/types';
import UserContext, {
  hasAccess,
  UserContextView,
  userWithRoleQuery,
} from '@/lib/providers/UserContext';
import { createClient } from '@/db/client';

const protectedRoutes: { route: string; module: RoleAccessModule }[] = [
  { route: '/users', module: 'users' },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextView | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: context } = await userWithRoleQuery(user?.id || '');
      if (context) {
        setUser(context as UserContextView);
        const route = protectedRoutes.find((route) => pathname!.includes(route.route));
        if (route) {
          if (!hasAccess(context as UserContextView, route.module, 'read')) {
            redirect('/');
          }
        }
      }
    };
    getUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
