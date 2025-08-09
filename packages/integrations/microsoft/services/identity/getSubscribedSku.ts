import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getSubscribedSku(
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<MSGraphSubscribedSku[]>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
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
      'accountId',
      'accountName',
      'capabilityStatus',
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
