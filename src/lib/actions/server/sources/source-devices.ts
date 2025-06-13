'use server'

import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getSourceDevices(sourceId?: string, siteId?: string): Promise<ActionResponse<Tables<'source_devices_view'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase.from('source_devices_view').select('*').order('site_name').order('hostname');
    if (sourceId) query = query.eq('source_id', sourceId);
    if (siteId) query = query.eq('site_id', siteId);

    const { data, error } = await query;

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'get-source-devices',
      message: String(err),
      time: new Date()
    });
  }
}

export async function putSourceDevice(device: Tables<'source_devices'>): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('source_devices').insert({
      ...device,
      id: undefined
    });

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'put-source-devices',
      message: String(err),
      time: new Date()
    });
  }
}

export async function updateSourceDevice(device: Tables<'source_devices'>): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('source_devices').update({
      ...device
    }).eq('id', device.id);

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'update-source-device',
      message: String(err),
      time: new Date()
    });
  }
}

export async function deleteSourceDevice(id: string): Promise<ActionResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('source_devices').delete().eq('id', id);

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data: null
    }
  } catch (err) {
    return Debug.error({
      module: 'integrations',
      context: 'delete-source-device',
      message: String(err),
      time: new Date()
    });
  }
}