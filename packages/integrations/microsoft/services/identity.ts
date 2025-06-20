import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { getGraphClient } from '@/integrations/microsoft/auth';
import { Tables } from '@/db/schema';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';

export async function getSubscribedSku(
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<MSGraphSubscribedSku[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
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

export async function getAuthenticationMethods(
  id: string,
  mapping: Tables<'site_source_mappings'>
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

export async function getSecurityDefaultsEnabled(
  mapping: Tables<'site_source_mappings'>
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

export async function getConditionalAccessPolicies(
  mapping: Tables<'site_source_mappings'>
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
