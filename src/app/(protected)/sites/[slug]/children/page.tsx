'use client';

import SitesTable from '@/features/sites/components/SitesTable';
import { useSite } from '@/shared/lib/providers/SiteContext';

export default function Page() {
  const site = useSite();

  return <SitesTable parentId={site?.id} />;
}
