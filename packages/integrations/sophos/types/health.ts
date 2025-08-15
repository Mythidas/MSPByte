type ProtectionDetail = {
  score: number;
  total: number;
  notFullyProtected: number;
  snoozed: boolean;
};

type PolicyDetail = {
  score: number;
  total: number;
  notOnRecommended: number;
  snoozed: boolean;
  policies: string[];
};

type Policy = {
  computer: {
    'threat-protection': PolicyDetail;
  };
  server: {
    'server-threat-protection': PolicyDetail;
  };
};

type Exclusion = {
  score: number;
  total: number;
  numberOfSecurityRisks: number;
  lockedByManagingAccount: boolean;
  snoozed: boolean;
};

type Exclusions = {
  policy: {
    computer: Omit<Exclusion, 'lockedByManagingAccount'>; // Replace with more specific type if available
    server: Omit<Exclusion, 'lockedByManagingAccount'>;
  };
  global: Omit<Exclusion, 'total'>;
};

type TamperProtectionDetail = {
  score: number;
  total: number;
  disabled: number;
  snoozed: boolean;
};

type TamperProtection = {
  computer: TamperProtectionDetail;
  server: TamperProtectionDetail;
  globalDetail: {
    score: number;
    enabled: boolean;
    snoozed: boolean;
  };
  global: boolean;
};

export type SPHealthCheckEndpoint = {
  protection: {
    computer: ProtectionDetail;
    server: ProtectionDetail;
  };
  policy: Policy;
  exclusions: Exclusions;
  tamperProtection: TamperProtection;
};

type FirewallAutomaticBackup = {
  score: number;
  total: number;
  notOnRecommended: number;
  snoozed: boolean;
  schedule: any; // Replace with actual schedule type if known
};

export type SPHealthCheckNetworkDevice = {
  firewall: {
    firewallAutomaticBackup: FirewallAutomaticBackup;
  };
};

export type SPHealthCheck = {
  endpoint: SPHealthCheckEndpoint;
  networkDevice: SPHealthCheckNetworkDevice;
};
