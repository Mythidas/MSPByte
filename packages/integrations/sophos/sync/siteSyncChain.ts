'use server';

import SyncChain from '@/core/SyncChain';
import { Tables } from '@/types/db';
import { getToken } from '@/integrations/sophos/auth';
import { syncMetrics } from '@/integrations/sophos/sync/syncMetrics';
import { transformDevices } from '@/integrations/sophos/transforms/devices';
import { tables } from '@/db';
import { getRow, getRows, insertRows } from '@/db/orm';
import { getEndpoints } from '@/integrations/sophos/services/endpoints/getEndpoints';
import { getHealthCheck } from '@/integrations/sophos/services/health';
import { transformTenantHealth } from '@/integrations/sophos/transforms/health';
import { getFirewalls } from '@/integrations/sophos/services/firewall';

export async function siteSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const tenantResult = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['site_id', 'eq', job.site_id],
    ],
  });
  const integrationResult = await getRow('public', 'integrations', {
    filters: [['source_id', 'eq', job.source_id]],
  });
  if (tenantResult.error || integrationResult.error) return;
  const { data: tenant } = tenantResult;
  const { data: integration } = integrationResult;

  const tokenResult = await getToken(integration);
  if (tokenResult.error) {
    throw new Error(tokenResult.error.message);
  }
  const { data: token } = tokenResult;

  const sync = new SyncChain({
    tenant_id: tenant.id,
    state: job.state as Record<string, string | null>,
    job: job,
    getState: () => '',
    setState: () => {},
  })
    .step('Fetch External', async () => {
      const promises = await Promise.all([
        getEndpoints(token, tenant),
        getHealthCheck(token, tenant),
        getFirewalls(token, tenant),
      ]);

      for (const promise of promises) {
        if (promise.error) throw promise.error.message;
      }

      const [endpoints, healthCheck, firewalls] = promises;

      return {
        error: undefined,
        data: {
          endpoints: endpoints.data!,
          healthCheck: healthCheck.data!,
          firewalls: firewalls.data!,
        },
      };
    })
    .step('Transform External', async (_ctx, { endpoints, healthCheck, firewalls }) => {
      const transformedDevices = transformDevices(tenant, endpoints, firewalls);
      const transformedHealthCheck = transformTenantHealth(tenant, healthCheck);
      return {
        data: { transformedDevices, transformedHealthCheck },
      };
    })
    .step('Sync Data', async (ctx, { transformedDevices, transformedHealthCheck }) => {
      const promises = await Promise.all([
        tables.sync(
          'source',
          'devices',
          ctx.job,
          transformedDevices,
          [
            ['source_id', 'eq', job.source_id],
            ['site_id', 'eq', job.site_id],
          ],
          'external_id',
          'id',
          'SophosPartner'
        ),
        insertRows('source', 'tenant_health', {
          rows: [{ ...transformedHealthCheck, sync_id: ctx.job.id }],
        }),
      ]);

      for (const promise of promises) {
        if (promise.error) throw promise.error.message;
      }
      return {
        data: undefined,
      };
    })
    .final(async (ctx) => {
      const devices = await getRows('source', 'devices', {
        filters: [
          ['source_id', 'eq', ctx.job.source_id],
          ['site_id', 'eq', ctx.job.site_id],
        ],
      });
      if (devices.error) return;

      await syncMetrics(tenant, devices.data.rows);
    });

  return await sync.run();
}
