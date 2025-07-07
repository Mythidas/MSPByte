import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getAuthenticationMethods(
  id: string,
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<any[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const methods = await client.data.api(`/users/${id}/authentication/methods`).get();

    return {
      ok: true,
      data: methods.value,
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
