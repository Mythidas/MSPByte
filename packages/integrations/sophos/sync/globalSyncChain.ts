import SyncChain from '@/core/SyncChain';
import { tables } from '@/db';
import { getRow, getRows, updateRow } from '@/db/orm';
import { getToken } from '@/integrations/sophos/auth/getToken';
import { getFirewallLicenses } from '@/integrations/sophos/services/licenses';
import { getTenants } from '@/integrations/sophos/services/tenants';
import { transformLicenses } from '@/integrations/sophos/transforms/licenses';
import { transformSites } from '@/integrations/sophos/transforms/sites';
import Async from '@/shared/lib/Async';
import { Tables } from '@/types/db';

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
  const tokenResult = await getToken(integration.data);
  if (tokenResult.error) {
    throw new Error(tokenResult.error.message);
  }
  const { data: token } = tokenResult;

  const sync = new SyncChain({
    tenant_id: job.source_tenant_id!,
    state: job.state as Record<string, string | null>,
    job,
    getState: () => '',
    setState: () => {},
  })
    .step('Fetch External', async () => {
      const { data, error } = await Async.all([getTenants(token), getFirewallLicenses(token)]);

      if (error) {
        throw error.message;
      }
      const [tenants, licenses] = data;
      return {
        data: { tenants, licenses },
      };
    })
    .step('Fetch Internal', async (ctx, { tenants, licenses }) => {
      const sourceTenants = await getRows('source', 'tenants', {
        filters: [['source_id', 'eq', ctx.job.source_id]],
      });

      return {
        data: {
          tenants,
          licenses,
          sourceTenants: sourceTenants.data ? sourceTenants.data.rows : [],
        },
      };
    })
    .step('Transforms', async (_ctx, { tenants, licenses, sourceTenants }) => {
      const transformedSites = transformSites(integration.data, tenants);
      const transformedLicenses = transformLicenses(integration.data, sourceTenants, licenses);
      return {
        data: { sites: transformedSites, licenses: transformedLicenses },
      };
    })
    .step('Sync Data', async (ctx, { sites, licenses }) => {
      const { error } = await Async.all([
        tables.sync(
          'source',
          'sites',
          ctx.job,
          sites,
          [['source_id', 'eq', job.source_id]],
          'external_id',
          'id',
          'SophosPartner'
        ),
        tables.sync(
          'source',
          'licenses',
          ctx.job,
          licenses,
          [['source_id', 'eq', job.source_id]],
          'external_id',
          'id',
          'SophosPartner'
        ),
      ]);

      if (error) throw error.message;
      return { data: undefined };
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
