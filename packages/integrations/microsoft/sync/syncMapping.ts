import { Debug } from '@/lib/utils';
import { Tables } from 'packages/db/schema';
import {
  getConditionalAccessPolicies,
  getSubscribedSku,
  getSecurityDefaultsEnabled,
} from 'packages/integrations/microsoft/services/identity';
import { getUsers } from 'packages/integrations/microsoft/services/users';
import { syncIdentities } from 'packages/integrations/microsoft/sync/syncIdentities';
import { syncMetrics } from 'packages/integrations/microsoft/sync/syncMetrics';
import { syncPolicies } from 'packages/integrations/microsoft/sync/syncPolicices';
import { transformIdentities } from 'packages/integrations/microsoft/transforms/identities';
import { transformPolicies } from 'packages/integrations/microsoft/transforms/policies';
import { APIResponse } from '@/types';

export async function syncMapping(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<null>> {
  try {
    const [subscribedSkus, caPolicies, securityDefaults] = await Promise.all([
      getSubscribedSku(mapping),
      getConditionalAccessPolicies(mapping),
      getSecurityDefaultsEnabled(mapping),
    ]);
    if (!subscribedSkus.ok || !caPolicies.ok || !securityDefaults.ok) {
      throw new Error('Failed to fetch data.');
    }

    const users = await getUsers(mapping, subscribedSkus.data);
    if (!users.ok) {
      throw new Error('Failed to fetch data.');
    }

    const transformedPolicies = transformPolicies(caPolicies.data, mapping);
    const transformedUsers = await transformIdentities(
      users.data,
      subscribedSkus.data,
      caPolicies.data,
      securityDefaults.data,
      mapping
    );
    if (!transformedUsers.ok) {
      throw new Error('Failed to transform users');
    }

    const policies = await syncPolicies(mapping, transformedPolicies);
    const identities = await syncIdentities(mapping, transformedUsers.data);
    if (!policies.ok || !identities.ok) {
      throw new Error('Failed to sync data');
    }

    const metrics = await syncMetrics(mapping, policies.data, [], identities.data);
    if (!metrics.ok) {
      throw new Error(metrics.error.message);
    }

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
  }
}
