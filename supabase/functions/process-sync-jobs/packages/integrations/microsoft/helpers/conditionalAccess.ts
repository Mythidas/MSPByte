import { MSGraphConditionalAccessPolicy } from '../types/conditionalAccess.ts';
import { MSGraphSubscribedSku } from '../types/licenses.ts';
import { MSGraphUserContext } from '../types/users.ts';

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
  if (user.groups?.some((id) => excludeGroups.includes(id))) return false;
  if (user.roles?.some((id) => excludeRoles.includes(id))) return false;

  // If includes are empty, policy might be global (apply to all users)
  const hasIncludes =
    includeUsers.length > 0 || includeGroups.length > 0 || includeRoles.length > 0;

  if (!hasIncludes) return true;

  return (
    includeUsers.includes('All') ||
    includeUsers.includes(user.id) ||
    user.groups?.some((id) => includeGroups.includes(id)) ||
    user.roles?.some((id) => includeRoles.includes(id))
  );
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

export function isUserRequiredToUseMFA(
  policies: MSGraphConditionalAccessPolicy[],
  user: MSGraphUserContext
): boolean {
  return getPoliciesAffectingUser(policies, user).some((policy) => doesPolicyEnforceMFA(policy));
}

export function isUserCapableOfCA(
  assignedLicenses: string[],
  subscribedSkus: MSGraphSubscribedSku[]
): boolean {
  const CONDITIONAL_ACCESS_SERVICE_PLANS = ['AAD_PREMIUM', 'AAD_PREMIUM_P2'];

  return assignedLicenses.some((skuId) => {
    const matchingSku = subscribedSkus.find((sku) => sku.skuPartNumber === skuId);
    if (!matchingSku) return false;

    return matchingSku.servicePlans.some((plan) =>
      CONDITIONAL_ACCESS_SERVICE_PLANS.includes(plan.servicePlanName)
    );
  });
}
