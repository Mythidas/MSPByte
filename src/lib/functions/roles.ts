'use server'

import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getRoles(): Promise<Tables<'roles'>[]> {
  const supabase = await createClient();
  const roles = await supabase.from('roles').select('*');
  return roles.data || [];
}