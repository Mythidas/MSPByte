'use client';

import SitesTable from '@/components/domains/sites/SitesTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/lib/providers/SiteContext';

export default function Page() {
  const site = useSite();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Child Sites Management</CardTitle>
        <CardDescription>Manage and monitor all child sites under this parent</CardDescription>
      </CardHeader>
      <CardContent>
        <SitesTable parentId={site?.id} />
      </CardContent>
    </Card>
  );
}
