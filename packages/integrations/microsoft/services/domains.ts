'use server';

import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth/getGraphClient';
import { MSGraphDomain } from '@/integrations/microsoft/types/domains';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getDomains(
  mapping: Pick<Tables<'source', 'tenants'>, 'external_id' | 'metadata'>
): Promise<APIResponse<MSGraphDomain[]>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    const response = await client.data.api('/domains').get();

    return {
      ok: true,
      data: response.value as MSGraphDomain[],
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getDomains',
      message: String(err),
      time: new Date(),
    });
  }
}
