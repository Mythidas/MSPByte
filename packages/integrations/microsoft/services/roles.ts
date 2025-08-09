'use server';

import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphRole } from '@/integrations/microsoft/types/roles';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getRoles(
  mapping: Pick<Tables<'source', 'tenants'>, 'external_id' | 'metadata'>
): Promise<APIResponse<MSGraphRole[]>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (!client.ok) throw new Error(client.error.message);

    let query = client.data
      .api('/directoryRoles')
      .select('id,displayName,description,roleTemplateId')
      .header('ConsistencyLevel', 'eventual')
      .orderby('displayName');

    let allRoles: MSGraphRole[] = [];
    let response = await query.get();

    allRoles = allRoles.concat(response.value);

    while (response['@odata.nextLink']) {
      response = await client.data.api(response['@odata.nextLink']).get();
      allRoles = allRoles.concat(response.value);
    }

    return {
      ok: true,
      data: allRoles,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getRoles',
      message: String(err),
      time: new Date(),
    });
  }
}
