import { APIResponse, Debug } from '../../../../../utils.ts';
import { Tables } from '../../../../db/schema.ts';
import { getGraphToken, graphFetch } from '../../auth/getGraphClient.ts';
import { MSGraphConditionalAccessPolicy } from '../../types/conditionalAccess.ts';

export async function getConditionalAccessPolicies(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<MSGraphConditionalAccessPolicy[]>> {
  try {
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const securityPolicies = await graphFetch('/identity/conditionalAccess/policies', token);

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
