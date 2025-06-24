'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserContext, { UserContextView, userWithRoleQuery } from '@/lib/providers/UserContext';
import { createClient } from '@/db/client';

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextView | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: context } = await userWithRoleQuery(user?.id || '');
      if (context) {
        setUser(context as UserContextView);
      }
    };
    getUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
