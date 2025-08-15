'use server';

import { Tables } from '@/types/db';
import { SPEndpoint } from '@/integrations/sophos/types/endpoints';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function enableTamperProtection(
  token: string,
  mapping: Tables<'source', 'tenants'>,
  endpointId: string
): Promise<APIResponse<SPEndpoint[]>> {
  try {
    if (!token) {
      throw new Error('Invalid token input');
    }

    const path = `/endpoint/v1/endpoints/${endpointId}/tamper-protection`;
    const metadata = mapping.metadata as Record<string, any>;
    const url = metadata.apiHost + path;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': mapping.external_id,
      },
      body: JSON.stringify({
        enabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const data = await response.json();
    return {
      data: data.enabled,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'enableTamperProtection',
      message: String(err),
    });
  }
}
