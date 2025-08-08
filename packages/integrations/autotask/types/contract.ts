import { AutoTaskUserDefinedField } from '@/integrations/autotask/types';

export type AutoTaskContract = {
  id: number;
  billingPreference: number;
  billToCompanyContactID: number | null;
  billToCompanyID: number | null;
  companyID: number;
  contactID: number;
  contactName: string;
  contractCategory: number;
  contractExclusionSetID: number | null;
  contractName: string;
  contractNumber: string | null;
  contractPeriodType: number;
  contractType: number;
  description: string | null;
  endDate: string; // ISO date string
  estimatedCost: number;
  estimatedHours: number;
  estimatedRevenue: number;
  exclusionContractID: number | null;
  internalCurrencyOverageBillingRate: number | null;
  internalCurrencySetupFee: number;
  isCompliant: boolean;
  isDefaultContract: boolean;
  lastModifiedDateTime: string; // ISO date string
  opportunityID: number;
  organizationalLevelAssociationID: number;
  overageBillingRate: number | null;
  purchaseOrderNumber: string;
  renewedContractID: number | null;
  serviceLevelAgreementID: number | null;
  setupFee: number;
  setupFeeBillingCodeID: number | null;
  startDate: string; // ISO date string
  status: number;
  timeReportingRequiresStartAndStopTimes: number;
  userDefinedFields: AutoTaskUserDefinedField[];
};

export type AutoTaskContractService = {
  id: number;
  contractID: number;
  internalCurrencyAdjustedPrice: number;
  internalCurrencyUnitPrice: number;
  internalDescription: string;
  invoiceDescription: string;
  quoteItemID: number;
  serviceID: number;
  unitCost: number;
  unitPrice: number;
};
