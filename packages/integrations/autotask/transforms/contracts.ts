import {
  getContractServices,
  getContractServiceUnits,
} from '@/integrations/autotask/actions/contracts';
import { AutoTaskIntegrationConfig } from '@/integrations/autotask/types';
import { AutoTaskContract } from '@/integrations/autotask/types/contract';
import { AutoTaskService } from '@/integrations/autotask/types/service';
import { Debug, generateUUID, Timer } from '@/lib/utils';
import { APIResponse } from '@/types';
import { Tables, TablesInsert } from '@/types/db';

export function transformContracts(
  contracts: AutoTaskContract[],
  tenants: Tables<'source', 'tenants'>[],
  job: Tables<'source', 'sync_jobs'>
): TablesInsert<'source', 'contracts'>[] {
  const transform = contracts.map((contract) => {
    const tenant = tenants.find((t) => t.external_id === contract.companyID.toString());
    if (!tenant) return undefined;

    return {
      id: generateUUID(),
      tenant_id: tenant.tenant_id,
      source_id: tenant.source_id,
      source_tenant_id: tenant.id,
      site_id: tenant.site_id,
      sync_id: job.id,

      external_id: contract.id.toString(),
      name: contract.contractName,
      status: contract.status === 0 ? 'inactive' : 'active',
      revenue: 0,
      start_at: contract.startDate,
      end_at: contract.endDate,

      metadata: contract,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  return transform.filter((t) => !!t);
}

export async function transformContractServices(
  config: AutoTaskIntegrationConfig,
  services: AutoTaskService[],
  contracts: AutoTaskContract[],
  tenants: Tables<'source', 'tenants'>[],
  job: Tables<'source', 'sync_jobs'>
): Promise<APIResponse<TablesInsert<'source', 'contract_items'>[]>> {
  try {
    const contractServices = await getContractServices(
      config,
      contracts.map((c) => c.id.toString())
    );
    const serviceUnits = await getContractServiceUnits(
      config,
      contracts.map((c) => c.id.toString())
    );
    if (contractServices.error) throw contractServices.error.message;
    if (serviceUnits.error) throw serviceUnits.error.message;

    const contractItems = contractServices.data.map((service) => {
      const gService = services.find((s) => s.id === service.serviceID);
      const units = serviceUnits.data.find((u) => u.contractServiceID === service.id);
      const contract = contracts.find((c) => c.id === service.contractID);
      const tenant = tenants.find((t) => t.external_id === contract?.companyID.toString());
      if (!tenant) return undefined;

      return {
        id: generateUUID(),
        tenant_id: tenant.tenant_id,
        source_id: tenant.source_id,
        source_tenant_id: tenant.id,
        site_id: tenant.site_id,
        sync_id: job.id,

        external_contract_id: service.contractID.toString(),
        external_service_id: service.serviceID.toString(),
        external_id: service.id.toString(),
        name: gService?.name || service.invoiceDescription,
        sku: gService?.sku || '',
        unit_cost: service.unitCost,
        unit_price: service.unitPrice,
        quantity: units?.units || 0,

        metadata: service,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    return { data: contractItems.filter(Boolean) as TablesInsert<'source', 'contract_items'>[] };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'transformContractServices',
      message: String(err),
    });
  }
}
