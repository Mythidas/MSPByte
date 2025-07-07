import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getConditionalAccessPolicies(
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<MSGraphConditionalAccessPolicy[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const securityPolicies = await client.data.api('/identity/conditionalAccess/policies').get();

    return {
      ok: true,
      data: securityPolicies.value,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getConditionalAccessPolicies',
      message: String(err),
      time: new Date(),
    });
  }
}
