import {
  Card,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getClient, getSite } from "@/lib/functions/clients";
import { Tabs, TabsList } from "@/components/ui/tabs";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import SophosPartnerTab from "@/components/tabs/SophosPartnerTab";
import { getIntegrations, getSiteSourceMappingsBySite, getSources } from "@/lib/functions/sources";
import { Tables } from "@/types/database";

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab: string }>;
}

export default async function Page(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);
  const client = await getClient(site?.client_id || "");
  const mappings = await getSiteSourceMappingsBySite(site?.id || "");
  const sources = await getSources();

  if (!site || !client) {
    return (
      <Card>
        Failed to fetch data. Contact support.
      </Card>
    )
  }

  function getDefaultTab() {
    const source = sources.find((s) => s.id === mappings[0].source_id);
    return source?.slug || "";
  }

  function getTab(mapping: Tables<'site_source_mappings'>) {
    const source = sources.find((s) => s.id === mapping.source_id);
    return source && <RouteTabsTrigger key={mapping.id} value={source.slug}>{source.name}</RouteTabsTrigger>
  }

  function getTabContent(mapping: Tables<'site_source_mappings'>) {
    const source = sources.find((s) => s.id === mapping.source_id);

    switch (source?.slug) {
      case 'sophos-partner':
        return <SophosPartnerTab key={mapping.id} site={site!} mapping={mapping} />;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbLink href={`/clients/${client.id}`}>{client.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>{site.name}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <Tabs defaultValue={getDefaultTab()}>
        <TabsList>
          {mappings.map((mapping) => {
            return getTab(mapping);
          })}
        </TabsList>
        {mappings.map((mapping) => {
          return getTabContent(mapping);
        })}
      </Tabs>
    </div>
  );
}