import {
  AutoTaskIntegrationConfig,
  AutoTaskResponse,
  AutoTaskSearch,
} from '@/integrations/autotask/types';
import { AutoTaskContract, AutoTaskContractService } from '@/integrations/autotask/types/contract';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getActiveContracts(
  config: AutoTaskIntegrationConfig,
  companyId: string
): Promise<APIResponse<AutoTaskContract[]>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const search: AutoTaskSearch<AutoTaskContract> = {
      filter: [
        { op: 'eq', field: 'companyID', value: companyId },
        { op: 'lte', field: 'startDate', value: today.toISOString() },
        { op: 'gte', field: 'endDate', value: today.toISOString() },
      ],
    };
    const response = await fetch(
      `https://${config.server}/ATServicesRest/V1.0/Contracts/query?search=${JSON.stringify(search)}`,
      {
        method: 'GET',
        headers: {
          UserName: config.client_id,
          Secret: config.client_secret,
          ApiIntegrationCode: config.tracker_id,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as AutoTaskResponse<AutoTaskContract>;

    return {
      ok: true,
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveCompanies',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function getContractServices(
  config: AutoTaskIntegrationConfig,
  contractId: string
): Promise<APIResponse<AutoTaskContractService[]>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const search: AutoTaskSearch<AutoTaskContractService> = {
      filter: [{ op: 'eq', field: 'contractID', value: contractId }],
    };
    const response = await fetch(
      `https://${config.server}/ATServicesRest/V1.0/ContractServices/query?search=${JSON.stringify(search)}`,
      {
        method: 'GET',
        headers: {
          UserName: config.client_id,
          Secret: config.client_secret,
          ApiIntegrationCode: config.tracker_id,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = (await response.json()) as AutoTaskResponse<AutoTaskContractService>;

    return {
      ok: true,
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveCompanies',
      message: String(err),
      time: new Date(),
    });
  }
}
