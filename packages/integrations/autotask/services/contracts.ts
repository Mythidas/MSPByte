import {
  AutoTaskIntegrationConfig,
  AutoTaskResponse,
  AutoTaskSearch,
} from '@/integrations/autotask/types';
import {
  AutoTaskContract,
  AutoTaskContractService,
  AutoTaskContractServiceUnits,
} from '@/integrations/autotask/types/contract';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getActiveContracts(
  config: AutoTaskIntegrationConfig
): Promise<APIResponse<AutoTaskContract[]>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const search: AutoTaskSearch<AutoTaskContract> = {
      filter: [
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
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveCompanies',
      message: String(err),
    });
  }
}

export async function getContractServices(
  config: AutoTaskIntegrationConfig,
  contractIds: string[]
): Promise<APIResponse<AutoTaskContractService[]>> {
  try {
    const search: AutoTaskSearch<AutoTaskContractService> = {
      filter: [{ op: 'in', field: 'contractID', value: contractIds }],
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
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveCompanies',
      message: String(err),
    });
  }
}

export async function getContractServiceUnits(
  config: AutoTaskIntegrationConfig,
  contractIds: string[]
): Promise<APIResponse<AutoTaskContractServiceUnits[]>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const search: AutoTaskSearch<AutoTaskContractServiceUnits> = {
      filter: [
        { op: 'in', field: 'contractID', value: contractIds },
        { op: 'lte', field: 'startDate', value: today.toISOString() },
        { op: 'gte', field: 'endDate', value: today.toISOString() },
      ],
    };
    const response = await fetch(
      `https://${config.server}/ATServicesRest/V1.0/ContractServiceUnits/query?search=${JSON.stringify(search)}`,
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

    const json = (await response.json()) as AutoTaskResponse<AutoTaskContractServiceUnits>;

    return {
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveCompanies',
      message: String(err),
    });
  }
}
