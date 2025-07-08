import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth/getGraphClient';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUser, MSGraphUserContext } from '@/integrations/microsoft/types/users';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getUsers(
  mapping: Tables<'source_tenants'>,
  licenses: MSGraphSubscribedSku[]
): Promise<APIResponse<MSGraphUser[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) throw new Error(client.error.message);

    const fields = getSupportedUserFields(licenses);

    let query = client.data
      .api('/users')
      .select(fields.join(','))
      .header('ConsistencyLevel', 'eventual')
      .orderby('userPrincipalName');
    if (mapping.external_name) query = query.filter(`endswith(mail,\'${mapping.external_name}\')`);

    const users = await query.get();

    return {
      ok: true,
      data: users.value,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getUsers',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getUserContext(
  user: MSGraphUser,
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<MSGraphUserContext>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) throw new Error(client.error.message);

    const memberships = await getUserMemberships(client.data, user.id);

    if (!memberships.ok) {
      throw new Error('Failed to fetch data');
    }

    return {
      ok: true,
      data: {
        id: user.id,
        groups: memberships.data.groups,
        roles: memberships.data.roles,
      },
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getUserContext',
      message: String(err),
      time: new Date(),
    });
  }
}

type UserMemberships = {
  groups: string[];
  roles: string[];
};

async function getUserMemberships(
  client: Client,
  id: string
): Promise<APIResponse<UserMemberships>> {
  try {
    const groups: string[] = [];
    const roles: string[] = [];

    let response = await client.api(`/users/${id}/transitiveMemberOf`).get();

    while (response) {
      for (const item of response.value || []) {
        const type = item['@odata.type'];
        if (type === '#microsoft.graph.group') {
          groups.push(item.id);
        } else if (type === '#microsoft.graph.directoryRole') {
          roles.push(item.id);
        }
      }

      const nextLink = response['@odata.nextLink'];
      if (!nextLink) break;
      response = await client.api(nextLink).get();
    }

    return {
      ok: true,
      data: {
        groups,
        roles,
      },
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getUserMemberships',
      message: String(err),
      time: new Date(),
    });
  }
}

export function getSupportedUserFields(licenses: MSGraphSubscribedSku[]): string[] {
  const baseFields = [
    'id',
    'displayName',
    'userPrincipalName',
    'accountEnabled',
    'assignedLicenses',
    'assignedPlans',
    'userType',
  ];

  const licenseCapabilities = {
    signInActivity: ['AAD_PREMIUM', 'AAD_PREMIUM_P2'],
    employeeHireDate: ['AAD_PREMIUM_P2'],
  };

  for (const [field, requiredPlans] of Object.entries(licenseCapabilities)) {
    const canAccess = licenses.some((lic) =>
      lic.servicePlans.some((plan: any) => requiredPlans.includes(plan.servicePlanName))
    );
    if (canAccess) baseFields.push(field);
  }

  return baseFields;
}
