'use client';

// components/context/SiteContext.tsx
import { Tables } from '@/db/schema';
import { createContext, useContext } from 'react';

export const SiteContext = createContext<Tables<'sites'> | null>(null);
export const useSite = () => useContext(SiteContext);
export const SiteProvider = SiteContext.Provider;
