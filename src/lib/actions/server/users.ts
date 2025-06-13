'use server'

import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server"

export async function getUsers(): Promise<ActionResponse<Tables<'users'>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*');

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'users',
      context: 'get-user',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getUser(id: string): Promise<ActionResponse<Tables<'users'>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'users',
      context: 'get-user',
      message: String(err),
      time: new Date()
    });
  }
}

export async function getInvites(): Promise<ActionResponse<Tables<'invites'>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('invites').select('*');

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'users',
      context: 'get-invites',
      message: String(err),
      time: new Date()
    });
  }
}