'use server';

import SyncChain from '@/core/SyncChain';
import { tables } from '@/db';
import { deleteRows, getRow, getRows, updateRow } from '@/db/orm';
import fetchExternal from '@/integrations/microsoft/sync/fetchExternal';
import { syncMetrics } from '@/integrations/microsoft/sync/syncMetrics';
import { transformIdentities } from '@/integrations/microsoft/transforms/identities';
import { transformLicenses } from '@/integrations/microsoft/transforms/licenses';
import { transformPolicies } from '@/integrations/microsoft/transforms/policies';
import { Debug } from '@/lib/utils';
import { Tables } from '@/types/db';

export async function siteSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const tenantResult = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['site_id', 'eq', job.site_id],
    ],
  });
  if (!tenantResult.ok) {
    throw 'No source tenant found';
  }
  const { data: tenant } = tenantResult;

  const sync = new SyncChain({
    tenant_id: tenant.id,
    state: job.state as Record<string, string | null>,
    job,
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
        const licenseInfo = await getRows('source', 'license_info', {
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
        const promises = [
          tables.sync(
            'source',
            'policies',
            ctx.job,
            transformedPolicies,
            [
              ['source_id', 'eq', ctx.job.source_id],
              ['site_id', 'eq', ctx.job.site_id!],
            ],
            'external_id',
            'id',
            'Microsoft365',
            false
          ),
          tables.sync(
            'source',
            'licenses',
            ctx.job,
            transformedLicenses,
            [
              ['source_id', 'eq', ctx.job.source_id],
              ['site_id', 'eq', ctx.job.site_id!],
            ],
            'external_id',
            'id',
            'Microsoft365',
            false
          ),
          tables.sync(
            'source',
            'identities',
            ctx.job,
            transformedUsers,
            [
              ['source_id', 'eq', ctx.job.source_id],
              ['site_id', 'eq', ctx.job.site_id!],
            ],
            'external_id',
            'id',
            'Microsoft365',
            false
          ),
        ];

        const [policies, licenses, identities] = await Promise.all(promises);
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
      return await updateRow('source', 'tenants', {
        id: ctx.tenant_id,
        row: {
          metadata: {
            ...(tenant.metadata as any),
            mfa_enforcement: securityDefaults
              ? 'security_defaults'
              : caPolicies.length > 0
                ? 'conditional_access'
                : 'none',
          },
        },
      });
    })
    .final(async (ctx) => {
      const [policies, identities, licenses] = await Promise.all([
        getRows('source', 'policies', {
          filters: [
            ['source_id', 'eq', ctx.job.source_id],
            ['site_id', 'eq', ctx.job.site_id],
          ],
        }),
        getRows('source', 'identities', {
          filters: [
            ['source_id', 'eq', ctx.job.source_id],
            ['site_id', 'eq', ctx.job.site_id],
          ],
        }),
        getRows('source', 'licenses', {
          filters: [
            ['source_id', 'eq', ctx.job.source_id],
            ['site_id', 'eq', ctx.job.site_id],
          ],
        }),
      ]);

      if (!policies.ok || !identities.ok || !licenses.ok) return;

      const identitiesToDelete = identities.data.rows
        .filter((id) => id.sync_id && id.sync_id !== ctx.job.id)
        .map((id) => id.id);
      const policicesToDelete = policies.data.rows
        .filter((pol) => pol.sync_id && pol.sync_id !== ctx.job.id)
        .map((pol) => pol.id);
      const licensesToDelete = licenses.data.rows
        .filter((lic) => lic.sync_id && lic.sync_id !== ctx.job.id)
        .map((lic) => lic.id);

      await deleteRows('source', 'identities', {
        filters: [['id', 'in', identitiesToDelete]],
      });
      await deleteRows('source', 'policies', {
        filters: [['id', 'in', policicesToDelete]],
      });
      await deleteRows('source', 'licenses', {
        filters: [['id', 'in', licensesToDelete]],
      });

      const _identities = identities.data.rows.filter((id) => !identitiesToDelete.includes(id.id));
      await syncMetrics(tenant, _identities);
    });

  return await sync.run();
}
