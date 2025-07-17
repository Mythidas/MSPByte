'use client';

import { getSite } from 'packages/services/sites';
import { useParams, useSearchParams } from 'next/navigation';
import { useSource } from '@/lib/providers/SourceContext';
import Loader from '@/components/common/Loader';
import { useLazyLoad } from '@/hooks/common/useLazyLoad';
import SophosParentMapping from '@/components/domains/sophos/mappings/SophosParentMapping';
import MicrosoftParentMapping from '@/components/domains/microsoft/mappings/MicrosoftParentMapping';

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
          return <SophosParentMapping sourceId={source.source_id} site={site} tab={tab} />;
        case 'microsoft-365':
          return <MicrosoftParentMapping sourceId={source.source_id} site={site} tab={tab} />;
        default:
          return <strong>No source mapping created.</strong>;
      }
    },
    skeleton: () => <Loader />,
  });

  return content;
}
