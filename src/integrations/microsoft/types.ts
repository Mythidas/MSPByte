export type MicrosoftIdentityMetadata = {
  id: string;
  roles: { id: string; displayName: string }[];
  groups: { id: string; displayName: string }[];
  userType: 'Member' | 'Guest';
  displayName: string;
  assignedPlans: any[]; // Can be refined if structure is known
  accountEnabled: boolean;
  proxyAddresses: string[];
  assignedLicenses: any[]; // Can be refined if structure is known
  userPrincipalName: string;
  valid_mfa_license: boolean;
};

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

export interface MicrosoftPolicyMetadata {
  id: string;
  state: 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced';
  displayName: string;
  templateId?: string;
  createdDateTime: string;
  modifiedDateTime?: string;
  conditions: {
    users?: {
      includeUsers: string[];
      excludeUsers: string[];
      includeGroups: string[];
      excludeGroups: string[];
      includeRoles: string[];
      excludeRoles: string[];
    };
    applications?: {
      includeApplications: string[];
      excludeApplications: string[];
    };
    platforms?: {
      includePlatforms?: string[];
    };
    locations?: {
      includeLocations?: string[];
      excludeLocations?: string[];
    };
    clientAppTypes?: string[];
    userRiskLevels?: string[];
    signInRiskLevels?: string[];
  };
  grantControls?: {
    operator: 'AND' | 'OR';
    builtInControls?: string[];
    termsOfUse?: string[];
    customAuthenticationFactors?: string[];
  };
  sessionControls?: {
    applicationEnforcedRestrictions?: any;
    cloudAppSecurity?: any;
    signInFrequency?: any;
    persistentBrowser?: any;
  };
}

export type MicrosoftTenantMetadata = {
  domains?: string[];
  client_id: string;
  client_secret: string;
  mfa_enforcement: 'conditional_access' | 'security_defaults' | 'none';
};
