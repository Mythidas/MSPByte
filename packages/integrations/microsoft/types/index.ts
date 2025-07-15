export type MicrosoftTenantMetadata = {
  domains?: string[];
  client_id: string;
  client_secret: string;
  mfa_enforcement: 'conditional_access' | 'security_defaults' | 'none';
};

export type MicrosoftIdentityMetadata = {
  id: string;
  roles: string[];
  groups: string[];
  userType: 'Member' | 'Guest';
  displayName: string;
  assignedPlans: any[]; // Can be refined if structure is known
  accountEnabled: boolean;
  proxyAddresses: string[];
  assignedLicenses: any[]; // Can be refined if structure is known
  userPrincipalName: string;
  valid_mfa_license: boolean;
};
