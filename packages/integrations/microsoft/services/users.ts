import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth/getGraphClient';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUser, MSGraphUserContext } from '@/integrations/microsoft/types/users';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Client } from '@microsoft/microsoft-graph-client';

export async function getUsers(
  mapping: Pick<Tables<'source', 'tenants'>, 'external_id' | 'metadata'>,
  licenses: MSGraphSubscribedSku[],
  cursor?: string
): Promise<APIResponse<{ users: MSGraphUser[]; next?: string }>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    if (cursor) {
      const response = await client.data.api(cursor).get();

      return {
        ok: true,
        data: {
          users: response.value,
          next: response['@odata.nextLink'],
        },
      };
    }

    const fields = getSupportedUserFields(licenses);
    const domains = (mapping.metadata as { domains: string[] }).domains.map((domain) =>
      domain.trim()
    );
    const filter = domains.map((domain) => `endswith(userPrincipalName,'@${domain}')`).join(' or ');

    const query = client.data
      .api('/users')
      .select(fields.join(','))
      .header('ConsistencyLevel', 'eventual')
      .orderby('userPrincipalName')
      .filter(filter);

    const response = await query.get();

    return {
      ok: true,
      data: {
        users: response.value,
        next: response['@odata.nextLink'],
      },
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
  mapping: Pick<Tables<'source', 'tenants'>, 'external_id' | 'metadata'>
): Promise<APIResponse<MSGraphUserContext>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
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

type UserMembership = {
  id: string;
  displayName: string;
};
type UserMemberships = {
  groups: UserMembership[];
  roles: UserMembership[];
};

async function getUserMemberships(
  client: Client,
  id: string
): Promise<APIResponse<UserMemberships>> {
  try {
    const groups: UserMembership[] = [];
    const roles: UserMembership[] = [];

    let response = await client.api(`/users/${id}/transitiveMemberOf`).get();

    while (response) {
      for (const item of response.value || []) {
        const type = item['@odata.type'];
        if (type === '#microsoft.graph.group') {
          groups.push({ id: item.id, displayName: item.displayName });
        } else if (type === '#microsoft.graph.directoryRole') {
          roles.push({ id: item.id, displayName: item.displayName });
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
    'proxyAddresses',
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
