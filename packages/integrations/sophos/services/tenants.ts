'use server';

import { Tables } from '@/types/db';
import { getPartnerID, getToken } from '@/integrations/sophos/auth';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function getTenants(
  integration: Tables<'public', 'integrations'>
): Promise<APIResponse<any[]>> {
  try {
    const token = await getToken(integration);
    if (token.error) {
      throw new Error(token.error.message);
    }

    const sophosPartner = await getPartnerID(token.data);
    if (sophosPartner.error) {
      throw new Error(sophosPartner.error.message);
    }

    const tenants = [];
    const url = 'https://api.central.sophos.com/partner/v1/tenants';

    let page = 1;
    while (true) {
      const response = await fetch(`${url}?pageTotal=true&pageSize=100&page=${page}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token.data}`,
          'X-Partner-ID': sophosPartner.data,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get Sophos Tenants: ${response.status} - ${error}`);
      }

      const data = await response.json();
      tenants.push(...data.items);

      if (data.pages.current >= data.pages.total) {
        break;
      }
      page++;
    }

    return {
      data: tenants.sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-tenants',
      message: String(err),
    });
  }
}
