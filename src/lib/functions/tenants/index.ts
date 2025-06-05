import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getTenant(): Promise<Tables<'tenants'> | null> {
  const supabase = await createClient();
  const tenant = await supabase.from('tenants').select().single();
  return tenant.data;
}