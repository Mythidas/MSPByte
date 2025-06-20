import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types';
import { MSGraphUser, MSGraphUserContext } from '@/integrations/microsoft/types/users';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getUsers(
  mapping: Tables<'site_source_mappings'>,
  licenses: MSGraphSubscribedSku[]
): Promise<APIResponse<MSGraphUser[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) throw new Error(client.error.message);

    const fields = getSupportedUserFields(licenses);

    const users = await client.data
      .api('/users')
      .select(fields.join(','))
      .header('ConsistencyLevel', 'eventual')
      .filter(`endswith(mail,\'${mapping.external_name}\')`)
      .orderby('userPrincipalName')
      .get();

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
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<MSGraphUserContext>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) throw new Error(client.error.message);

    const [groupIds, roleIds] = await Promise.all([
      getUserGroupIds(client.data, user.id),
      getUserRoleIds(client.data, user.id),
    ]);

    if (!groupIds.ok || !roleIds.ok) {
      throw new Error('Failed to fetch data');
    }

    return {
      ok: true,
      data: {
        id: user.id,
        groups: groupIds.data,
        roles: roleIds.data,
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

async function getUserGroupIds(client: Client, id: string): Promise<APIResponse<string[]>> {
  try {
    const groups: string[] = [];
    let response = await client.api(`/users/${id}/memberOf`).get();

    while (response) {
      for (const item of response.value || []) {
        if (item['@odata.type'] === '#microsoft.graph.group') {
          groups.push(item.id);
        }
      }

      const nextLink = response['@odata.nextLink'];
      if (!nextLink) break;
      response = await client.api(nextLink).get();
    }

    return {
      ok: true,
      data: groups,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getUserGroupIds',
      message: String(err),
      time: new Date(),
    });
  }
}

async function getUserRoleIds(client: any, userId: string): Promise<APIResponse<string[]>> {
  try {
    const response = await client.api(`/users/${userId}/appRoleAssignments`).get();
    return {
      ok: true,
      data: response.value?.map((assignment: any) => assignment.appRoleId) || [],
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getUserRoleIds',
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
