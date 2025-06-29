'use client';

import { CardHeader } from '@/components/ui/card';
import RouteCard from '@/components/ux/RouteCard';
import { Spinner } from '@/components/ux/Spinner';
import { Tables } from '@/db/schema';
import { getSourceIntegrationsView } from '@/services/integrations';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  route: string;
};

export default function SourcesTable({ route }: Props) {
  const [integrations, setIntegrations] = useState<Tables<'source_integrations_view'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);

        const integrations = await getSourceIntegrationsView();

        if (!integrations.ok) {
          throw new Error();
        }

        setIntegrations(integrations.data);
      } catch {
        toast.error('Failed to load data. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="flex flex-col gap-4 size-full">
      <h1 className="text-2xl font-bold">Sources</h1>
      {isLoading && (
        <div className="flex size-full justify-center items-center">
          <Spinner size={48} />
        </div>
      )}
      {!isLoading && (
        <div className="grid grid-cols-4 gap-2">
          {integrations.map((integration) => {
            return (
              <RouteCard
                key={integration.id}
                route={`${route}/${integration.source_slug}`}
                module="Sources"
                level="Read"
              >
                <CardHeader className="text-center">{integration.source_name}</CardHeader>
              </RouteCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
