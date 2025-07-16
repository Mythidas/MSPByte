'use client';

import MicrosoftSiteMapping from '@/components/domains/microsoft/mappings/MicrosoftSiteMapping';
import SophosSiteMapping from '@/components/domains/sophos/mappings/SophosSiteMapping';
import { useParams, useSearchParams } from 'next/navigation';
import { useSource } from '@/lib/providers/SourceContext';
import { useSites } from '@/lib/providers/SitesContext';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { source } = useSource();
  const tab = searchParams.get('tab') || undefined;
  const sites = useSites();
  const site = sites.find((site) => site.slug === params['id'] || site.id === params['id']);

  if (!site) {
    return <strong>Failed to fetch site. Please refresh.</strong>;
  }

  switch (source?.source_id) {
    case 'sophos-partner':
      return <SophosSiteMapping sourceId={source.source_id} site={site} tab={tab} />;
    case 'microsoft-365':
      return <MicrosoftSiteMapping sourceId={source.source_id} site={site} tab={tab} />;
    default:
      return <strong>No source mapping created.</strong>;
  }
}
