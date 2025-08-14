'use server';

import { createAdminClient, createClient } from '@/db/server';
import { deleteFormSchema } from '@/shared/lib/forms';
import { userFormSchema } from '@/shared/lib/forms/users';
import { redirect } from 'next/navigation';

export const editUserAction = async (_prevState: unknown, params: FormData) => {
  const supabase = await createClient();
  const validation = userFormSchema.safeParse({
    id: params.get('id'),
    name: params.get('name'),
    email: params.get('email'),
    role_id: params.get('role_id'),
    tenant_id: params.get('tenant_id'),
    send_email: params.get('send_email') === 'on',
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error?.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const { error } = await supabase
    .from('users')
    .update({
      name: validation.data.name,
      role_id: validation.data.role_id,
    })
    .eq('id', validation.data.id || '');

  if (error) {
    return {
      success: false,
      errors: { db: [error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  return redirect(`/users/${validation.data.id}`);
};

export const deleteUserAction = async (_prevState: unknown, params: FormData) => {
  const supabase = await createClient();
  const validation = deleteFormSchema.safeParse({
    id: params.get('id'),
    url: params.get('url'),
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const { error } = await supabase.from('users').delete().eq('id', validation.data.id);

  if (error) {
    return {
      success: false,
      errors: { db: [error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  const supabaseAdmin = await createAdminClient();
  await supabaseAdmin.auth.admin.deleteUser(validation.data.id);

  return redirect(validation.data.url || '/users');
};
