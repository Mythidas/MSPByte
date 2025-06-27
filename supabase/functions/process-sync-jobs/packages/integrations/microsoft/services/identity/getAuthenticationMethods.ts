import { APIResponse, Debug } from '../../../../../utils.ts';
import { Tables } from '../../../../db/schema.ts';
import { getGraphToken, graphFetch } from '../../auth/getGraphClient.ts';

export async function getAuthenticationMethods(
  id: string,
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<any[]>> {
  try {
    const token = await getGraphToken(mapping.source_id, mapping.site_id);
    if (!token) {
      throw new Error('Failed to acquire Graph token');
    }

    const res = await graphFetch(`/users/${id}/authentication/methods`, token);

    return {
      ok: true,
      data: res.value ?? [],
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-authentication-methods',
      message: String(err),
      time: new Date(),
    });
  }
}
