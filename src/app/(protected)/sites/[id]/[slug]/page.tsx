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
  searchParams: Promise<{ tab?: string; nav?: string; sub?: string }>;
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
        return <SophosParentMapping sourceId={params.slug} site={site} tab={searchParams.tab} />;
      case 'microsoft-365':
        return <MicrosoftParentMapping sourceId={params.slug} site={site} tab={searchParams.tab} />;
    }
  };

  const getSiteMapping = () => {
    switch (params.slug) {
      case 'sophos-partner':
        return <SophosSiteMapping sourceId={params.slug} site={site.data} tab={searchParams.tab} />;
      case 'microsoft-365':
        return (
          <MicrosoftSiteMapping sourceId={params.slug} site={site.data} tab={searchParams.tab} />
        );
    }
  };

  const renderContent = (type: string) => {
    if (type === 'parent') {
      return getParentMapping(site.data);
    } else {
      return getSiteMapping();
    }
  };

  if (site.data.parent_id) {
    const parent = await getSite(site.data.parent_id);

    if (!parent.ok) {
      return null;
    }

    return renderContent('site');
  }

  if (site.data.is_parent && searchParams.sub === 'aggregated') {
    return renderContent('parent');
  }

  return renderContent('site');
}
