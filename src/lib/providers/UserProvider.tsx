'use client';

import { ReactNode, useEffect, useState } from 'react';
import UserContext, { UserContextView } from '@/lib/providers/UserContext';
import { createClient } from '@/db/client';

const supabase = createClient();

const fetchUserContext = async (): Promise<UserContextView | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const { data, error } = await supabase
    .from('users')
    .select(
      `
      id,
      tenant_id,
      name,
      email,
      roles (
        rights
      )
    `
    )
    .eq('id', user.id)
    .single();

  return error ? null : (data as UserContextView);
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContextView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserContext().then((contextUser) => {
      setUser(contextUser);
      setIsLoading(false);
    });
  }, []);

  return <UserContext.Provider value={{ user, isLoading }}>{children}</UserContext.Provider>;
}
