import {
  AutoTaskContract,
  AutoTaskContractService,
  AutoTaskContractServiceUnits,
} from '@/integrations/autotask/types/contract';
import { generateUUID } from '@/lib/utils';
import { Tables, TablesInsert } from '@/types/db';

export function transformContracts(
  contracts: AutoTaskContract[],
  job: Tables<'public', 'source_sync_jobs'>
): TablesInsert<'source', 'contracts'>[] {
  return contracts.map((contract) => ({
    id: generateUUID(),
    tenant_id: job.tenant_id,
    source_id: job.source_id,
    source_tenant_id: job.source_tenant_id!,
    site_id: job.site_id!,
    sync_id: job.id,

    external_id: contract.id.toString(),
    name: contract.contractName,
    status: contract.status === 0 ? 'inactive' : 'active',
    revenue: 0,
    start_at: contract.startDate,
    end_at: contract.endDate,

    metadata: contract,
  }));
}

export function transformContractServices(
  contracts: TablesInsert<'source', 'contracts'>[],
  services: AutoTaskContractService[],
  units: AutoTaskContractServiceUnits[],
  job: Tables<'public', 'source_sync_jobs'>
): TablesInsert<'source', 'contract_items'>[] {
  return services.map((service) => ({
    tenant_id: job.tenant_id,
    source_id: job.source_id,
    source_tenant_id: job.source_tenant_id!,
    site_id: job.site_id!,
    sync_id: job.id,
    contract_id: contracts.find((c) => c.external_id === service.contractID.toString())?.id || '',

    external_id: service.id.toString(),
    name: service.invoiceDescription,
    sku: service.serviceID.toString(),
    unit_price: service.unitPrice,
    unit_cost: service.unitCost,
    quantity: units.find((u) => u.contractServiceID === service.id)?.units || 0,

    metadata: service,
  }));
}
