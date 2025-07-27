'use client';

import IntegrationHeader from '@/components/source/integrations/IntegrationHeader';
import { useUser } from '@/lib/providers/UserContext';
import { useParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { source, slug } = useParams();
  const { user } = useUser();

  return (
    <div className="flex flex-col size-full gap-4">
      <IntegrationHeader
        sourceId={source as string}
        tenantId={user?.tenant_id || ''}
        groupId={slug as string}
      />
      {children}
    </div>
  );
}
