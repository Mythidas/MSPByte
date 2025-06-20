'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Schema } from 'packages/db';

export async function getEndpoints(
  token: string,
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<any[]>> {
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
      ok: true,
      data: [...data.items],
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-endpoints',
      message: String(err),
      time: new Date(),
    });
  }
}
