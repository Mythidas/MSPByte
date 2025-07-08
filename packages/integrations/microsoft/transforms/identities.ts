import { Tables, TablesInsert } from '@/db/schema';
import { isUserRequiredToUseMFA } from '@/integrations/microsoft/helpers/conditionalAccess';
import { getAuthenticationMethods } from '@/integrations/microsoft/services/identity';
import { getUserContext } from '@/integrations/microsoft/services/users';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import {
  MSGraphAuthenticationMethod,
  AuthenticationMethodType,
} from '@/integrations/microsoft/types/identity';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUser } from '@/integrations/microsoft/types/users';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function transformIdentities(
  users: MSGraphUser[],
  subscribedSkus: MSGraphSubscribedSku[],
  caPolicies: MSGraphConditionalAccessPolicy[],
  securityDefaultsEnabled: boolean,
  mapping: Tables<'source_tenants'>
): Promise<APIResponse<TablesInsert<'source_identities'>[]>> {
  try {
    const identities: TablesInsert<'source_identities'>[] = [];
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
        securityDefaultsEnabled || isUserRequiredToUseMFA(caPolicies, userContext.data);
      const transformedMethods = transformAuthenticationMethods(mfaMethods.data);

      identities.push({
        tenant_id: mapping.tenant_id,
        source_id: mapping.source_id,
        site_id: mapping.site_id,

        external_id: user.id,
        enabled: user.accountEnabled!,
        email: user.userPrincipalName!,
        name: user.displayName!,
        type: user.userType.toLowerCase(),
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
