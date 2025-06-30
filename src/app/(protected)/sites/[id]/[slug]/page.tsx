import {
  Breadcrumb,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getSite } from 'packages/services/sites';
import ErrorDisplay from '@/components/common/ErrorDisplay';
import { getSource } from 'packages/services/sources';
import MicrosoftSiteMapping from '@/components/domains/microsoft/mappings/MicrosoftSiteMapping';
import MicrosoftParentMapping from '@/components/domains/microsoft/mappings/MicrosoftParentMapping';
import { Tables } from '@/db/schema';
import SophosSiteMapping from '@/components/domains/sophos/mappings/SophosSiteMapping';
import SophosParentMapping from '@/components/domains/sophos/mappings/SophosParentMapping';

type Props = {
  params: Promise<{ id: string; slug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function Page({ ...props }: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const site = await getSite(params.id);
  const source = await getSource(params.slug);

  if (!site.ok || !source.ok) {
    return <ErrorDisplay />;
  }

  const getParentMapping = (site: Tables<'sites'>) => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosParentMapping sourceId={params.slug} site={site} />;
      case 'microsoft-365':
        return <MicrosoftParentMapping sourceId={params.slug} site={site} tab={searchParams.tab} />;
    }
  };

  const getSiteMapping = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosSiteMapping sourceId={params.slug} site={site.data} />;
      case 'microsoft-365':
        return (
          <MicrosoftSiteMapping sourceId={params.slug} site={site.data} tab={searchParams.tab} />
        );
    }
  };

  if (site.data.parent_id) {
    const parent = await getSite(site.data.parent_id);

    if (!parent.ok) {
      return null;
    }

    return (
      <>
        <Breadcrumbs source={source.data} site={site.data} parent={parent.data} />
        {getSiteMapping()}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs source={source.data} site={site.data} />
      {site.data.is_parent ? getParentMapping(site.data) : getSiteMapping()}
    </>
  );
}

type BreadcrumbsProps = {
  source: Tables<'sources'>;
  site: Tables<'sites'>;
  parent?: Tables<'sites'>;
};

function Breadcrumbs({ source, site, parent }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbLink href="/sites">Sites</BreadcrumbLink>
        {parent && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbLink href={`/sites/${parent.id}`}>{parent.name}</BreadcrumbLink>{' '}
          </>
        )}

        <BreadcrumbSeparator />
        <BreadcrumbLink href={`/sites/${site.id}`}>{site.name}</BreadcrumbLink>
        <BreadcrumbSeparator />
        <BreadcrumbPage>{source.name}</BreadcrumbPage>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
