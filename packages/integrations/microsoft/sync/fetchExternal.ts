import { getRecentSignIns } from '@/integrations/microsoft/services/activity';
import {
  getSubscribedSku,
  getConditionalAccessPolicies,
  getSecurityDefaultsEnabled,
} from '@/integrations/microsoft/services/identity';
import { getUsers } from '@/integrations/microsoft/services/users';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUser } from '@/integrations/microsoft/types/users';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Tables } from '@/types/db';

export default async function fetchExternal(
  tenant: Tables<'source', 'tenants'>,
  cursor?: string
): Promise<
  APIResponse<{
    subscribedSkus: MSGraphSubscribedSku[];
    caPolicies: MSGraphConditionalAccessPolicy[];
    securityDefaults: boolean;
    users: MSGraphUser[];
    activity: Record<string, string>;
    cursor?: string;
  }>
> {
  const [subscribedSkus, caPolicies, securityDefaults] = await Promise.all([
    await getSubscribedSku(tenant),
    await getConditionalAccessPolicies(tenant),
    await getSecurityDefaultsEnabled(tenant),
  ]);

  if (!subscribedSkus.ok || !caPolicies.ok || !securityDefaults.ok) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'Fetch External',
      message: 'Failed to fetch external data',
      time: new Date(),
    });
  }

  const users = await getUsers(tenant, subscribedSkus.data, cursor);
  if (!users.ok) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'Fetch External',
      message: 'Failed to fetch external users',
      time: new Date(),
    });
  }

  const activity = await getRecentSignIns(tenant);
  if (!activity.ok) {
    Debug.warn({
      module: 'Microsoft365',
      context: 'Fetch External',
      message: 'Failed to fetch external activities',
      time: new Date(),
    });
  }

  return {
    ok: true,
    data: {
      subscribedSkus: subscribedSkus.data,
      caPolicies: caPolicies.data,
      securityDefaults: securityDefaults.data,
      users: users.data.users,
      activity: activity.ok ? activity.data : {},
      cursor: users.data.next,
    },
  };
}
