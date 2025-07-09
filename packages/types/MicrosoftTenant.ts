export type MicrosoftTenantMetadata = {
  domains: string[];
  client_id: string;
  client_secret: string;
  mfa_enforcement: 'conditional_access' | 'security_defaults' | 'none';
};
