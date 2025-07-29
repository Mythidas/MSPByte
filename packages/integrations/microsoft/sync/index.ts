'use server';

import SyncChain from '@/core/SyncChain';
import { getRows } from '@/db/orm';
import { Tables } from '@/db/schema';
import fetchExternal from '@/integrations/microsoft/sync/fetchExternal';
import { syncIdentities } from '@/integrations/microsoft/sync/syncIdentities';
import { syncLicenses } from '@/integrations/microsoft/sync/syncLicenses';
import { syncMetrics } from '@/integrations/microsoft/sync/syncMetrics';
import { syncPolicies } from '@/integrations/microsoft/sync/syncPolicices';
import { transformIdentities } from '@/integrations/microsoft/transforms/identities';
import { transformLicenses } from '@/integrations/microsoft/transforms/licenses';
import { transformPolicies } from '@/integrations/microsoft/transforms/policies';
import { Debug } from '@/lib/utils';
import { deleteSourceIdentities, getSourceIdentities } from '@/services/identities';
import { deleteSourcePolicies, getSourcePolicies } from '@/services/policies';
import { getSourceTenant, updateSourceTenant } from '@/services/source/tenants';

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
    getState: () => '',
    setState: () => {},
  })
    .step('Fetch External', async (ctx) => {
      const result = await fetchExternal(tenant, ctx.getState('users'));
      if (result.ok) ctx.setState('users', result.data.cursor);
      return result;
    })
    .step(
      'Transform External',
      async (_ctx, { subscribedSkus, caPolicies, securityDefaults, users, activity }) => {
        const skus = subscribedSkus.map((sku) => sku.skuPartNumber);
        const licenseInfo = await getRows('source_license_info', {
          filters: [['sku', 'in', skus]],
        });

        const transformedPolicies = transformPolicies(caPolicies, tenant);
        const transformedLicenses = transformLicenses(
          subscribedSkus,
          tenant,
          licenseInfo.ok ? licenseInfo.data.rows : []
        );
        const transformedUsers = await transformIdentities(
          users,
          subscribedSkus,
          caPolicies,
          securityDefaults,
          activity,
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
          data: {
            transformedUsers: transformedUsers.data,
            transformedLicenses,
            transformedPolicies,
            securityDefaults,
            caPolicies,
          },
        };
      }
    )
    .step(
      'Sync Data',
      async (
        ctx,
        { transformedUsers, transformedPolicies, transformedLicenses, securityDefaults, caPolicies }
      ) => {
        const policies = await syncPolicies(tenant, transformedPolicies, ctx.sync_id);
        const licenses = await syncLicenses(tenant, transformedLicenses, ctx.sync_id);
        const identities = await syncIdentities(tenant, transformedUsers, ctx.sync_id);
        if (!policies.ok || !identities.ok || !licenses.ok) {
          return Debug.error({
            module: 'Microsoft365',
            context: 'Sync Data',
            message: 'Failed to sync data',
            time: new Date(),
          });
        }

        return {
          ok: true,
          data: {
            securityDefaults,
            caPolicies,
          },
        };
      }
    )
    .step('Update Tenant', async (ctx, { securityDefaults, caPolicies }) => {
      return await updateSourceTenant(ctx.tenant_id, {
        metadata: {
          ...(tenant.metadata as any),
          mfa_enforcement: securityDefaults
            ? 'security_defaults'
            : caPolicies.length > 0
              ? 'conditional_access'
              : 'none',
        },
      });
    })
    .final(async (ctx) => {
      const [policies, identities] = await Promise.all([
        await getSourcePolicies(ctx.source_id, [ctx.site_id]),
        await getSourceIdentities(ctx.source_id, [ctx.site_id]),
      ]);

      if (!policies.ok || !identities.ok) return;

      const identitiesToDelete = identities.data.rows
        .filter((id) => id.sync_id && id.sync_id !== ctx.sync_id)
        .map((id) => id.id);
      const policicesToDelete = policies.data.rows
        .filter((pol) => pol.sync_id && pol.sync_id !== ctx.sync_id)
        .map((pol) => pol.id);

      await deleteSourceIdentities(identitiesToDelete);
      await deleteSourcePolicies(policicesToDelete);

      const _identities = identities.data.rows.filter((id) => !identitiesToDelete.includes(id.id));
      const _policies = policies.data.rows.filter((pol) => !policicesToDelete.includes(pol.id));
      await syncMetrics(tenant, _policies, [], _identities);
    });

  return await sync.run();
}
