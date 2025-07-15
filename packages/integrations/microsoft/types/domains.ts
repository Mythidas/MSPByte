export type MSGraphDomain = {
  id: string;
  authenticationType: string;
  availabilityStatus: string;
  isAdminManaged: boolean;
  isDefault: boolean;
  isInitial: boolean;
  isRoot: boolean;
  isVerified: boolean;
  supportedServices: string[];
};
