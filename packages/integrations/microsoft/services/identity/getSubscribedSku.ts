import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getSubscribedSku(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<MSGraphSubscribedSku[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const fields = [
      'skuId',
      'skuPartNumber',
      'servicePlans',
      'prepaidUnits',
      'consumedUnits',
      'appliesTo',
    ];

    const licenses = await client.data.api('/subscribedSkus').select(fields.join(',')).get();

    return {
      ok: true,
      data: licenses.value,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getSubscribedSku',
      message: String(err),
      time: new Date(),
    });
  }
}
