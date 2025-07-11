'use client';

import Loader from '@/components/common/Loader';
import { useAsync } from '@/hooks/common/useAsync';
import { getSourceIntegrationsView } from '@/services/integrations';

export default function Home() {
  const {
    data: { integrations },
    isLoading,
  } = useAsync({
    initial: { integrations: [] },
    fetcher: async () => {
      const integrations = await getSourceIntegrationsView();
      if (!integrations.ok) {
        throw integrations.error.message;
      }

      return {
        integrations: integrations.data,
      };
    },
    deps: [],
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4">
      {integrations.map((integration) => {
        return (
          <div key={integration.id} className="flex flex-col gap-4">
            <h1>{integration.source_name}</h1>
          </div>
        );
      })}
    </div>
  );
}
