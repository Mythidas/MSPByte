'use server'

import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getClients(): Promise<ActionResponse<Tables<'clients'>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'clients',
      context: 'get-clients',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getClient(id: string): Promise<ActionResponse<Tables<'clients'>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'clients',
      context: 'get-client',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSites(clientId?: string): Promise<ActionResponse<Tables<'sites'>[]>> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('sites')
      .select('*')
      .order('name', { ascending: true });
    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query;

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'clients',
      context: 'get-sites',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getSite(id: string): Promise<ActionResponse<Tables<'sites'>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'clients',
      context: 'get-site',
      message: String(err),
      time: new Date()
    });
  }
}