'use server';

import SyncChain from '@/core/SyncChain';
import { Tables } from '@/db/schema';
import { getToken } from '@/integrations/sophos/auth';
import { getEndpoints } from '@/integrations/sophos/services/endpoints';
import { syncDevices } from '@/integrations/sophos/sync/syncDevices';
import { syncMetrics } from '@/integrations/sophos/sync/syncMetrics';
import { transformDevices } from '@/integrations/sophos/transforms/devices';
import { Debug } from '@/lib/utils';
import { getSourceDevices } from '@/services/devices';
import { getSourceIntegration } from '@/services/integrations';
import { getSourceTenant } from '@/services/source/tenants';

export async function syncSophosPartner(job: Tables<'source_sync_jobs'>) {
  const tenantResult = await getSourceTenant(job.source_id, job.site_id);
  const integrationResult = await getSourceIntegration(undefined, job.source_id);
  if (!tenantResult.ok || !integrationResult.ok) return;
  const { data: tenant } = tenantResult;
  const { data: integration } = integrationResult;

  const tokenResult = await getToken(integration);
  if (!tokenResult.ok) {
    throw new Error(tokenResult.error.message);
  }
  const { data: token } = tokenResult;

  const sync = new SyncChain({
    tenant_id: tenant.id,
    state: job.state as Record<string, string | null>,
    sync_id: job.id,
    source_id: job.source_id,
    site_id: job.site_id,
    getState: () => '',
    setState: () => {},
  })
    .step('Fetch External', async () => {
      const endpoints = await getEndpoints(token, tenant);

      if (!endpoints.ok) {
        return Debug.error({
          module: 'SophosPartner',
          context: 'Fetch External',
          message: 'Failed to fetch external data',
          time: new Date(),
        });
      }

      return {
        ok: true,
        data: { endpoints: endpoints.data },
      };
    })
    .step('Transform External', async (_ctx, { endpoints }) => {
      const transformedDevices = transformDevices(tenant, endpoints);
      return {
        ok: true,
        data: { transformedDevices },
      };
    })
    .step('Sync Data', async (_ctx, { transformedDevices }) => {
      const devices = await syncDevices(tenant, transformedDevices);
      if (!devices.ok) {
        return Debug.error({
          module: 'SophosPartner',
          context: 'Sync Data',
          message: 'Failed to sync data',
          time: new Date(),
        });
      }

      return {
        ok: true,
        data: null,
      };
    })
    .final(async (ctx) => {
      const devices = await getSourceDevices(ctx.source_id, [ctx.site_id]);
      if (!devices.ok) return;

      await syncMetrics(tenant, devices.data.rows);
    });
}
