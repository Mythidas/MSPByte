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
      const [companies, services] = await Promise.all([
        getActiveCompanies(config),
        getActiveServices(config),
      ]);
      if (!companies.ok) throw companies.error.message;
      if (!services.ok) throw services.error.message;

      return {
        ok: true,
        data: {
          companies: companies.data,
          services: services.data,
        },
      };
    })
    .step('Transforms', async (_ctx, { companies, services }) => {
      const transformedCompanies = transformCompanies(companies, job);
      const transformedServices = transformServices(services, job);
      return {
        ok: true,
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
      if (!syncCompanies.ok) throw syncCompanies.error.message;
      if (!syncServices.ok) throw syncServices.error.message;

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
