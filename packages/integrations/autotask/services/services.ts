import {
  AutoTaskIntegrationConfig,
  AutoTaskResponse,
  AutoTaskSearch,
} from '@/integrations/autotask/types';
import { AutoTaskService } from '@/integrations/autotask/types/service';
import Debug from '@/shared/lib/Debug';
import { APIResponse } from '@/shared/types';

export async function getActiveServices(
  config: AutoTaskIntegrationConfig
): Promise<APIResponse<AutoTaskService[]>> {
  try {
    const search: AutoTaskSearch<AutoTaskService> = {
      filter: [{ op: 'eq', field: 'isActive', value: true }],
    };
    const response = await fetch(
      `https://${config.server}/ATServicesRest/V1.0/Services/query?search=${JSON.stringify(search)}`,
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

    const json = (await response.json()) as AutoTaskResponse<AutoTaskService>;

    return {
      data: json.items,
    };
  } catch (err) {
    return Debug.error({
      module: 'AutoTask',
      context: 'getActiveServices',
      message: String(err),
    });
  }
}
