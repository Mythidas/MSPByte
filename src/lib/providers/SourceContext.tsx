'use client';

// components/context/SiteContext.tsx
import { Tables } from '@/db/schema';
import { createContext, useContext } from 'react';

export const SourceContext = createContext<{
  source: Tables<'sources'>;
  integration?: Tables<'source_integrations'>;
} | null>(null);
export const useSource = () => useContext(SourceContext);
export const SourceProvider = SourceContext.Provider;
