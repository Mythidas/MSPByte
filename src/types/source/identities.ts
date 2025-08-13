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
