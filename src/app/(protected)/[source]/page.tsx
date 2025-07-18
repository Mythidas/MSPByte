'use client';

import MicrosoftGlobalMapping from '@/components/source/integrations/microsoft/mappings/MicrosoftGlobalMapping';
import SophosGlobalMapping from '@/components/source/integrations/sophos/mappings/SophosGlobalMapping';
import { useSearchParams } from 'next/navigation';
import { useSource } from '@/lib/providers/SourceContext';

export default function Page() {
  const { source } = useSource();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || undefined;

  if (!source) {
    return <strong>No source selected.</strong>;
  }

  const getMappingComponent = () => {
    switch (source.source_id) {
      case 'sophos-partner':
        return <SophosGlobalMapping sourceId={source.source_id} tab={tab} />;
      case 'microsoft-365':
        return <MicrosoftGlobalMapping sourceId={source.source_id} tab={tab} />;
    }
  };

  return getMappingComponent();
}
