'use client';

import MicrosoftIdentitiesTable from '@/components/tables/MicrosoftIdentitiesTable';
import SourceMetricsAggregatedGroupedTable from '@/components/tables/SourceMetricsAggregatedGroupedTable';
import SourceMetricsAggregatedTable from '@/components/tables/SourceMetricsAggregatedTable';
import SourceMetricsTable from '@/components/tables/SourceMetricsTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';
import { Spinner } from '@/components/ux/Spinner';
import SyncSourceItem from '@/components/ux/SyncSourceItem';
import { Tables } from '@/db/schema';
import { getSites } from '@/services/sites';
import { Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
};

export default function SophosPartnerMappings({ source, site }: Props) {
  const searchParams = useSearchParams();
  const type = !site ? 'global' : site.is_parent ? 'parent' : 'site';

  const renderBody = () => {
    switch (type) {
      case 'global':
        return GlobalComponent({ source });
      case 'parent':
        return SiteParentComponent({ source, site });
      case 'site':
        return SiteComponent({ source, site });
    }
  };

  return (
    <Tabs
      defaultValue={searchParams.get('tab') || 'dashboard'}
      value={searchParams.get('tab') || 'dashboard'}
    >
      <div className="flex size-full justify-between">
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SyncSourceItem type={type} source={source} site={site} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {renderBody()}
    </Tabs>
  );
}

function GlobalComponent({ source }: Props) {
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const sites = await getSites();

        if (!sites.ok) {
          throw new Error();
        }

        setSites(sites.data);
      } catch {
        toast.error('Failed to fetch data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <>
      <TabsContent value="dashboard">
        <SourceMetricsAggregatedTable sourceId={source.id} />
      </TabsContent>
      <TabsContent value="identities">
        {isLoading ? (
          <div className="flex size-full justify-center items-center">
            <Spinner size={48} />
          </div>
        ) : (
          <MicrosoftIdentitiesTable sourceId={source.id} siteIds={sites.map((s) => s.id)} />
        )}
      </TabsContent>
    </>
  );
}

function SiteParentComponent({ source, site }: Props) {
  const [sites, setSites] = useState<Tables<'sites'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const sites = await getSites(site?.id);

        if (!sites.ok) {
          throw new Error();
        }

        setSites(sites.data);
      } catch {
        toast.error('Failed to fetch data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [source, site]);

  return (
    <>
      <TabsContent value="dashboard">
        <SourceMetricsAggregatedGroupedTable sourceId={source.id} parentId={site!.id} />
      </TabsContent>
      <TabsContent value="identities">
        {isLoading ? (
          <div className="flex size-full justify-center items-center">
            <Spinner size={48} />
          </div>
        ) : (
          <MicrosoftIdentitiesTable sourceId={source.id} siteIds={sites.map((s) => s.id)} />
        )}
      </TabsContent>
    </>
  );
}

function SiteComponent({ source, site }: Props) {
  return (
    <>
      <TabsContent value="dashboard">
        <SourceMetricsTable sourceId={source.id} siteIds={[site!.id]} />
      </TabsContent>
      <TabsContent value="identities">
        <MicrosoftIdentitiesTable sourceId={source.id} siteIds={[site!.id]} siteLevel />
      </TabsContent>
    </>
  );
}
