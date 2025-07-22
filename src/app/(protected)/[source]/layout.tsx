'use client';

import Loader from '@/components/shared/Loader';
import IntegrationHeader from '@/components/source/integrations/IntegrationHeader';
import { useUser } from '@/lib/providers/UserContext';
import { useParams } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { source } = useParams();
  const { user, isLoading } = useUser();

  if (isLoading) return <Loader />;
  if (!user) return <strong>No user found. Please refresh.</strong>;

  return (
    <div className="flex flex-col size-full gap-4">
      <IntegrationHeader sourceId={source as string} tenantId={user.tenant_id!} />
      {children}
    </div>
  );
}
