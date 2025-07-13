'use client';

import SourcesTable from '@/components/domains/sources/SourcesTable';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAsync } from '@/hooks/common/useAsync';
import { useSite } from '@/lib/providers/SiteContext';
import { useSearchParams } from 'next/navigation';
import { getSites } from '@/services/sites';

export default function SiteIntegrationsTab() {
  const site = useSite();
  const searchParams = useSearchParams();
  const sub = searchParams.get('sub') || 'individual';

  const {
    data: { sites },
    isLoading,
  } = useAsync({
    initial: { sites: [] },
    fetcher: async () => {
      if (site?.is_parent) {
        const sites = await getSites(site.id);
        if (!sites.ok) {
          throw sites.error.message;
        }

        return {
          sites: sites.data.rows.map((site) => site.id),
        };
      }

      return {
        sites: [],
      };
    },
    deps: [site],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {site?.is_parent
            ? `Integrations - ${sub === 'individual' || !sub ? 'Individual' : 'Aggregated'} View`
            : 'Site Integrations'}
        </CardTitle>
        <CardDescription>
          {site?.is_parent
            ? sub === 'individual' || !sub
              ? 'View integrations for parent site'
              : 'Aggregated view of all integrations across child sites & parent'
            : 'Configure and monitor your integration sources'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isLoading && (
          <SourcesTable
            siteIds={site?.is_parent ? [site?.id, ...sites] : [site?.id || '']}
            route={`/sites/${site?.id}`}
            sub={sub}
          />
        )}
      </CardContent>
    </Card>
  );
}
