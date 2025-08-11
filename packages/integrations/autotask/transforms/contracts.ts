import {
  AutoTaskContract,
  AutoTaskContractService,
  AutoTaskContractServiceUnits,
} from '@/integrations/autotask/types/contract';
import { AutoTaskService } from '@/integrations/autotask/types/service';
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
  services: AutoTaskService[],
  contractServices: AutoTaskContractService[],
  units: AutoTaskContractServiceUnits[],
  job: Tables<'public', 'source_sync_jobs'>
): TablesInsert<'source', 'contract_items'>[] {
  return contractServices.map((contractService) => {
    const service = services.find((s) => s.id === contractService.serviceID);

    return {
      tenant_id: job.tenant_id,
      source_id: job.source_id,
      source_tenant_id: job.source_tenant_id!,
      site_id: job.site_id!,
      sync_id: job.id,

      external_contract_id: contractService.contractID.toString(),
      external_id: contractService.id.toString(),
      name: service?.name || contractService.internalDescription,
      sku: service?.sku || '',
      unit_price: contractService.unitPrice,
      unit_cost: contractService.unitCost,
      quantity: units.find((u) => u.contractServiceID === contractService.id)?.units || 0,

      metadata: contractService,
    };
  });
}
