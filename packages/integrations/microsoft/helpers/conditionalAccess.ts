import { MSGraphConditionalAccessPolicy } from '@/integrations/microsoft/types/conditionalAccess';
import { MSGraphSubscribedSku } from '@/integrations/microsoft/types/licenses';
import { MSGraphUserContext } from '@/integrations/microsoft/types/users';

export function doesPolicyApplyToUser(
  policy: MSGraphConditionalAccessPolicy,
  user: MSGraphUserContext
): boolean {
  if (policy.state !== 'enabled') return false;

  const users = policy.conditions?.users;
  if (!users) return false;

  const {
    includeUsers = [],
    excludeUsers = [],
    includeGroups = [],
    excludeGroups = [],
    includeRoles = [],
    excludeRoles = [],
  } = users;

  // Check exclusions first
  if (excludeUsers.includes(user.id)) return false;
  if (user.groups?.some((group) => excludeGroups.includes(group.id))) return false;
  if (user.roles?.some((role) => excludeRoles.includes(role.id))) return false;

  // If includes are empty, policy might be global (apply to all users)
  const hasIncludes =
    includeUsers.length > 0 || includeGroups.length > 0 || includeRoles.length > 0;

  if (!hasIncludes) return true;

  return (
    includeUsers.includes('All') ||
    includeUsers.includes(user.id) ||
    user.groups?.some((group) => includeGroups.includes(group.id)) ||
    user.roles?.some((role) => includeRoles.includes(role.id))
  );
}

export function isPolicyScopedToAllApps(policy: MSGraphConditionalAccessPolicy): boolean {
  const apps = policy.conditions?.applications;
  if (!apps) return false;

  return apps.includeApplications?.includes('All') ?? false;
}

export function doesPolicyEnforceMFA(policy: MSGraphConditionalAccessPolicy): boolean {
  const grantControls = policy.grantControls;
  if (!grantControls || !grantControls.builtInControls) return false;

  return grantControls.builtInControls.includes('mfa');
}

export function getPoliciesAffectingUser(
  policies: MSGraphConditionalAccessPolicy[],
  user: MSGraphUserContext
): MSGraphConditionalAccessPolicy[] {
  return policies.filter((policy) => doesPolicyApplyToUser(policy, user));
}

type MFAEvaluationResult =
  | { status: 'full'; policy: string }
  | { status: 'partial'; policy: string }
  | undefined;

export function isUserRequiredToUseMFA(
  policies: MSGraphConditionalAccessPolicy[],
  user: MSGraphUserContext
): MFAEvaluationResult {
  let result: MFAEvaluationResult = undefined;
  for (const policy of getPoliciesAffectingUser(policies, user)) {
    if (doesPolicyEnforceMFA(policy)) {
      const isGlobal = isPolicyScopedToAllApps(policy);
      result = {
        status: isGlobal ? 'full' : 'partial',
        policy: policy.displayName,
      };

      if (isGlobal) return result;
    }
  }

  return result;
}

export function isUserCapableOfCA(
  assignedLicenses: string[],
  subscribedSkus: MSGraphSubscribedSku[]
): boolean {
  const CONDITIONAL_ACCESS_SERVICE_PLANS = [
    'AAD_PREMIUM',
    'AAD_PREMIUM_P1',
    'AAD_PREMIUM_P2',
    'ENTRA_ID_PREMIUM_P1',
    'ENTRA_ID_PREMIUM_P2',
  ];

  return assignedLicenses.some((skuId) => {
    const matchingSku = subscribedSkus.find((sku) => sku.skuPartNumber === skuId);
    if (!matchingSku) return false;

    return matchingSku.servicePlans?.some((plan) =>
      CONDITIONAL_ACCESS_SERVICE_PLANS.includes(plan.servicePlanName)
    );
  });
}
