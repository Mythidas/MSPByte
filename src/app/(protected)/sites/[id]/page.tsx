import {
  Card,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getSite, getSites } from "@/lib/actions/server/sites";
import { getSiteSourceMappings } from "@/lib/actions/server/sources/site-source-mappings";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import { getSources } from "@/lib/actions/server/sources";
import RouteCard from "@/components/ux/RouteCard";
import SitesTable from "@/components/tables/SitesTable";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { getIntegrations } from "@/lib/actions/server/integrations";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab: string }>;
}

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);
  const sites = await getSites(params.id);
  const sources = await getSources();
  const integrations = await getIntegrations();

  if (!site.ok || !sites.ok || !integrations.ok || !sources.ok) {
    return <ErrorDisplay message="Failed to fetch data" />
  }

  const breadcrumbs = async () => {
    if (site.data.parent_id) {
      const parent = await getSite(site.data.parent_id);

      if (!parent.ok) {
        return null;
      }

      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={`/sites/${site.data.parent_id}`}>{parent.data.name}</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      )
    } else {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      )
    }
  }

  if (site.data.is_parent) {
    return (
      <>
        {await breadcrumbs()}

        <Tabs defaultValue={searchParams.tab || 'sites'}>
          <TabsList>
            <RouteTabsTrigger value="sites">Sites</RouteTabsTrigger>
            <RouteTabsTrigger value="sources">Sources</RouteTabsTrigger>
          </TabsList>
          <TabsContent value="sources">
            {integrations.data.length > 0 ? <div className="grid grid-cols-4 gap-2">
              {integrations.data.map((integrations) => {
                const source = sources.data.find((s) => s.id === integrations.source_id);

                return (
                  <RouteCard
                    key={integrations.id}
                    className="justify-center items-center"
                    route={`/sites/${params.id}/source/${source?.slug}`}
                    module="sites"
                    level="read"
                  >
                    {source?.name}
                  </RouteCard>
                )
              })}
            </div> : <ErrorDisplay message="No integrations found" />}
          </TabsContent>
          <TabsContent value="sites">
            <SitesTable parentId={site.data.id} sites={sites.data} />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  return (
    <>
      {await breadcrumbs()}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
      </div>

      {integrations.data.length > 0 ? <div className="grid grid-cols-4 gap-2">
        {integrations.data.map((integrations) => {
          const source = sources.data.find((s) => s.id === integrations.source_id);

          return (
            <RouteCard
              key={integrations.id}
              className="justify-center items-center"
              route={`/sites/${params.id}/source/${source?.slug}`}
              module="sites"
              level="read"
            >
              {source?.name}
            </RouteCard>
          )
        })}
      </div> : <ErrorDisplay message="No integrations found" />}
    </>
  );
}