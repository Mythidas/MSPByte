import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphGroup } from '@/integrations/microsoft/types/groups';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getGroups(
  mapping: Pick<Tables<'source_tenants'>, 'external_id' | 'metadata'>
): Promise<APIResponse<MSGraphGroup[]>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      metadata.client_secret
    );
    if (!client.ok) throw new Error(client.error.message);

    let query = client.data
      .api('/groups')
      .header('ConsistencyLevel', 'eventual')
      .orderby('displayName');

    let allGroups: MSGraphGroup[] = [];
    let response = await query.get();

    allGroups = allGroups.concat(response.value);

    while (response['@odata.nextLink']) {
      response = await client.data.api(response['@odata.nextLink']).get();
      allGroups = allGroups.concat(response.value);
    }

    return {
      ok: true,
      data: allGroups,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getGroups',
      message: String(err),
      time: new Date(),
    });
  }
}
