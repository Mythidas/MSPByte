import { APIResponse, Timer, Debug } from '../../../../utils.ts';
import { Tables } from '../../../db/schema.ts';
import { getEndpoints } from '../services/endpoints/getEndpoints.ts';
import { transformDevices } from '../transforms/devices/transformDevices.ts';
import { syncDevices } from './syncDevices.ts';
import { syncMetrics } from './syncMetrics.ts';

export async function syncTenant(
  token: string,
  tenant: Tables<'source_tenants'>
): Promise<APIResponse<null>> {
  const timer = new Timer('syncSiteMapping', false);
  try {
    timer.begin('fetch-external');
    const endpoints = await getEndpoints(token, tenant);
    timer.end('fetch-external');

    if (!endpoints.ok) {
      throw new Error(endpoints.error.message);
    }

    timer.begin('transforms');
    const transformedDevices = transformDevices(tenant, endpoints.data);
    timer.end('transforms');

    timer.begin('syncs');
    const devices = await syncDevices(tenant, transformedDevices);
    if (!devices.ok) {
      throw new Error(devices.error.message);
    }

    const metrics = await syncMetrics(tenant, devices.data);
    timer.end('syncs');
    timer.summary();

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'SophosPartner',
      context: 'syncMapping',
      message: String(err),
      time: new Date(),
    });
  }
}
