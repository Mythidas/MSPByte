'use client';

import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card';
import { Spinner } from '@/components/common/Spinner';
import { getSourceIntegrationsView } from '@/services/integrations';
import { useState } from 'react';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import { getSourceTenants } from '@/services/source/tenants';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/common/SearchBar';

type Props = {
  siteIds?: string[];
  sub?: string;
  route?: string;
};

export default function SourcesTable({ siteIds, route, sub = 'individual' }: Props) {
  const [search, setSearch] = useState('');
  const { content } = useLazyLoad({
    fetcher: async () => {
      const integrations = await getSourceIntegrationsView();
      if (!integrations.ok) {
        return {
          mappings: [],
          integrations: [],
        };
      }
      if (siteIds) {
        const mappings = await getSourceTenants(undefined, siteIds);
        if (mappings.ok) {
          return {
            mappings: mappings.data.rows,
            integrations: integrations.data.rows,
          };
        }
      }

      return {
        mappings: [],
        integrations: integrations.data.rows,
      };
    },
    render: (data) => {
      if (!data) return <strong>Failed to fetch data. Please refresh.</strong>;

      return (
        <div className="grid grid-cols-4 gap-4">
          {data.integrations
            .filter((integration) => {
              const lowerSearch = search.toLowerCase();
              const lowerName = integration?.source_name?.toLowerCase();
              return lowerName?.includes(lowerSearch);
            })
            .map((integration) => {
              if (siteIds) {
                if (!data.mappings.some((mapping) => mapping.source_id === integration.source_id)) {
                  return null;
                }
              }

              return (
                <Card key={integration.id}>
                  <CardHeader>
                    {integration?.source_name}
                    <CardAction>
                      <Link href={`${route}/${integration?.source_id}?sub=${sub}&tab=dashboard`}>
                        <Settings className="w-4 h-4" />
                      </Link>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {siteIds && 'Last Sync: N/A'}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      );
    },
    skeleton: () => (
      <div className="flex w-full justify-center items-center">
        <Spinner />
      </div>
    ),
    deps: [],
  });

  return (
    <div className="flex flex-col gap-4 size-full">
      <div className="w-2/5">
        <SearchBar placeholder="Search integrations..." onSearch={setSearch} />
      </div>

      {content}
    </div>
  );
}
