'use server';

import SyncChain from '@/core/SyncChain';
import { getRow, getRows, updateRow } from '@/db/orm';
import { Tables } from '@/types/db';
import { getActiveCompanies } from '@/integrations/autotask/services/companies';
import transformCompanies from '@/integrations/autotask/transforms/companies';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';
import { tables } from '@/db';
import { getActiveServices } from '@/integrations/autotask/services/services';
import transformServices from '@/integrations/autotask/transforms/services';
import { getActiveContracts } from '@/integrations/autotask/services/contracts';
import {
  transformContracts,
  transformContractServices,
} from '@/integrations/autotask/transforms/contracts';

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
    .step('Fetch', async () => {
      const promises = await Promise.all([
        getActiveCompanies(config),
        getActiveServices(config),
        getActiveContracts(config),
        getRows('source', 'tenants', { filters: [['source_id', 'eq', job.source_id]] }),
      ]);
      for (const promise of promises) {
        if (promise.error) throw promise.error.message;
      }

      return {
        data: {
          companies: promises[0].data!,
          services: promises[1].data!,
          contracts: promises[2].data!,
          tenants: promises[3].data!.rows,
        },
      };
    })
    .step('Transforms', async (_ctx, { companies, services, contracts, tenants }) => {
      const transformedCompanies = transformCompanies(companies, job);
      const transformedServices = transformServices(services, job);
      const transformedContracts = transformContracts(contracts, tenants, job);
      const transformedContractItems = await transformContractServices(
        config,
        services,
        contracts,
        tenants,
        job
      );
      if (transformedContractItems.error) {
        throw transformedContractItems.error.message;
      }

      for (const contract of transformedContracts) {
        const services = transformedContractItems.data.filter(
          (s) => s.external_contract_id === contract.external_id
        );

        contract.revenue = services.reduce((total, service) => {
          const units = Number(service.quantity) || 0;
          const price = Number(service.unit_price) || 0;
          return total + units * price;
        }, 0);
      }

      return {
        data: {
          companies: transformedCompanies,
          services: transformedServices,
          contracts: transformedContracts,
          contractItems: transformedContractItems.data,
        },
      };
    })
    .step('Sync Data', async (ctx, { companies, services, contracts, contractItems }) => {
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
        tables.sync(
          'source',
          'contracts',
          ctx.job,
          contracts,
          [['source_id', 'eq', ctx.job.source_id]],
          'external_id',
          'id',
          'AutoTask'
        ),
        tables.sync(
          'source',
          'contract_items',
          ctx.job,
          contractItems,
          [['source_id', 'eq', ctx.job.source_id]],
          'external_id',
          'id',
          'AutoTask'
        ),
      ];

      const results = await Promise.all(promises);
      for (const promise of results) {
        if (promise.error) throw promise.error.message;
      }

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
