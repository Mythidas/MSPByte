'use server';

import { Debug } from '@/lib/utils';
import { APIResponse } from '@/types';
import { createClient } from 'packages/db/server';
import { Tables } from 'packages/db/schema';

export async function getSourceDevices(
  sourceId?: string,
  siteIds?: string[]
): Promise<APIResponse<Tables<'source_devices_view'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('source_devices_view')
      .select('*')
      .order('site_name')
      .order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteIds) query = query.in('site_id', siteIds);

    let results = [];

    while (true) {
      const { data, error } = await query.range(results.length, results.length + 1000);

      if (error) throw new Error(error.message);

      results.push(...data);
      if (data.length < 1000) break;
    }

    return {
      ok: true,
      data: results,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-source-devices',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function putSourceDevice(
  device: Tables<'source_devices'>
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('source_devices').insert({
      ...device,
      id: undefined,
    });

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'put-source-devices',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function updateSourceDevice(
  device: Tables<'source_devices'>
): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('source_devices')
      .update({
        ...device,
      })
      .eq('id', device.id);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'update-source-device',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function deleteSourceDevice(id: string): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('source_devices').delete().eq('id', id);

    if (error) throw new Error(error.message);

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'delete-source-device',
      message: String(err),
      time: new Date(),
    });
  }
}
