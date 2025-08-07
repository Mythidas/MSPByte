'use client';

// lib/providers/SourceContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { Tables } from '@/db/schema';

type SourceContextType = {
  source?: Tables<'source_integrations_view'>;
  setSource: (src: Tables<'source_integrations_view'>) => void;
};

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({
  value,
  children,
}: {
  value?: Tables<'source_integrations_view'>;
  children: React.ReactNode;
}) {
  const [source, setSource] = useState<Tables<'source_integrations_view'> | undefined>(value);

  useEffect(() => {
    setSource(value);
  }, [value]);

  return <SourceContext.Provider value={{ source, setSource }}>{children}</SourceContext.Provider>;
}

export const useSource = () => {
  const ctx = useContext(SourceContext);
  if (!ctx) throw new Error('useSource must be used within a SourceProvider');
  return ctx;
};
