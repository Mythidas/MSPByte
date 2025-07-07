import { Tables } from '@/db/schema';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getSecurityDefaultsEnabled(
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<boolean>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
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
