import { Tables } from '@/db/schema';
import {
  getSubscribedSku,
  getConditionalAccessPolicies,
  getSecurityDefaultsEnabled,
} from '@/integrations/microsoft/services/identity';
import { getUsers } from '@/integrations/microsoft/services/users';
import { syncIdentities } from '@/integrations/microsoft/sync/syncIdentities';
import { syncMetrics } from '@/integrations/microsoft/sync/syncMetrics';
import { syncPolicies } from '@/integrations/microsoft/sync/syncPolicices';
import { transformIdentities } from '@/integrations/microsoft/transforms/identities';
import { transformPolicies } from '@/integrations/microsoft/transforms/policies';
import { Debug, Timer } from '@/lib/utils';
import { updateSourceTenant } from '@/services/source/tenants';
import { APIResponse } from '@/types';

export async function syncTenant(tenant: Tables<'source_tenants'>): Promise<APIResponse<null>> {
  const timer = new Timer('MicrosoftSyncMapping', true);
  try {
    timer.begin('fetchExternal');
    const subscribedSkus = await getSubscribedSku(tenant);
    const caPolicies = await getConditionalAccessPolicies(tenant);
    const securityDefaults = await getSecurityDefaultsEnabled(tenant);
    if (!subscribedSkus.ok || !caPolicies.ok || !securityDefaults.ok) {
      throw new Error('Failed to fetch external data.');
    }

    const users = await getUsers(tenant, subscribedSkus.data);
    if (!users.ok) {
      throw new Error('Failed to fetch data.');
    }
    timer.end('fetchExternal');

    timer.begin('transforms');
    const transformedPolicies = transformPolicies(caPolicies.data, tenant);
    const transformedUsers = await transformIdentities(
      users.data,
      subscribedSkus.data,
      caPolicies.data,
      securityDefaults.data,
      tenant
    );
    if (!transformedUsers.ok) {
      throw new Error('Failed to transform users');
    }
    timer.end('transforms');

    timer.begin('syncData');
    const policies = await syncPolicies(tenant, transformedPolicies);
    const identities = await syncIdentities(tenant, transformedUsers.data);
    if (!policies.ok || !identities.ok) {
      throw new Error('Failed to sync data');
    }
    timer.end('syncData');

    timer.begin('syncMetrics');
    const metrics = await syncMetrics(tenant, policies.data, [], identities.data);
    if (!metrics.ok) {
      throw new Error(metrics.error.message);
    }
    timer.end('syncMetrics');

    timer.begin('updateTenant');
    await updateSourceTenant(tenant.id, {
      ...tenant,
      last_sync: new Date().toISOString(),
      metadata: {
        ...(tenant.metadata as any),
        mfa_enforcement: securityDefaults.data
          ? 'security_defaults'
          : caPolicies.data.length > 0
            ? 'conditional_access'
            : 'none',
      },
    });
    timer.end('updateTenant');

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'syncMapping',
      message: String(err),
      time: new Date(),
    });
  } finally {
    timer.summary();
  }
}
