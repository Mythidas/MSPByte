import SophosDevicesTab from '@/components/tabs/SophosDevicesTab';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';
import SourceMetricCard from '@/components/ux/SourceMetricCard';
import SyncSourceItem from '@/components/ux/SyncSourceItem';
import { Tables } from '@/db/schema';
import {
  getSourceMetricsAggregated,
  getSourceMetricsAggregatedGrouped,
  getSourceMetrics,
} from '@/services/metrics';
import { getSites } from '@/services/sites';
import { Settings } from 'lucide-react';

// TODO: Change this to client component and lazy load

type Props = {
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
  tab?: string;
};

export default async function SophosPartnerMappings({ source, site, tab }: Props) {
  const type = !site ? 'global' : site.is_parent ? 'parent' : 'site';

  const renderBody = async () => {
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
    <Tabs defaultValue={tab || 'dashboard'} value={tab}>
      <div className="flex w-full justify-between">
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
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

      {await renderBody()}
    </Tabs>
  );
}

async function GlobalComponent({ source }: Props) {
  const metrics = await getSourceMetricsAggregated(source.id);
  const sites = await getSites();

  if (!metrics.ok || !sites.ok) {
    return <ErrorDisplay />;
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return <SourceMetricCard key={metric.name} metric={metric as Tables<'source_metrics'>} />;
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} />
    </>
  );
}

async function SiteParentComponent({ source, site }: Props) {
  const metrics = await getSourceMetricsAggregatedGrouped(source.id, site!.id);
  const sites = await getSites(site!.id);

  if (!metrics.ok || !sites.ok) {
    return <ErrorDisplay />;
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return (
            <SourceMetricCard
              key={metric.name}
              metric={metric as unknown as Tables<'source_metrics'>}
              baseRoute={`/sites/${site!.id}/${source.slug}`}
            />
          );
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} />
    </>
  );
}

async function SiteComponent({ source, site }: Props) {
  const metrics = await getSourceMetrics(source.id, [site!.id]);

  if (!metrics.ok) {
    return <ErrorDisplay />;
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return (
            <SourceMetricCard
              key={metric.name}
              metric={metric as unknown as Tables<'source_metrics'>}
              baseRoute={`/sites/${site!.id}/${source.slug}`}
            />
          );
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={[site!.id]} />
    </>
  );
}
