'use client';

import { Tables } from '@/db/schema';
import { SiteProvider } from '@/lib/providers/SiteContext';
export default function SiteProviderClient({
  site,
  children,
}: {
  site: Tables<'sites'>;
  children: React.ReactNode;
}) {
  return <SiteProvider value={site}>{children}</SiteProvider>;
}
