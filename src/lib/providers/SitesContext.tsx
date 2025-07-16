'use client';

// lib/providers/SourceContext.tsx

import { createContext, useContext } from 'react';
import { Tables } from '@/db/schema';

const SitesContext = createContext<Tables<'sites'>[]>([]);

export function SitesProvider({
  value,
  children,
}: {
  value?: Tables<'sites'>[];
  children: React.ReactNode;
}) {
  return <SitesContext.Provider value={value || []}>{children}</SitesContext.Provider>;
}

export const useSites = () => {
  const ctx = useContext(SitesContext);
  if (!ctx) throw new Error('useSource must be used within a SourceProvider');
  return ctx;
};
