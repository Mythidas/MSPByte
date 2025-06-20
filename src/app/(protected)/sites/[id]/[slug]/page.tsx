import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import SophosPartnerMappings from '@/components/mappings/SophosPartnerMappings';
import { getSite } from 'packages/services/sites';
import ErrorDisplay from '@/components/ux/ErrorDisplay';
import { getSource } from 'packages/services/sources';
import Microsoft365Mappings from '@/components/mappings/Microsoft365Mappings';

type Props = {
  params: Promise<{ id: string; slug: string }>;
  searchParams: Promise<{ tab: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);
  const source = await getSource(undefined, params.slug);

  if (!site.ok || !source.ok) {
    return <ErrorDisplay />;
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
            <BreadcrumbLink href={`/sites/${site.data.id}`}>{site.data.name}</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{source.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      );
    } else {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={`/sites/${params.id}`}>{site.data.name}</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{source.data.name}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
  };

  const getMappingComponent = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return (
          <SophosPartnerMappings source={source.data} site={site.data} tab={searchParams.tab} />
        );
      case 'microsoft-365':
        return (
          <Microsoft365Mappings source={source.data} site={site.data} tab={searchParams.tab} />
        );
    }
  };

  return (
    <>
      {await breadcrumbs()}

      {getMappingComponent()}
    </>
  );
}
