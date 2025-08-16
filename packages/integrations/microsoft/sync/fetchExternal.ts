import { insertRows } from '@/db/orm';
import { getRecentSignIns } from '@/integrations/microsoft/services/activity';
import { getGroups } from '@/integrations/microsoft/services/groups';
import { getConditionalAccessPolicies } from '@/integrations/microsoft/services/identity/getConditionalAccessPolicies';
import { getSecurityDefaultsEnabled } from '@/integrations/microsoft/services/identity/getSecurityDefaultsEnabled';
import { getSubscribedSku } from '@/integrations/microsoft/services/identity/getSubscribedSku';
import { getRoles } from '@/integrations/microsoft/services/roles';
import { getUsers } from '@/integrations/microsoft/services/users';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import { MSGraphGroup } from '@/integrations/microsoft/types/groups';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphRole } from '@/integrations/microsoft/types/roles';
import { MSGraphUser } from '@/integrations/microsoft/types/users';
import Async from '@/shared/lib/Async';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
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
    roles: MSGraphRole[];
    groups: MSGraphGroup[];
    cursor?: string;
  }>
> {
  const { data, error } = await Async.all([
    getSubscribedSku(tenant),
    getConditionalAccessPolicies(tenant),
    getSecurityDefaultsEnabled(tenant),
    getRoles(tenant),
    getGroups(tenant),
  ]);
  if (error) throw error.message;
  const [subscribedSkus, caPolicies, securityDefaults, roles, groups] = data;

  const users = await getUsers(tenant, subscribedSkus, cursor);
  if (users.error) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'Fetch External',
      message: 'Failed to fetch external users',
    });
  }

  const activity = await getRecentSignIns(tenant);
  if (activity.error) {
    Debug.warn({
      module: 'Microsoft365',
      context: 'Fetch External',
      message: 'Failed to fetch external activities',
    });
  }

  return {
    data: {
      subscribedSkus,
      caPolicies,
      securityDefaults,
      users: users.data.users,
      activity: !activity.error ? activity.data : {},
      roles,
      groups,
      cursor: users.data.next,
    },
  };
}
