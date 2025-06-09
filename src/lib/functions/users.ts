'use server'

import { Tables } from "@/types/database";
import { createAdminClient, createClient } from "@/utils/supabase/server"

export async function getUsers(): Promise<Tables<'users'>[]> {
  const supabase = await createClient();
  const users = await supabase.from('users').select('*');
  return users.data || [];
}

export async function getUser(id: string): Promise<Tables<'users'> | null> {
  const supabase = await createClient();
  const users = await supabase.from('users').select('*').eq('id', id).single();
  return users.data;
}

export async function getInvites(): Promise<Tables<'invites'>[]> {
  const supabase = await createClient();
  const invites = await supabase.from('invites').select('*');
  return invites.data || [];
}