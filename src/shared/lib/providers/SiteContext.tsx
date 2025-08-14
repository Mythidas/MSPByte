'use client';

import { Tables } from '@/types/db';
import { createContext, useContext } from 'react';

export const SiteContext = createContext<Tables<'public', 'sites'> | null>(null);
export const useSite = () => useContext(SiteContext);
export const SiteProvider = SiteContext.Provider;
