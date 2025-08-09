'use client';

import { Tables } from '@/types/db';
import { SiteProvider } from '@/lib/providers/SiteContext';
export default function SiteProviderClient({
  site,
  children,
}: {
  site: Tables<'public', 'sites'>;
  children: React.ReactNode;
}) {
  return <SiteProvider value={site}>{children}</SiteProvider>;
}
