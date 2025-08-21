export type SPFirewallLicense = {
  serialNumber: string;
  owner: {
    id: string;
    type: 'partner' | 'tenant' | string; // flexible if more possible
  };
  partner: {
    id: string;
  };
  tenant: Record<string, unknown>; // currently empty, refine if you know the shape
  billingTenant: {
    id: string;
  };
  model: string;
  modelType: 'hardware' | 'virtual' | string;
  lastSeenAt: string;
  endDate: string;
  licenses: {
    id: string;
    licenseIdentifier: string;
    product: {
      code: string;
      name: string;
      genericCode: string;
    };
    startDate: string; // ISO date
    endDate: string; // ISO date
    perpetual: boolean;
    type: 'usage' | 'perpetual' | string;
    quantity: number;
    usage: {
      current: {
        count: number;
      };
    };
  }[];
};
