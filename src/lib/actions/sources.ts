'use server'

import { deleteFormSchema } from "@/lib/forms";
import { sophosPartnerFormSchema } from "@/lib/forms/sources";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const invalidIntegrationAction = async (_prevState: any, params: FormData) => {
  return {
    success: false,
    message: "Invalid action"
  }
}

export const createSophostIntegrationAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const valid = sophosPartnerFormSchema.safeParse({
    id: params.get("id"),
    tenant_id: params.get("tenant_id"),
    slug: params.get('slug'),
    client_id: params.get('client_id'),
    client_secret: params.get('client_secret'),
    enabled: params.get('enabled') === 'on'
  });

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  if (!valid.data.enabled) {
    return {
      success: false,
      values: Object.fromEntries(params.entries()),
      message: "Source not enabled."
    }
  }

  const { error } = await supabase.from('source_integrations').insert({
    source_id: valid.data.id,
    tenant_id: valid.data.tenant_id,
    config: {
      client_id: valid.data.client_id,
      client_secret: valid.data.client_secret
    }
  });

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(`/integrations/source/${valid.data.slug}?tab=configuration`);
};

export const editSophostIntegrationAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const valid = sophosPartnerFormSchema.safeParse({
    id: params.get("id"),
    tenant_id: params.get("tenant_id"),
    slug: params.get('slug'),
    client_id: params.get('client_id'),
    client_secret: params.get('client_secret'),
    enabled: params.get('enabled') === 'on'
  });

  const integration_id = params.get('integration_id')?.toString();
  const enabled = params.get('enabled')?.toString();
  if (enabled !== null && enabled !== 'on' && integration_id !== undefined) {
    await supabase.from('source_integrations').delete().eq('id', integration_id);
    return redirect(`/integrations/source/${params.get('slug')?.toString()}?tab=configuration`);
  }

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  if (!integration_id) {
    return {
      success: false,
      values: Object.fromEntries(params.entries()),
      message: "Invalid integration id"
    }
  }

  const { error } = await supabase.from('source_integrations').update({
    source_id: valid.data.id,
    tenant_id: valid.data.tenant_id,
    config: {
      client_id: valid.data.client_id,
      client_secret: valid.data.client_secret
    }
  }).eq('id', integration_id);

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(`/integrations/source/${valid.data.slug}?tab=configuration`);
};

export const deleteSiteSourceMapping = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const validation = deleteFormSchema.safeParse({
    id: params.get("id"),
    url: params.get("url")
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  const { error } = await supabase.from('site_source_mappings').delete().eq("id", validation.data.id);

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  if (validation.data.url)
    return redirect(validation.data.url);
  else return { success: true };
};