'use server';

import { createAdminClient, createClient } from '@/db/server';
import { deleteFormSchema } from '@/lib/forms';
import { userFormSchema } from '@/lib/forms/users';
import { sendEmail } from '@/services/email';
import { redirect } from 'next/navigation';

export const createUserAction = async (_prevState: unknown, params: FormData) => {
  const supabase = await createClient();
  const validation = userFormSchema.safeParse({
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

  const supabaseAdmin = await createAdminClient();
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: validation.data.email,
    email_confirm: true,
    app_metadata: {
      tenant_id: validation.data.tenant_id,
      role_id: validation.data.role_id,
    },
  });

  if (createError) {
    return {
      success: false,
      errors: { db: [createError.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: createData.user.id,
      name: validation.data.name,
      email: validation.data.email,
      role_id: validation.data.role_id,
      tenant_id: validation.data.tenant_id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      errors: { db: [error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  if (validation.data.send_email) {
    const email = await sendEmail({
      to: validation.data.email,
      subject: 'Set Your Password',
      html: `Click <a href="${process.env.NEXT_PUBLIC_ORIGIN}/auth/register?code=${createData.user.id}">here</a> to set your password and access your account.`,
    });

    if (email.error) {
      return {
        success: false,
        message: email.error.name,
        values: Object.fromEntries(params.entries()),
      };
    }
  }

  return {
    success: true,
    values: data,
  };
};

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
