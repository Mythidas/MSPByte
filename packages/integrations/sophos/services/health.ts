'use server';

import { Tables } from '@/types/db';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';
import { SPHealthCheck } from '@/integrations/sophos/types/health';

export async function getHealthCheck(
  token: string,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<SPHealthCheck>> {
  try {
    if (!token) {
      throw new Error('Invalid token input');
    }

    const path = '/account-health-check/v1/health-check';
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
      data: data,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'getEndpoints',
      message: String(err),
    });
  }
}
