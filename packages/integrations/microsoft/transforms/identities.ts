import { Debug } from '@/lib/utils';
import { Tables, TablesInsert } from 'packages/db/schema';
import {
  isUserCapableOfCA,
  isUserRequiredToUseMFA,
} from 'packages/integrations/microsoft/helpers/conditionalAccess';
import { getAuthenticationMethods } from 'packages/integrations/microsoft/services/identity';
import { getUserContext } from 'packages/integrations/microsoft/services/users';
import { MSGraphSubscribedSku } from 'packages/integrations/microsoft/types';
import { MSGraphConditionalAccessPolicy } from 'packages/integrations/microsoft/types/conditionalAccess';
import {
  MSGraphAuthenticationMethod,
  AuthenticationMethodType,
} from 'packages/integrations/microsoft/types/identity';
import { MSGraphUser } from 'packages/integrations/microsoft/types/users';
import { APIResponse } from '@/types';

export async function transformIdentities(
  users: MSGraphUser[],
  subscribedSkus: MSGraphSubscribedSku[],
  caPolicies: MSGraphConditionalAccessPolicy[],
  securityDefaultsEnabled: boolean,
  mapping: Tables<'site_source_mappings'>
): Promise<APIResponse<TablesInsert<'source_identities'>[]>> {
  try {
    const identities = [];
    for await (const user of users) {
      const mfaMethods = await getAuthenticationMethods(user.id, mapping);
      const userContext = await getUserContext(user, mapping);
      if (!mfaMethods.ok || !userContext.ok) {
        throw new Error('Failed to fetch data');
      }

      const licenseSkus =
        user.assignedLicenses?.map(
          (l) => subscribedSkus.find((ssku) => ssku.skuId === l.skuId)?.skuPartNumber || l.skuId
        ) || [];
      const mfaEnforced =
        securityDefaultsEnabled ||
        (isUserCapableOfCA(licenseSkus, subscribedSkus) &&
          isUserRequiredToUseMFA(caPolicies, userContext.data));
      const transformedMethods = transformAuthenticationMethods(mfaMethods.data);

      identities.push({
        tenant_id: mapping.tenant_id,
        mapping_id: mapping.id,

        external_id: user.id,
        enabled: user.accountEnabled!,
        email: user.userPrincipalName!,
        name: user.displayName!,
        mfa_enforced: mfaEnforced,
        enforcement_type: mfaEnforced
          ? securityDefaultsEnabled
            ? 'security_defaults'
            : 'conditional_access'
          : 'none',
        mfa_methods: transformedMethods,
        last_activity: user.signInActivity?.lastSignInDateTime ?? null,
        license_skus: licenseSkus,
        metadata: {
          ...(user as any),
          roles: userContext.data.roles,
          groups: userContext.data.groups,
        },
        created_at: new Date().toISOString(),
      });
    }

    return { ok: true, data: identities };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'transformIdentities',
      message: String(err),
      time: new Date(),
    });
  }
}

export function transformAuthenticationMethods(methods: any[]): MSGraphAuthenticationMethod[] {
  const typeMap: Record<string, AuthenticationMethodType> = {
    '#microsoft.graph.smsAuthenticationMethod': 'sms',
    '#microsoft.graph.microsoftAuthenticatorAuthenticationMethod': 'mobileApp',
    '#microsoft.graph.windowsHelloForBusinessAuthenticationMethod': 'windowsHelloForBusiness',
    '#microsoft.graph.fido2AuthenticationMethod': 'fido2',
    '#microsoft.graph.temporaryAccessPassAuthenticationMethod': 'temporaryAccessPass',
    '#microsoft.graph.emailAuthenticationMethod': 'email',
    '#microsoft.graph.voiceAuthenticationMethod': 'voice',
    '#microsoft.graph.passwordAuthenticationMethod': 'password',
  };

  return methods.map((item) => ({
    id: item.id,
    displayName: item.displayName,
    type: typeMap[item['@odata.type']] ?? 'unknown',
  }));
}
