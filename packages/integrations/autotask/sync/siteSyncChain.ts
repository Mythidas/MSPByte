'use server';

import SyncChain from '@/core/SyncChain';
import { getRow, insertRows } from '@/db/orm';
import {
  getActiveContracts,
  getContractServices,
  getContractServiceUnits,
} from '@/integrations/autotask/services/contracts';
import {
  transformContracts,
  transformContractServices,
} from '@/integrations/autotask/transforms/contracts';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';
import { Tables } from '@/types/db';

export async function siteSyncChain(job: Tables<'public', 'source_sync_jobs'>) {
  const integration = await getRow('public', 'integrations', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['tenant_id', 'eq', job.tenant_id],
    ],
  });
  if (!integration.ok) {
    throw 'Failed to find source integration';
  }
  const tenant = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['site_id', 'eq', job.site_id],
    ],
  });
  if (!tenant.ok) throw 'Failed to find Source Tenant';
  const config = integration.data.config as AutoTaskIntegrationConfig;

  const sync = new SyncChain({
    tenant_id: '',
    state: job.state as Record<string, string | null>,
    job,
    getState: () => '',
    setState: () => {},
  })
    .step('Fetch External', async (ctx) => {
      const contracts = await getActiveContracts(config, tenant.data.external_id);
      if (!contracts.ok) throw contracts.error.message;

      const contractIds = contracts.data.map((c) => c.id.toString());
      const services = await getContractServices(config, contractIds);
      if (!services.ok) throw services.error.message;

      const units = await getContractServiceUnits(config, contractIds);
      if (!units.ok) throw units.error.message;

      return {
        ok: true,
        data: {
          contracts: contracts.data,
          services: services.data,
          serviceUnits: units.data,
        },
      };
    })
    .step('Transforms', async (ctx, { contracts, services, serviceUnits }) => {
      const transformedContracts = transformContracts(contracts, ctx.job);
      const transformedServices = transformContractServices(
        transformedContracts,
        services,
        serviceUnits,
        ctx.job
      );

      for (const contract of transformedContracts) {
        const services = transformedServices.filter((s) => s.contract_id === contract.id);

        contract.revenue = services.reduce((total, service) => {
          const units = Number(service.quantity) || 0;
          const price = Number(service.unit_price) || 0;
          return total + units * price;
        }, 0);
      }

      return {
        ok: true,
        data: {
          contracts: transformedContracts,
          services: transformedServices,
        },
      };
    })
    .step('Sync Data', async (ctx, { contracts, services }) => {
      const sourceContracts = await insertRows('source', 'contracts', {
        rows: contracts,
      });
      if (!sourceContracts.ok) throw sourceContracts.error.message;

      const sourceContractItems = await insertRows('source', 'contract_items', {
        rows: services,
      });
      if (!sourceContractItems.ok) throw sourceContractItems.error.message;

      return {
        ok: true,
        data: {
          contracts: sourceContracts.data,
          contractItems: sourceContractItems.data,
        },
      };
    });

  return await sync.run();
}
