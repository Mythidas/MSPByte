'use server';

import { getPartnerID } from '@/integrations/sophos/auth';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { SPFirewallLicense } from '@/integrations/sophos/types/license';

export async function getFirewallLicenses(
  token: string
): Promise<APIResponse<SPFirewallLicense[]>> {
  try {
    const sophosPartner = await getPartnerID(token);
    if (sophosPartner.error) {
      throw new Error(sophosPartner.error.message);
    }

    const url = 'https://api.central.sophos.com/licenses/v1/licenses/firewalls';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Partner-ID': sophosPartner.data,
      },
    });

    const result = await response.json();

    return {
      data: result.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-tenants',
      message: String(err),
    });
  }
}
