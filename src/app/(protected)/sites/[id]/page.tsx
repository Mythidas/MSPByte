'use client';

import { getSite } from 'packages/services/sites';
import MicrosoftSiteMapping from '@/components/source/integrations/microsoft/mappings/MicrosoftSiteMapping';
import SophosSiteMapping from '@/components/source/integrations/sophos/mappings/SophosSiteMapping';
import { useParams, useSearchParams } from 'next/navigation';
import { useSource } from '@/lib/providers/SourceContext';
import Loader from '@/components/shared/Loader';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';

export default function Page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { source } = useSource();
  const tab = searchParams.get('tab') || undefined;

  const { content } = useLazyLoad({
    fetcher: async () => {
      const site = await getSite(params['id'] as string);
      if (site.ok) return site.data;
    },
    render: (site) => {
      if (!site) return <strong>Failed to fetch data. Please refresh.</strong>;

      switch (source?.source_id) {
        case 'sophos-partner':
          return <SophosSiteMapping sourceId={source.source_id} site={site} tab={tab} />;
        case 'microsoft-365':
          return <MicrosoftSiteMapping sourceId={source.source_id} site={site} tab={tab} />;
        default:
          return <strong>No source mapping created.</strong>;
      }
    },
    skeleton: () => <Loader />,
  });

  return content;
}
