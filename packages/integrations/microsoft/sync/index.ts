'use server';

import SyncChain from '@/core/SyncChain';
import { Tables } from '@/db/schema';
import {
  getSubscribedSku,
  getConditionalAccessPolicies,
  getSecurityDefaultsEnabled,
} from '@/integrations/microsoft/services/identity';
import { getUsers } from '@/integrations/microsoft/services/users';
import fetchExternal from '@/integrations/microsoft/sync/fetchExternal';
import { syncIdentities } from '@/integrations/microsoft/sync/syncIdentities';
import { syncMetrics } from '@/integrations/microsoft/sync/syncMetrics';
import { syncPolicies } from '@/integrations/microsoft/sync/syncPolicices';
import { syncTenant } from '@/integrations/microsoft/sync/syncTenant';
import { transformIdentities } from '@/integrations/microsoft/transforms/identities';
import { transformPolicies } from '@/integrations/microsoft/transforms/policies';
import { Debug, Timer } from '@/lib/utils';
import { getSourceIdentities } from '@/services/identities';
import { getSourcePolicies } from '@/services/policies';
import { getSourceTenant } from '@/services/source/tenants';
import { APIResponse } from '@/types';

export async function _syncMicrosoft365(
  integration: Tables<'source_integrations'>,
  siteId: string
): Promise<APIResponse<null>> {
  try {
    const timer = new Timer('Microsoft365Sync');
    const tenant = await getSourceTenant(integration.source_id!, siteId);
    if (!tenant.ok) {
      throw new Error(tenant.error.message);
    }

    const result = await syncTenant(tenant.data);
    if (!result.ok) throw result.error.message;

    timer.summary();

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'syncMicrosoft365',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function syncMicrosoft365(job: Tables<'source_sync_jobs'>) {
  const tenantResult = await getSourceTenant(job.source_id, job.site_id);
  if (!tenantResult.ok) return;
  const { data: tenant } = tenantResult;

  const sync = new SyncChain({
    tenant_id: tenant.id,
    state: job.state as Record<string, string | null>,
    sync_id: job.id,
    source_id: job.source_id,
    site_id: job.site_id,
  })
    .step('Fetch External', async () => {
      return await fetchExternal(tenant);
    })
    .step(
      'Transform External',
      async (_ctx, { subscribedSkus, caPolicies, securityDefaults, users }) => {
        const transformedPolicies = transformPolicies(caPolicies, tenant);
        const transformedUsers = await transformIdentities(
          users,
          subscribedSkus,
          caPolicies,
          securityDefaults,
          tenant
        );
        if (!transformedUsers.ok) {
          return Debug.error({
            module: 'Microsoft365',
            context: 'Transform External',
            message: 'Failed to transform external users',
            time: new Date(),
          });
        }

        return {
          ok: true,
          data: { transformedUsers: transformedUsers.data, transformedPolicies },
        };
      }
    )
    .step('Sync Data', async (_ctx, { transformedUsers, transformedPolicies }) => {
      const policies = await syncPolicies(tenant, transformedPolicies);
      const identities = await syncIdentities(tenant, transformedUsers);
      if (!policies.ok || !identities.ok) {
        return Debug.error({
          module: 'Microsoft365',
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
      const [policies, identities] = await Promise.all([
        await getSourcePolicies(ctx.source_id, [ctx.site_id]),
        await getSourceIdentities(ctx.source_id, [ctx.site_id]),
      ]);

      if (!policies.ok || !identities.ok) return;

      await syncMetrics(tenant, policies.data.rows, [], identities.data.rows);
    });

  return await sync.run();
}
