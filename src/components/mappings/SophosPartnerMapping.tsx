import SophosDevicesTab from "@/components/tabs/SophosDevicesTab";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import SourceMetricCard from "@/components/ux/SourceMetricCard";
import { getSites } from "@/lib/actions/server/sites";
import { getSourceMetrics, getSourceMetricsAggregated, getSourceMetricsAggregatedGrouped } from "@/lib/actions/server/sources/source-metrics";
import { Tables } from "@/types/database";

type Props = {
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
  tab?: string;
  search?: string;
}

export default async function SophosPartnerMapping({ source, site, tab, search }: Props) {
  const renderBody = async () => {
    if (!site) {
      return GlobalComponent({ source, search });
    } else if (site.is_parent) {
      return SiteParentComponent({ source, site, search });
    } else {
      return SiteComponent({ source, site, search });
    }
  }

  return (
    <Tabs defaultValue={tab || "dashboard"}>
      <TabsList>
        <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
        <RouteTabsTrigger value="devices">Devices</RouteTabsTrigger>
      </TabsList>

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
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} tabValue="devices" search={search} />
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
          return <SourceMetricCard key={metric.name} metric={metric as any as Tables<'source_metrics'>} baseRoute={`/sites/${site!.id}/source/${source.slug}`} />
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={sites.data.map((s) => s.id)} tabValue="devices" search={search} />
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
          return <SourceMetricCard key={metric.name} metric={metric as any as Tables<'source_metrics'>} baseRoute={`/sites/${site!.id}/source/${source.slug}`} />
        })}
      </TabsContent>
      <SophosDevicesTab sourceId={source.id} siteIds={[site!.id]} tabValue="devices" search={search} />
    </>
  );
}