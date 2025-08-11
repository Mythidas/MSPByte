'use server';

import SyncChain from '@/core/SyncChain';
import { getRow, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import { getActiveCompanies } from '@/integrations/autotask/services/companies';
import transformCompanies from '@/integrations/autotask/transforms/companies';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';
import { tables } from '@/db';

export async function globalSyncChain(job: Tables<'public', 'source_sync_jobs'>) {
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
      const [companies] = await Promise.all([await getActiveCompanies(config)]);
      if (!companies.ok) throw companies.error.message;

      return {
        ok: true,
        data: {
          companies: companies.data,
        },
      };
    })
    .step('Transforms', async (_ctx, { companies }) => {
      const transformedCompanies = transformCompanies(companies, job);
      return {
        ok: true,
        data: {
          companies: transformedCompanies,
        },
      };
    })
    .step('Sync Data', async (ctx, { companies }) => {
      const promises = [
        tables.sync(
          'source',
          'sites',
          ctx.job,
          companies,
          [['source_id', 'eq', ctx.job.source_id]],
          'external_id',
          'id',
          'AutoTask'
        ),
      ];

      const [syncCompanies] = await Promise.all(promises);
      if (!syncCompanies.ok) throw syncCompanies.error.message;

      return {
        ok: true,
        data: null,
      };
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
