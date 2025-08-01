import { Tables } from '@/db/schema';
import { decrypt } from '@/db/secret';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getSecurityDefaultsEnabled(
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<boolean>> {
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

    const securityDefaults = await client.data
      .api('/policies/identitySecurityDefaultsEnforcementPolicy')
      .get();

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
