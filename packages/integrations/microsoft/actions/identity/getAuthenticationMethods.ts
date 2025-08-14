import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth/getGraphClient';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function getAuthenticationMethods(
  id: string,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<any[]>> {
  try {
    const metadata = mapping.metadata as any;
    const client = await getGraphClient(
      mapping.external_id,
      metadata.client_id,
      await decrypt(metadata.client_secret)
    );
    if (client.error) {
      throw new Error(client.error.message);
    }

    const methods = await client.data.api(`/users/${id}/authentication/methods`).get();

    return {
      data: methods.value,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-authentication-methods',
      message: String(err),
    });
  }
}
