'use server'

import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getRoles(): Promise<ActionResponse<Tables<'roles'>[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('roles').select('*');

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'roles',
      context: 'get-roles',
      message: String(err),
      time: new Date()
    });
  }
}