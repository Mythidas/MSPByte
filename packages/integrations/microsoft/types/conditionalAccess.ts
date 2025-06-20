export type MSGraphConditionalAccessPolicy = {
  id: string;
  displayName: string;
  state: 'enabled' | 'disabled' | 'enabledForReportingButNotEnforced' | string;

  createdDateTime: string;     // ISO 8601 timestamp
  modifiedDateTime: string;    // ISO 8601 timestamp

  conditions: MSGraphConditionalAccessConditionSet;
  grantControls: MSGraphConditionalAccessGrantControls;
  sessionControls: MSGraphConditionalAccessSessionControls;
};

export type MSGraphConditionalAccessConditionSet = {
  // e.g. users, applications, platforms, locations, etc.
  [key: string]: any;
};

export type MSGraphConditionalAccessGrantControls = {
  builtInControls?: string[];      // ["mfa", "compliantDevice", etc.]
  operator?: 'AND' | 'OR';
  termsOfUse?: string[];           // IDs of TOU policies
  customAuthenticationFactors?: string[];
};

export type MSGraphConditionalAccessSessionControls = {
  // e.g. application enforced restrictions, persistent browser session, sign-in frequency
  [key: string]: any;
};
