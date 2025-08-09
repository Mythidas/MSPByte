'use server';

import SyncChain from '@/core/SyncChain';
import { getRow, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import { getActiveCompanies } from '@/integrations/autotask/services/companies';
import { syncCompanies } from '@/integrations/autotask/sync/syncCompanies';
import transformCompanies from '@/integrations/autotask/transforms/companies';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';

export async function globalSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const integration = await getRow('public', 'integrations', {
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
  })
    .step('Fetch External', async () => {
      const results = await getActiveCompanies(config);
      return results;
    })
    .step('Transforms', async (_ctx, companies) => {
      const transformedCompanies = transformCompanies(companies, job);
      return {
        ok: true,
        data: transformedCompanies,
      };
    })
    .step('Sync Data', async (_ctx, companies) => {
      const results = await syncCompanies(job, companies);
      return results;
    })
    .final(async () => {
      await updateRow('public', 'integrations', {
        id: integration.data.id,
        row: {
          last_sync_at: new Date().toISOString(),
        },
      });
    });

  return await sync.run();
}
