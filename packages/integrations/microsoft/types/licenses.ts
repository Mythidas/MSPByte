export type MSGraphSubscribedSku = {
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
};

export type MSGraphLicenseUnitsDetail = {
  enabled: number;
  suspended: number;
  warning: number;
  lockedOut: number;
};

export type MSGraphServicePlanInfo = {
  servicePlanId: string; // GUID
  servicePlanName: string;
  provisioningStatus: string;
  appliesTo?: string;
};
