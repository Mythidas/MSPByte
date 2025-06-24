import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getSite, getSites } from 'packages/services/sites';
import { getSiteSourceMappings } from 'packages/services/siteSourceMappings';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import { getSources } from 'packages/services/sources';
import RouteCard from '@/components/ux/RouteCard';
import SitesTable from '@/components/tables/SitesTable';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);
  const sites = await getSites(params.id);
  const sources = await getSources();
  const mappings = await getSiteSourceMappings(undefined, [params.id]);

  if (!site.ok || !sites.ok || !mappings.ok || !sources.ok) {
    return <ErrorDisplay message="Failed to fetch data" />;
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
            <BreadcrumbLink href={`/sites/${site.data.parent_id}`}>
              {parent.data.name}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      );
    } else {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{site.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
  };

  const display = () => {
    return mappings.data.length > 0 ? (
      <div className="grid grid-cols-4 gap-2">
        {mappings.data.map((mapping) => {
          const source = sources.data.find((s) => s.id === mapping.source_id);

          return (
            <RouteCard
              key={mapping.id}
              className="justify-center items-center"
              route={`/sites/${params.id}/${source?.slug}`}
              module="Sources"
              level="Read"
            >
              {source?.name}
            </RouteCard>
          );
        })}
      </div>
    ) : (
      <ErrorDisplay message="No site mappings found" />
    );
  };

  if (site.data.is_parent) {
    return (
      <>
        {await breadcrumbs()}

        <Tabs defaultValue={searchParams.tab || 'sites'}>
          <TabsList>
            <RouteTabsTrigger value="sites">Sites</RouteTabsTrigger>
            <RouteTabsTrigger value="sources">Sources</RouteTabsTrigger>
          </TabsList>
          <TabsContent value="sources">{display()}</TabsContent>
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

      {display()}
    </>
  );
}
