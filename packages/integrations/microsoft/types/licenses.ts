export interface MSGraphSubscribedSku {
  accountId: string;
  accountName: string;
  appliesTo: string;
  capabilityStatus: string;
  consumedUnits: number;
  id: string; // GUID
  prepaidUnits: MSGraphLicenseUnitsDetail;
  servicePlans: MSGraphServicePlanInfo[];
  skuId: string; // GUID
  skuPartNumber: string;
  subscriptionIds?: string[];
}

export interface MSGraphLicenseUnitsDetail {
  enabled: number;
  suspended: number;
  warning: number;
}

export interface MSGraphServicePlanInfo {
  servicePlanId: string; // GUID
  servicePlanName: string;
  provisioningStatus: string;
  appliesTo?: string;
}