import { APIResponse, Debug } from '../../../../../utils.ts';
import { Tables } from '../../../../db/schema.ts';
import { graphFetch } from '../../auth/getGraphClient.ts';
import { getGraphToken } from '../../auth/index.ts';
import { MSGraphSubscribedSku } from '../../types/licenses.ts';

export async function getSubscribedSku(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<MSGraphSubscribedSku[]>> {
  try {
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const fields = [
      'skuId',
      'skuPartNumber',
      'servicePlans',
      'prepaidUnits',
      'consumedUnits',
      'appliesTo',
    ];

    const query = new URLSearchParams({ $select: fields.join(',') });

    const licenses = await graphFetch(`/subscribedSkus?${query}`, token);

    return {
      ok: true,
      data: licenses.value ?? [],
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
