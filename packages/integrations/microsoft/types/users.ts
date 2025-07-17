export type MSGraphUser = {
  id: string;
  userPrincipalName: string;
  userType: string;
  displayName?: string;
  accountEnabled?: boolean;
  mail?: string;
  mailNickname?: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
  state?: string;
  country?: string;
  city?: string;
  streetAddress?: string;
  postalCode?: string;
  usageLocation?: string;
  preferredLanguage?: string;

  // License & plans
  assignedLicenses?: {
    skuId: string;
    disabledPlans: string[];
  }[];
  assignedPlans?: {
    servicePlanId: string;
    service?: string;
    capabilityStatus?: string;
    assignedDateTime?: string;
  }[];
  licenseAssignmentStates?: any[]; // You can strongly type this later if needed

  // Sign-in
  signInActivity?: {
    lastSignInDateTime?: string;
    lastNonInteractiveSignInDateTime?: string;
    lastSignInRequestId?: string;
    lastNonInteractiveSignInRequestId?: string;
  };

  lastPasswordChangeDateTime?: string;
  signInSessionsValidFromDateTime?: string;

  // On-premises
  onPremisesSyncEnabled?: boolean;
  onPremisesLastSyncDateTime?: string;
  onPremisesSamAccountName?: string;
  onPremisesUserPrincipalName?: string;
  onPremisesSecurityIdentifier?: string;

  // Extended metadata
  identities?: {
    signInType: string;
    issuer: string;
    issuerAssignedId: string;
  }[];
  employeeId?: string;
  employeeType?: string;
  hireDate?: string;
  birthday?: string;
  creationType?: string;
  customSecurityAttributes?: Record<string, unknown>;

  // Misc
  aboutMe?: string;
  interests?: string[];
  skills?: string[];
  pastProjects?: string[];
  responsibilities?: string[];
  schools?: string[];
  preferredName?: string;

  // Relationships (optional: populated if expanded)
  photo?: {
    id?: string;
    height?: number;
    width?: number;
  };

  // Optional: Drop these if not used
  calendar?: any;
  calendars?: any[];
  drive?: any;
  mailboxSettings?: any;
  outlook?: any;
};

export type MSGraphUserContext = {
  id: string;
  groups: { id: string; displayName: string }[];
  roles: { id: string; displayName: string }[];
};
