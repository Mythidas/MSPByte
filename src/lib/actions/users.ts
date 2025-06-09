'use server'

import { deleteFormSchema } from "@/lib/forms";
import { userFormSchema } from "@/lib/forms/users";
import { createAdminClient, createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const editUserAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const validation = userFormSchema.safeParse({
    id: params.get('id'),
    name: params.get("name"),
    email: params.get("email"),
    role_id: params.get("role_id"),
    tenant_id: params.get("tenant_id"),
    send_email: params.get("send_email") === "on"
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error?.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  const { error } = await supabase.from('users').update({
    name: validation.data.name,
    role_id: validation.data.role_id
  }).eq('id', validation.data.id || "");

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(`/users/${validation.data.id}`);
}

export const deleteUserAction = async (_prevState: any, params: FormData) => {
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

  const { error } = await supabase.from("users").delete().eq("id", validation.data.id);

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  const supabaseAdmin = await createAdminClient();
  await supabaseAdmin.auth.admin.deleteUser(validation.data.id);

  return redirect(validation.data.url || "/users");
};

export const createInviteAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const validation = userFormSchema.safeParse({
    name: params.get("name"),
    email: params.get("email"),
    role_id: params.get("role_id"),
    tenant_id: params.get("tenant_id"),
    send_email: params.get("send_email") === "on"
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error?.flatten().fieldErrors,
      values: Object.fromEntries(params.entries())
    }
  }

  const { error } = await supabase.from('invites').insert({
    name: validation.data.name,
    email: validation.data.email,
    role_id: validation.data.role_id,
    tenant_id: validation.data.tenant_id
  });

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  if (validation.data.send_email) {
    // TODO: send email with link
  }

  return redirect("/users?tab=invites");
};

export const deleteInviteAction = async (_prevState: any, params: FormData) => {
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

  const { error } = await supabase.from('invites').delete().eq("id", validation.data.id);

  if (error) {
    return {
      success: false,
      errors: { "db": [error.message] },
      values: Object.fromEntries(params.entries())
    }
  }

  return redirect(validation.data.url || "/users?tab=invites");
};