import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getGraphToken, graphFetch } from '../auth/index.ts';
import { MSGraphSubscribedSku } from '../types/licenses.ts';
import { MSGraphUser, MSGraphUserContext } from '../types/users.ts';

export async function getUsers(
  mapping: Tables<'site_source_mappings'>,
  licenses: MSGraphSubscribedSku[]
): Promise<APIResponse<MSGraphUser[]>> {
  try {
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const fields = getSupportedUserFields(licenses);

    const selectFields = fields.join(',');
    const filter = mapping.external_name ? `endswith(mail,'${mapping.external_name}')` : undefined;

    const searchParams = new URLSearchParams();

    searchParams.set('$select', selectFields);
    searchParams.set('$orderby', 'userPrincipalName');
    if (filter) searchParams.set('$filter', filter);

    const users = await graphFetch(`/users?${searchParams.toString()}`, token, {
      headers: {
        ConsistencyLevel: 'eventual',
      },
    });

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
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const memberships = await getUserMemberships(token, user.id);

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

export async function getUserMemberships(
  token: string,
  id: string
): Promise<APIResponse<UserMemberships>> {
  try {
    const groups: string[] = [];
    const roles: string[] = [];

    let url = `/users/${id}/transitiveMemberOf`;

    while (url) {
      const res = await graphFetch(url, token);
      const items = res.value || [];

      for (const item of items) {
        const type = item['@odata.type'];
        if (type === '#microsoft.graph.group') {
          groups.push(item.id);
        } else if (type === '#microsoft.graph.directoryRole') {
          roles.push(item.id);
        }
      }

      url = res['@odata.nextLink']
        ? res['@odata.nextLink'].replace('https://graph.microsoft.com/v1.0/', '')
        : '';
    }

    return {
      ok: true,
      data: { groups, roles },
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
