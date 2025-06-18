import { getGraphClient } from "@/lib/actions/server/sources/microsoft";
import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { Microsoft } from "@/types/microsoft";

export async function getLicenses(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<Microsoft.SubscribedSkuShape[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const licenses = await client.data.api('/subscribedSkus')
      .select(Microsoft.SubscribedSkuFieldsReqiured.join(','))
      .get()

    for (const license of licenses.value as Microsoft.SubscribedSkuShape[]) {
      license.servicePlans = license.servicePlans.filter((s: any) => Microsoft.SubscribedSkuServicePlansAllowed.includes(s.servicePlanName))
    }

    return {
      ok: true,
      data: licenses.value
    }
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-licenses',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getAuthenticationMethods(id: string, mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<Microsoft.AuthenticationMethod[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const methods = await client.data.api(`/users/${id}/authentication/methods`)
      .get()

    const getType = (str: string) => {
      switch (str) {
        case "#microsoft.graph.softwareOathAuthenticationMethod":
          return 'software';
        case "#microsoft.graph.emailAuthenticationMethod":
          return 'email';
        case "#microsoft.graph.fido2AuthenticationMethod":
          return 'fido2';
        case "#microsoft.graph.microsoftAuthenticatorAuthenticationMethod":
          return 'app';
        case "#microsoft.graph.phoneAuthenticationMethod":
          return 'sms';
        case "#microsoft.graph.windowsHelloForBusinessAuthenticationMethod":
          return 'hello';
        default: return 'app'
      }
    }

    const data: Microsoft.AuthenticationMethod[] = methods.value.map((val: any) => {
      return { id: val.id, type: getType(val["@odata.type"]), displayName: val.displayName } as Microsoft.AuthenticationMethod;
    })

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-authentication-methods',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSecurityDefaultsEnabled(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<boolean>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const securityDefaults = await client.data.api('/policies/identitySecurityDefaultsEnforcementPolicy')
      .get()

    return {
      ok: true,
      data: securityDefaults.isEnabled || false
    }
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-security-defaults-enabled',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getConditionalAccessPolicies(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<Microsoft.ConditionalAccessPolicy[]>> {
  try {
    const client = await getGraphClient(mapping.source_id, mapping.site_id);
    if (!client.ok) {
      throw new Error(client.error.message);
    }

    const securityPolicies = await client.data.api('/identity/conditionalAccess/policies')
      .get()

    return {
      ok: true,
      data: securityPolicies.value
    }
  } catch (err) {
    return Debug.error({
      module: 'Microsoft-365',
      context: 'get-security-defaults-enabled',
      message: String(err),
      time: new Date()
    });
  }
}