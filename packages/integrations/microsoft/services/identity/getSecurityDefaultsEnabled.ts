import { Tables } from '@/types/db';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth/getGraphClient';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function getSecurityDefaultsEnabled(
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<boolean>> {
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

    const securityDefaults = await client.data
      .api('/policies/identitySecurityDefaultsEnforcementPolicy')
      .get();

    return {
      data: securityDefaults.isEnabled || false,
    };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'getSecurityDefaultsEnabled',
      message: String(err),
    });
  }
}
