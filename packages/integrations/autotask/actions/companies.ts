import {
  AutoTaskIntegrationConfig,
  AutoTaskResponse,
  AutoTaskSearch,
} from '@/integrations/autotask/types';
import { AutoTaskCompany } from '@/integrations/autotask/types/company';
import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';

export async function getActiveCompanies(
  config: AutoTaskIntegrationConfig
): Promise<APIResponse<AutoTaskCompany[]>> {
  try {
    const search: AutoTaskSearch<AutoTaskCompany> = {
      filter: [
        { op: 'eq', field: 'isActive', value: true },
        { op: 'eq', field: 'companyType', value: 1 },
      ],
    };
    const response = await fetch(
      `https://${config.server}/ATServicesRest/V1.0/Companies/query?search=${JSON.stringify(search)}`,
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

    const json = (await response.json()) as AutoTaskResponse<AutoTaskCompany>;

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
