import { getSiteSourceMapping, getSiteSourceMappings } from "@/lib/actions/server/sources/site-source-mappings";
import { Debug, Timer } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Database, Tables, TablesInsert } from "@/types/database";
import { createClient } from "@/utils/supabase/server";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import { getUsers } from "@/lib/actions/server/sources/microsoft/users";
import { getAuthenticationMethods, getConditionalAccessPolicies, getLicenses, getSecurityDefaultsEnabled } from "@/lib/actions/server/sources/microsoft/identity";
import { deleteSourceIdentityLicense, getSourceIdentities, getSourceIdentityLicenses, putSourceIdentities, putSourceIdentityLicenses, updateSourceIdentity } from "@/lib/actions/server/sources/source-identities";
import { deleteSourcePolicy, putSourcePolicies, getSourcePolicies, updateSourcePolicy } from "@/lib/actions/server/sources/source-policices";
import { getSourceLicenseCapabilities } from "@/lib/actions/server/sources/source-license";
import { putSourceMetric } from "@/lib/actions/server/sources/source-metrics";

export async function getGraphClient(sourceId: string, siteId: string): Promise<ActionResponse<Client>> {
  try {
    const mapping = await getSiteSourceMapping(sourceId, siteId);
    if (!mapping.ok) {
      throw new Error(mapping.error.message);
    }

    const credential = new ClientSecretCredential(
      mapping.data.external_id,
      (mapping.data.metadata as any).client_id,
      (mapping.data.metadata as any).client_secret
    );

    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
          return tokenResponse?.token!;
        },
      },
    });

    return {
      ok: true,
      data: client
    }

  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-graph-client',
      message: String(err),
      time: new Date()
    });
  }
}

export async function syncMicrosoft365(integration: Tables<'source_integrations'>, siteIds?: string[]): Promise<ActionResponse<null>> {
  try {
    const timer = new Timer('Microsoft-365-Sync');
    const supabase = await createClient();

    const siteMappings = await getSiteSourceMappings(integration.source_id, siteIds);
    if (!siteMappings.ok) {
      throw new Error(siteMappings.error.message);
    }

    for await (const mapping of siteMappings.data) {
      try {
        await syncMapping(mapping);
      } catch { }
    }

    const { error } = await supabase.from('source_integrations').update({
      last_sync_at: new Date().toISOString(),
    }).eq('id', integration?.id || "");

    if (error) {
      throw new Error(error.message);
    }

    timer.summary();

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'sync-microsoft-365',
      message: String(err),
      time: new Date()
    });
  }
}

