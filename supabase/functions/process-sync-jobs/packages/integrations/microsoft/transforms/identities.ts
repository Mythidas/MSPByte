import { APIResponse, Debug } from '../../../../utils.ts';
import { Tables, TablesInsert } from '../../../db/schema.ts';
import { isUserCapableOfCA, isUserRequiredToUseMFA } from '../helpers/conditionalAccess.ts';
import { getAuthenticationMethods } from '../services/identity/getAuthenticationMethods.ts';
import { getUserContext } from '../services/users.ts';
import { MSGraphConditionalAccessPolicy } from '../types/conditionalAccess.ts';
import { MSGraphAuthenticationMethod, AuthenticationMethodType } from '../types/identity.ts';
import { MSGraphSubscribedSku } from '../types/licenses.ts';
import { MSGraphUser } from '../types/users.ts';

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
        site_id: mapping.site_id,
        source_id: mapping.source_id,

        external_id: user.id,
        enabled: user.accountEnabled!,
        email: user.userPrincipalName!,
        name: user.displayName!,
        type: user.userType ? user.userType.toLowerCase() : 'member',
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
          valid_mfa_license: isUserRequiredToUseMFA(caPolicies, userContext.data),
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
