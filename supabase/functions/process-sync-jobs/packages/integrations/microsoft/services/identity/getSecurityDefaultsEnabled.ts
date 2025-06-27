import { APIResponse, Debug } from '../../../../../utils.ts';
import { Tables } from '../../../../db/schema.ts';
import { getGraphToken, graphFetch } from '../../auth/getGraphClient.ts';

export async function getSecurityDefaultsEnabled(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<boolean>> {
  try {
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const securityDefaults = await graphFetch(
      `/policies/identitySecurityDefaultsEnforcementPolicy`,
      token
    );

    return {
      ok: true,
      data: securityDefaults.isEnabled || false,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getSecurityDefaultsEnabled',
      message: String(err),
      time: new Date(),
    });
  }
}
