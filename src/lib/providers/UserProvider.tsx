'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserContext from '@/lib/providers/UserContext';
import { Tables } from '@/db/schema';
import { getCurrentUserView } from '@/services/users';

const fetchUserContext = async (): Promise<Tables<'user_view'> | null> => {
  const user = await getCurrentUserView();

  return !user.ok ? null : user.data;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Tables<'user_view'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserContext().then((contextUser) => {
      setUser(contextUser);
      setIsLoading(false);
    });
  }, []);

  return <UserContext.Provider value={{ user, isLoading }}>{children}</UserContext.Provider>;
}
