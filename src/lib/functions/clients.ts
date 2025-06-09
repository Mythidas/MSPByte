'use server'

import { Tables } from "@/types/database";
import { createClient } from "@/utils/supabase/server";

export async function getClients(): Promise<Tables<'clients'>[]> {
  const supabase = await createClient();
  const clients = await supabase.from('clients').select();
  return clients.data || [];
}

export async function getClient(id: string): Promise<Tables<'clients'> | null> {
  const supabase = await createClient();
  const clients = await supabase.from('clients').select().eq('id', id).single();
  return clients.data;
}

export async function getSites(): Promise<Tables<'sites'>[]> {
  const supabase = await createClient();
  const sites = await supabase.from('sites').select();
  return sites.data || [];
}

export async function getSite(id: string): Promise<Tables<'sites'> | null> {
  const supabase = await createClient();
  const sites = await supabase.from('sites').select().eq('id', id).single();
  return sites.data;
}