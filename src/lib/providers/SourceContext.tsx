'use client';

// lib/providers/SourceContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { Tables } from '@/db/schema';
import { updateUser } from '@/services/users';
import { useUser } from '@/lib/providers/UserContext';
import { UserMetadata } from '@/types/users';

type SourceContextType = {
  source?: Tables<'source_integrations_view'>;
  setSource: (src: Tables<'source_integrations_view'>) => void;
};

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({
  value,
  integrations,
  children,
}: {
  value?: Tables<'source_integrations_view'>;
  integrations?: Tables<'source_integrations_view'>[];
  children: React.ReactNode;
}) {
  const [source, setSource] = useState<Tables<'source_integrations_view'> | undefined>(value);
  const { user } = useUser();

  useEffect(() => {
    const update = async () => {
      if (source && user) {
        await updateUser(user.id!, {
          metadata: {
            ...(user.metadata as object),
            selected_source: source.source_id,
          },
        });
      } else if (user) {
        await updateUser(user.id!, {
          metadata: {
            ...(user.metadata as object),
            selected_source: '',
          },
        });
      }
    };

    update();
  }, [source]);

  useEffect(() => {
    const update = async () => {
      try {
        const integration = integrations?.find(
          (integ) => integ.source_id === (user?.metadata as UserMetadata).selected_source
        );
        if (integration) setSource(integration);
      } catch {}
    };

    if (user) {
      if ((user.metadata as UserMetadata).selected_source !== source?.source_id) {
        update();
      }
    }
  }, [user]);

  useEffect(() => {
    if (value) {
      setSource(value);
    }
  }, [value]);

  return <SourceContext.Provider value={{ source, setSource }}>{children}</SourceContext.Provider>;
}

export const useSource = () => {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error('useSource must be used within a SourceProvider');
  return ctx;
};

export default function SourceHydrator({ source }: { source: Tables<'source_integrations_view'> }) {
  const { setSource } = useSource();

  useEffect(() => {
    setSource(source);
  }, [source, setSource]);

  return null;
}