export async function syncMapping(mapping: Tables<'site_source_mappings'>): Promise<ActionResponse<null>> {
  const timer = new Timer('Microsoft-365-Sync-Mapping');

  try {
    timer.begin('get-internal');
    const identities = await getSourceIdentities(mapping.source_id, [mapping.site_id]);
    const identityLicenses = await getSourceIdentityLicenses(mapping.source_id, [mapping.site_id]);
    const policices = await getSourcePolicies(mapping.source_id, [mapping.site_id]);
    const capabilities = await getSourceLicenseCapabilities('Microsoft');
    timer.end('get-internal');

    timer.begin('get-external');
    const users = await getUsers(mapping);
    const licenses = await getLicenses(mapping);
    const securityDefaultsEnabled = await getSecurityDefaultsEnabled(mapping);
    const caPolicices = await getConditionalAccessPolicies(mapping);
    timer.end('get-external');

    if (!identities.ok || !identityLicenses.ok || !policices.ok || !users.ok
      || !licenses.ok || !securityDefaultsEnabled.ok || !caPolicices.ok || !capabilities.ok) {
      throw new Error('Failed to fetch resources');
    }

    timer.begin('parse-policies');
    const deletePolicies = policices.data.filter((p) => {
      const exists = caPolicices.data.find((ca) => ca.displayName === p.name);
      return p.name !== 'Security Defaults' && exists === undefined;
    });

    const newPolicies: TablesInsert<'source_policies'>[] = [];
    for await (const policy of caPolicices.data) {
      const exists = policices.data.find((i) => policy.displayName === i.name);
      const value: TablesInsert<'source_policies'> = {
        tenant_id: mapping.tenant_id,
        source_id: mapping.source_id,
        site_id: mapping.site_id,

        type: 'conditional_access',
        name: policy.displayName,
        status: policy.state,

        metadata: policy,
        created_at: new Date().toISOString()
      };

      if (exists) {
        await updateSourcePolicy(exists.id, value);
      } else newPolicies.push(value);
    }
    timer.end('parse-policies');

    {
      const exists = policices.data.find((i) => 'Security Defaults' === i.name);
      const value: TablesInsert<'source_policies'> = {
        tenant_id: mapping.tenant_id,
        source_id: mapping.source_id,
        site_id: mapping.site_id,

        type: 'security_defaults',
        name: 'Security Defaults',
        status: securityDefaultsEnabled.data ? 'enabled' : 'disabled',

        metadata: {},
        created_at: new Date().toISOString()
      };

      if (exists) {
        await updateSourcePolicy(exists.id, value);
      } else newPolicies.push(value);
    }

    if (newPolicies.length > 0) {
      timer.begin('insert-policies');
      const insertPolicices = await putSourcePolicies(newPolicies);
      if (insertPolicices.ok) policices.data.push(...insertPolicices.data);
      timer.end('insert-policies');
    }

    if (deletePolicies.length > 0) {
      timer.begin('delete-policies');
      for await (const policy of deletePolicies) {
        await deleteSourcePolicy(policy.id);
      }
      timer.end('delete-policies');
    }

    timer.begin('parse-identities');
    const deleteIdentities = identities.data.filter((i) => {
      const exists = users.data.find((u) => u.id === i.external_id);
      return exists === undefined;
    });

    const newIdentities: TablesInsert<'source_identities'>[] = [];
    for await (const user of users.data) {
      const exists = identities.data.find((i) => user.id === i.external_id);
      const mfaMethods = await getAuthenticationMethods(user.id, mapping);
      const value: TablesInsert<'source_identities'> = {
        tenant_id: mapping.tenant_id,
        source_id: mapping.source_id,
        site_id: mapping.site_id,
        external_id: user.id,
        enabled: user.accountEnabled,
        email: user.userPrincipalName,
        display_name: user.displayName,
        mfa_enforced: securityDefaultsEnabled.data,
        enforcement_type: securityDefaultsEnabled.data ? 'security_defaults' : 'none',
        mfa_methods: mfaMethods.ok ? mfaMethods.data : [],
        last_activity: user.signInActivity && user.signInActivity.lastSignInDateTime,
        metadata: user,
        created_at: new Date().toISOString()
      };

      if (exists) {
        await updateSourceIdentity(exists.id, value);
      } else newIdentities.push(value);
    }
    timer.end('parse-identities');

    if (newIdentities.length > 0) {
      timer.begin('insert-identities');
      const insertIdentities = await putSourceIdentities(newIdentities);
      if (insertIdentities.ok) identities.data.push(...insertIdentities.data);
      timer.end('insert-identities');
    }

    if (deleteIdentities.length > 0) {
      timer.begin('delete-identities');
      for await (const identity of deleteIdentities) {
        await deleteSourcePolicy(identity.id);
      }
      timer.end('delete-identities');
    }

    timer.begin('parse-licenses');
    const deleteLicenses: Tables<'source_identity_licenses'>[] = [];
    const newLicenses: TablesInsert<'source_identity_licenses'>[] = [];
    for await (const identity of identities.data) {
      const assignedLicenseIds = (identity.metadata as any)?.assignedLicenses?.map((al: any) => al.skuId) || [];
      const assignedLicenses = licenses.data.filter((s) => assignedLicenseIds.includes(s.skuId));
      const deleteLicensesForIdentity = identityLicenses.data.filter((il) => {
        il.identity_id === identity.id && !assignedLicenseIds.includes((il.metadata as any).skuId);
      });
      deleteLicenses.push(...deleteLicensesForIdentity);

      for await (const license of assignedLicenses) {
        const exists = identityLicenses.data.find((il) => il.sku === license.skuPartNumber && il.identity_id === identity.id);
        const capability = capabilities.data.find((c) => c.sku === license.skuPartNumber);
        const value: TablesInsert<'source_identity_licenses'> = {
          tenant_id: mapping.tenant_id,
          source_id: mapping.source_id,
          site_id: mapping.site_id,
          identity_id: identity.id,

          sku: license.skuPartNumber,
          display_name: capability ? capability.name : license.skuPartNumber,
          assigned_at: new Date().toISOString(),
          is_active: true,
          enabled_services: license.servicePlans?.map((sp) => sp.servicePlanName) || [],

          metadata: license,
          created_at: new Date().toISOString()
        }

        if (!exists && value.enabled_services.length > 0) newLicenses.push(value);
      }
    }
    timer.end('parse-licenses');

    if (newLicenses.length > 0) {
      timer.begin('insert-licenses');
      const insertLicenses = await putSourceIdentityLicenses(newLicenses);
      if (insertLicenses.ok) identityLicenses.data.push(...insertLicenses.data);
      timer.end('insert-licenses');
    }

    if (deleteLicenses.length > 0) {
      timer.begin('delete-licenses');
      for await (const license of deleteLicenses) {
        await deleteSourceIdentityLicense(license.id);
      }
      timer.end('delete-licenses');
    }

    timer.begin('parse-metrics');
    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'Total Identities',
      metric: identities.data.length,
      unit: 'identities',
      total: null,
      route: '/sources/microsoft-365',
      filters: { tab: "identities" },
      metadata: {},
      is_historic: false,
      visual: null,
      thresholds: null,
      created_at: new Date().toISOString()
    });

    await putSourceMetric({
      id: "",
      tenant_id: mapping.tenant_id,
      site_id: mapping.site_id,
      source_id: mapping.source_id,
      name: 'CA Capable',
      metric: identities.data.filter((i) => {
        return identityLicenses.data.filter((il) => {
          return i.id === il.identity_id && (il.enabled_services.includes('AAD_PREMIUM') || il.enabled_services.includes('AAD_PREMIUM_P2'));
        }).length > 0;
      }).length,
      unit: 'identities',
      total: identities.data.length,
      route: '/sources/microsoft-365',
      filters: { tab: "identities", search: "" },
      metadata: {},
      is_historic: false,
      visual: 'progress',
      thresholds: { 'info': 100, 'warn': 50, 'highest': true },
      created_at: new Date().toISOString()
    });
    timer.end('parse-metrics');

    timer.summary();

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    timer.summary();

    return Debug.error({
      module: 'Microsoft-365',
      context: 'sync-mapping',
      message: String(err),
      time: new Date()
    });
  }
}