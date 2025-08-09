'use client';

// lib/providers/SourceContext.tsx

import { createContext, useContext, useEffect, useState } from 'react';
import { Tables } from '@/types/db';

type SourceContextType = {
  source?: Tables<'public', 'integrations_view'>;
  setSource: (src: Tables<'public', 'integrations_view'>) => void;
};

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({
  value,
  children,
}: {
  value?: Tables<'public', 'integrations_view'>;
  children: React.ReactNode;
}) {
  const [source, setSource] = useState<Tables<'public', 'integrations_view'> | undefined>(value);

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
