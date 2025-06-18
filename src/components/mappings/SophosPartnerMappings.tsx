import SophosDevicesTab from "@/components/tabs/SophosDevicesTab";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import SourceMetricCard from "@/components/ux/SourceMetricCard";
import SyncSourceItem from "@/components/ux/SyncSourceItem";
import { getSites } from "@/lib/actions/server/sites";
import { getSourceMetrics, getSourceMetricsAggregated, getSourceMetricsAggregatedGrouped } from "@/lib/actions/server/sources/source-metrics";
import { Tables } from "@/types/database";
import { Settings } from "lucide-react";

// TODO: Change this to client component and lazy load

type Props = {
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
  tab?: string;
  search?: string;
}

export default async function SophosPartnerMappings({ source, site, tab, search }: Props) {
  const type = !site ? 'global' : site.is_parent ? 'parent' : 'site';

  const renderBody = async () => {
    switch (type) {
      case 'global':
        return GlobalComponent({ source, search });
      case 'parent':
        return SiteParentComponent({ source, site, search });
      case 'site':
        return SiteComponent({ source, site, search });
    }
  }

  return (
    <Tabs defaultValue={tab || "dashboard"}>
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
  )
}

async function GlobalComponent({ source, search }: Props) {
  const metrics = await getSourceMetricsAggregated(source.id);
  const sites = await getSites();

  if (!metrics.ok || !sites.ok) {
    return <ErrorDisplay />
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return <SourceMetricCard key={metric.name} metric={metric as Tables<'source_metrics'>} />
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} search={search} />
    </>
  )
}

async function SiteParentComponent({ source, site, search }: Props) {
  const metrics = await getSourceMetricsAggregatedGrouped(source.id, site!.id);
  const sites = await getSites(site!.id);

  if (!metrics.ok || !sites.ok) {
    return <ErrorDisplay />
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return <SourceMetricCard key={metric.name} metric={metric as any as Tables<'source_metrics'>} baseRoute={`/sites/${site!.id}/${source.slug}`} />
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} search={search} />
    </>
  )
}

async function SiteComponent({ source, site, search }: Props) {
  const metrics = await getSourceMetrics(source.id, [site!.id]);

  if (!metrics.ok) {
    return <ErrorDisplay />
  }

  return (
    <>
      <TabsContent value="dashboard" className="grid grid-cols-4 gap-2">
        {metrics.data.map((metric) => {
          return <SourceMetricCard key={metric.name} metric={metric as any as Tables<'source_metrics'>} baseRoute={`/sites/${site!.id}/${source.slug}`} />
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={[site!.id]} search={search} />
    </>
  );
}