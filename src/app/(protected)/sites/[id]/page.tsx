import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getSite } from 'packages/services/sites';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import SitesTable from '@/components/tables/SitesTable';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';
import SourcesTable from '@/components/tables/SourcesTable';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);

  if (!site.ok) {
    return <ErrorDisplay message="Failed to find site" />;
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
            <SourcesTable route={`/sites/${site.data.id}`} />
          </TabsContent>
          <TabsContent value="sites">
            <SitesTable parentId={site.data.id} />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  return (
    <>
      {await breadcrumbs()}

      <SourcesTable route={`/sites/${site.data.id}`} />
    </>
  );
}
