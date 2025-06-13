import { Debug } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getTenant(): Promise<ActionResponse<Tables<'tenants'>>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .single();

    if (error)
      throw new Error(error.message);

    return {
      ok: true,
      data
    }
  } catch (err) {
    return Debug.error({
      module: 'tenants',
      context: 'get-tenant',
      message: String(err),
      time: new Date()
    });
  }
}