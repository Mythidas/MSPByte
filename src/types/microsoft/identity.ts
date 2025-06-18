export const G_RequiredSubscribedSkuFields = [
  'id',
  'skuId',
  'skuPartNumber',
  'consumedUnits',
  'prepaidUnits',
  'servicePlans'
] as const;
export const G_AllowedSubscribedSkuServicePlans = [
  'AAD_PREMIUM', 'AAD_PREMIUM_P2', 'INTUNE_O365', 'MICROSOFT_DEFENDER'
] as const;
export type G_SubscribedSku = {
  "accountId": string,
  "accountName": string,
  "appliesTo": string,
  "capabilityStatus": string,
  "consumedUnits": "Int32",
  "id": "String (identifier)",
  "prepaidUnits": { "@odata.type": "microsoft.graph.licenseUnitsDetail" },
  "servicePlans": {
    servicePlanId: string,
    servicePlanName: string,
    provisioningStatus: string,
    appliesTo: string
  }[],
  "skuId": string,
  "skuPartNumber": string,
  "subscriptionIds": [string]
};
export type G_SubscribedSkuShape = Partial<G_SubscribedSku> & Pick<G_SubscribedSku, typeof G_RequiredSubscribedSkuFields[number]>;

export type G_AuthenticationMethod = {
  "id": string
  "type": "email" | "fido2" | "app" | "sms" | "software" | "hello"
  "displayName"?: string
};

export type G_ConditionalAccessPolicy = {
  "conditions": { "@odata.type": "microsoft.graph.conditionalAccessConditionSet" },
  "createdDateTime": "String (timestamp)",
  "displayName": string,
  "grantControls": { "@odata.type": "microsoft.graph.conditionalAccessGrantControls" },
  "id": "String (identifier)",
  "modifiedDateTime": "String (timestamp)",
  "sessionControls": { "@odata.type": "microsoft.graph.conditionalAccessSessionControls" },
  "state": string
}