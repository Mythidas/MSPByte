'use server';

import SyncChain from '@/core/SyncChain';
import { getRow } from '@/db/orm';
import { Tables } from '@/db/schema';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';

export async function siteSyncChain(job: Tables<'source_sync_jobs'>) {
  const integration = await getRow('source_integrations', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['tenant_id', 'eq', job.tenant_id],
    ],
  });
  if (!integration.ok) {
    throw 'Failed to find source integration';
  }
  const config = integration.data.config as AutoTaskIntegrationConfig;

  const sync = new SyncChain({
    tenant_id: '',
    state: job.state as Record<string, string | null>,
    job,
    getState: () => '',
    setState: () => {},
  });

  config.client_id;
  return await sync.run();
}
