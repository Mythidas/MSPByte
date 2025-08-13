'use server';

import SyncChain from '@/core/SyncChain';
import { getRow, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import { getActiveCompanies } from '@/integrations/autotask/services/companies';
import transformCompanies from '@/integrations/autotask/transforms/companies';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';
import { tables } from '@/db';
import { getActiveServices } from '@/integrations/autotask/services/services';
import transformServices from '@/integrations/autotask/transforms/services';
import { getActiveContracts } from '@/integrations/autotask/services/contracts';

export async function globalSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const integration = await getRow('public', 'integrations', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['tenant_id', 'eq', job.tenant_id],
    ],
  });
  if (integration.error) {
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
      const promises = await Promise.all([
        getActiveCompanies(config),
        getActiveServices(config),
        getActiveContracts(config),
      ]);
      for (const promise of promises) {
        if (promise.error) throw promise.error.message;
      }

      return {
        data: {
          companies: promises[0].data!,
          services: promises[1].data!,
          contracts: promises[2].data!,
        },
      };
    })
    .step('Transforms', async (_ctx, { companies, services }) => {
      const transformedCompanies = transformCompanies(companies, job);
      const transformedServices = transformServices(services, job);
      return {
        data: {
          companies: transformedCompanies,
          services: transformedServices,
        },
      };
    })
    .step('Sync Data', async (ctx, { companies, services }) => {
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
        tables.sync(
          'source',
          'services',
          ctx.job,
          services,
          [['source_id', 'eq', ctx.job.source_id]],
          'external_id',
          'id',
          'AutoTask'
        ),
      ];

      const [syncCompanies, syncServices] = await Promise.all(promises);
      if (syncCompanies.error) throw syncCompanies.error.message;
      if (syncServices.error) throw syncServices.error.message;

      return {
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
