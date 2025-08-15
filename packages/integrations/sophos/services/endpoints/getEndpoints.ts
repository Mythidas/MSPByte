'use server';

import { Tables } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function getEndpoints(
  token: string,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<SPEndpoint[]>> {
  try {
    if (!token) {
      throw new Error('Invalid token input');
    }

    const path = '/endpoint/v1/endpoints?pageSize=500&pageTotal=true';
    const metadata = mapping.metadata as Record<string, any>;
    const url = metadata.apiHost + path;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': mapping.external_id,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();

    return {
      data: [...data.items],
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'getEndpoints',
      message: String(err),
    });
  }
}
