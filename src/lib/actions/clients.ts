'use server'

import { clientFormSchema, siteFormSchema } from "@/lib/forms/clients";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const createClientAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const validation = clientFormSchema.safeParse({
    id: params.get("id"),
    tenant_id: params.get("tenant_id"),
    name: params.get('name')
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  const { data, error } = await supabase.from('clients').insert({
    tenant_id: validation.data.tenant_id,
    name: validation.data.name
  }).select().single();

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(`/clients`);
};

export const createSiteAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const validation = siteFormSchema.safeParse({
    id: params.get("id"),
    client_id: params.get('client_id'),
    tenant_id: params.get("tenant_id"),
    name: params.get('name')
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  const { error } = await supabase.from('sites').insert({
    tenant_id: validation.data.tenant_id,
    client_id: validation.data.client_id,
    name: validation.data.name
  }).select().single();

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(`/clients/${validation.data.client_id}`);
};