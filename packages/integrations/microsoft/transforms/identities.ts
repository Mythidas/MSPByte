import pMap from 'p-map';
import { Tables, TablesInsert } from '@/types/db';
import {
  doesPolicyApplyToUser,
  isUserCapableOfCA,
  isUserRequiredToUseMFA,
} from '@/integrations/microsoft/helpers/conditionalAccess';
import { getAuthenticationMethods } from '@/integrations/microsoft/services/identity';
import { getUserContext } from '@/integrations/microsoft/services/users';
import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import {
  MSGraphAuthenticationMethod,
  AuthenticationMethodType,
} from '@/integrations/microsoft/types/identity';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUser } from '@/integrations/microsoft/types/users';
import { Debug, generateUUID, Timer } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function transformIdentities(
  users: MSGraphUser[],
  subscribedSkus: MSGraphSubscribedSku[],
  caPolicies: MSGraphConditionalAccessPolicy[],
  securityDefaultsEnabled: boolean,
  activity: Record<string, string>,
  mapping: Tables<'source', 'tenants'>
): Promise<APIResponse<TablesInsert<'source', 'identities'>[]>> {
  const timer = new Timer('TransformIdentities', false);

  try {
    const identities = await pMap(
      users,
      async (user): Promise<TablesInsert<'source', 'identities'> | null> => {
        try {
          const [mfaMethods, userContext] = await Promise.all([
            getAuthenticationMethods(user.id, mapping),
            getUserContext(user, mapping),
          ]);

          if (!mfaMethods.ok || !userContext.ok) {
            throw new Error('Failed to fetch data');
          }

          const licenseSkus =
            user.assignedLicenses?.map(
              (l) => subscribedSkus.find((ssku) => ssku.skuId === l.skuId)?.skuPartNumber || l.skuId
            ) || [];

          const mfaEnforced =
            securityDefaultsEnabled || isUserRequiredToUseMFA(caPolicies, userContext.data);
          const userActivity = activity[user.userPrincipalName];
          const lastActivity =
            user.signInActivity?.lastSignInDateTime || userActivity || new Date(0).toISOString();

          const transformedMethods = transformAuthenticationMethods(mfaMethods.data);

          const identity: TablesInsert<'source', 'identities'> = {
            id: generateUUID(),
            tenant_id: mapping.tenant_id,
            source_id: mapping.source_id,
            site_id: mapping.site_id,
            source_tenant_id: mapping.id,

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
            last_activity_at: lastActivity,
            license_skus: licenseSkus,
            role_ids: userContext.data.roles.map((role) => role.displayName),
            group_ids: userContext.data.groups.map((group) => group.displayName),
            metadata: {
              ...(user as any),
              roles: userContext.data.roles,
              groups: userContext.data.groups,
              valid_mfa_license: isUserCapableOfCA(licenseSkus, subscribedSkus),
              appliedCaPolicies: caPolicies
                .filter((pol) => doesPolicyApplyToUser(pol, userContext.data))
                .map((pol) => pol.displayName),
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return identity;
        } catch (err) {
          console.warn(`Failed to transform user ${user.userPrincipalName}: ${err}`);
          return null; // Skip this user
        }
      },
      { concurrency: 5 } // Adjust as needed based on throttling/responsiveness
    );

    return { ok: true, data: identities.filter(Boolean) as TablesInsert<'source', 'identities'>[] };
  } catch (err) {
    return Debug.error({
      module: 'Microsoft365',
      context: 'transformIdentities',
      message: String(err),
      time: new Date(),
    });
  } finally {
    timer.summary();
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
