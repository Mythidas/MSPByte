'use server';

import SyncChain from '@/core/SyncChain';
import { tables } from '@/db';
import { deleteRows, getRow, getRows, updateRow } from '@/db/orm';
import fetchExternal from '@/integrations/microsoft/sync/fetchExternal';
import { syncMetrics } from '@/integrations/microsoft/sync/syncMetrics';
import { transformGroups } from '@/integrations/microsoft/transforms/groups';
import { transformIdentities } from '@/integrations/microsoft/transforms/identities';
import { transformLicenses } from '@/integrations/microsoft/transforms/licenses';
import { transformPolicies } from '@/integrations/microsoft/transforms/policies';
import { transformRoles } from '@/integrations/microsoft/transforms/roles';
import Async from '@/shared/lib/Async';
import Debug from '@/shared/lib/Debug';
import { Tables } from '@/types/db';

export async function siteSyncChain(job: Tables<'source', 'sync_jobs'>) {
  const tenantResult = await getRow('source', 'tenants', {
    filters: [
      ['source_id', 'eq', job.source_id],
      ['site_id', 'eq', job.site_id],
    ],
  });
  if (tenantResult.error) {
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
      if (!result.error) ctx.setState('users', result.data.cursor);
      return result;
    })
    .step(
      'Transform External',
      async (
        _ctx,
        { subscribedSkus, caPolicies, securityDefaults, users, activity, roles, groups }
      ) => {
        const skus = subscribedSkus.map((sku) => sku.skuPartNumber);
        const licenseInfo = await getRows('source', 'license_info', {
          filters: [['sku', 'in', skus]],
        });

        const transformedRoles = transformRoles(roles, tenant);
        const transformedGroups = transformGroups(groups, tenant);
        const transformedPolicies = transformPolicies(caPolicies, tenant);
        const transformedLicenses = transformLicenses(
          subscribedSkus,
          tenant,
          !licenseInfo.error ? licenseInfo.data.rows : []
        );
        const transformedUsers = await transformIdentities(
          users,
          subscribedSkus,
          caPolicies,
          securityDefaults,
          activity,
          tenant
        );
        if (transformedUsers.error) {
          throw 'Failed to transform external users';
        }

        console.log(transformedRoles.length);
        return {
          data: {
            transformedUsers: transformedUsers.data,
            transformedLicenses,
            transformedPolicies,
            transformedRoles,
            transformedGroups,
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
        {
          transformedUsers,
          transformedPolicies,
          transformedLicenses,
          transformedRoles,
          transformedGroups,
          securityDefaults,
          caPolicies,
        }
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
            'Microsoft365'
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
            'Microsoft365'
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
          tables.sync(
            'source',
            'roles',
            ctx.job,
            transformedRoles,
            [
              ['source_id', 'eq', ctx.job.source_id],
              ['site_id', 'eq', ctx.job.site_id!],
            ],
            'external_id',
            'id',
            'Microsoft365'
          ),
          tables.sync(
            'source',
            'groups',
            ctx.job,
            transformedGroups,
            [
              ['source_id', 'eq', ctx.job.source_id],
              ['site_id', 'eq', ctx.job.site_id!],
            ],
            'external_id',
            'id',
            'Microsoft365'
          ),
        ];

        const { error } = await Async.all(promises);
        if (error) throw error.message;

        return {
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
      const { data, error } = await Async.all([
        getRows('source', 'identities', {
          filters: [
            ['source_id', 'eq', ctx.job.source_id],
            ['site_id', 'eq', ctx.job.site_id],
          ],
        }),
      ]);

      if (error) throw error.message;
      const [identities] = data;

      const identitiesToDelete = identities.rows
        .filter((id) => id.sync_id && id.sync_id !== ctx.job.id)
        .map((id) => id.id);

      await deleteRows('source', 'identities', {
        filters: [['id', 'in', identitiesToDelete]],
      });

      const _identities = identities.rows.filter((id) => !identitiesToDelete.includes(id.id));
      await syncMetrics(tenant, _identities);
    });

  return await sync.run();
}
