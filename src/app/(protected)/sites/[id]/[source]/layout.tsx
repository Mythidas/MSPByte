'use client';

import IntegrationHeader from '@/components/source/integrations/IntegrationHeader';
import IntegrationTabs from '@/components/source/integrations/IntegrationTabs';
import { useSite } from '@/lib/providers/SiteContext';
import { useParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const site = useSite();
  const { source } = useParams();

  if (!site) {
    return <strong>No site found. Please refresh.</strong>;
  }

  return (
    <div className="flex flex-col size-full gap-4">
      <IntegrationHeader sourceId={source as string} siteId={site.id} tenantId={site.tenant_id} />
      {children}
    </div>
  );
}
