'use client';

import SitesTable from '@/components/domain/sites/SitesTable';
import { useSite } from '@/lib/providers/SiteContext';

export default function Page() {
  const site = useSite();

  return <SitesTable parentId={site?.id} />;
}
