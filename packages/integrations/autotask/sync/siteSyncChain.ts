'use server';

import SyncChain from '@/core/SyncChain';
import { getRow } from '@/db/orm';
import { Tables } from '@/db/schema';
import {
  getActiveContracts,
  getContractServices,
} from '@/integrations/autotask/services/contracts';
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
  }).step('Fetch External', async () => {
    const contracts = await getActiveContracts(config, '');
    if (!contracts.ok) throw contracts.error.message;

    const services = await Promise.all(
      contracts.data.map((c) => getContractServices(config, c.id.toString()))
    );
    if (services.every((s) => s.ok)) {
      return {
        ok: true,
        data: {
          contracts: contracts.data,
          services: services.map((s) => s.data),
        },
      };
    }

    throw 'Failed to fetch all services';
  });

  return await sync.run();
}
