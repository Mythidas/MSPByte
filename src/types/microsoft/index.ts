import { G_AllowedSubscribedSkuServicePlans, G_AuthenticationMethod, G_ConditionalAccessPolicy, G_RequiredSubscribedSkuFields, G_SubscribedSku, G_SubscribedSkuShape } from "@/types/microsoft/identity";
import { G_RequiredUserFields, G_User, G_UserShape } from "@/types/microsoft/user";

export namespace Microsoft {
  export type User = G_User;
  export type UserShape = G_UserShape;
  export const UserFieldsRequired = G_RequiredUserFields;

  export type SubscribedSku = G_SubscribedSku;
  export type SubscribedSkuShape = G_SubscribedSkuShape;
  export const SubscribedSkuFieldsReqiured = G_RequiredSubscribedSkuFields;
  export const SubscribedSkuServicePlansAllowed = G_AllowedSubscribedSkuServicePlans;

  export type AuthenticationMethod = G_AuthenticationMethod;
  export type ConditionalAccessPolicy = G_ConditionalAccessPolicy;
}