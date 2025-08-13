export interface MicrosoftLicenseMetadata {
  skuId: string;
  accountId: string;
  appliesTo: string;
  accountName: string;
  prepaidUnits: {
    enabled: number;
    warning: number;
    lockedOut: number;
    suspended: number;
  };
  servicePlans: Array<{
    appliesTo: string;
    servicePlanId: string;
    servicePlanName: string;
    provisioningStatus: string;
  }>;
  consumedUnits: number;
  skuPartNumber: string;
  capabilityStatus: string;
}
