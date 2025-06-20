'use server';

import { createAdminClient, createClient } from '@/db/server';
import { loginFormSchema } from '@/lib/forms/auth';
import { inviteFormSchema } from '@/lib/forms/users';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: any, params: FormData) {
  const valid = loginFormSchema.safeParse({
    email: params.get('email'),
    password: params.get('password'),
  });
  const supabase = await createClient();

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const user = await supabase.auth.signInWithPassword({
    email: valid.data.email,
    password: valid.data.password,
  });

  if (user.error) {
    return {
      success: false,
      values: Object.fromEntries(params.entries()),
      message: 'Failed to authenticate user. Invalid Email or Password.',
    };
  }

  await supabase
    .from('users')
    .update({
      last_login: new Date().toISOString(),
    })
    .eq('id', user.data.user.id);

  return redirect('/');
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/auth/login');
}

export const registerAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const valid = inviteFormSchema.safeParse({
    code: params.get('code'),
    password: params.get('password'),
  });

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const { data: invite } = await supabase
    .from('invites')
    .select()
    .eq('id', valid.data.code)
    .single();

  if (!invite) {
    return {
      success: false,
      values: Object.fromEntries(params.entries()),
      message: 'Failed to find invite.',
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: invite.email,
    password: valid.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_ORIGIN}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      values: Object.fromEntries(params.entries()),
      message: error.code + ' ' + error.message,
    };
  } else {
    if (data.user) {
      const supabaseAdmin = await createAdminClient();
      const { data: user } = await supabaseAdmin
        .from('users')
        .select()
        .eq('id', data.user.id)
        .single();
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          tenant_id: user.tenant_id,
          role_id: user.role_id,
        },
      });
    }

    return {
      success: true,
      values: Object.fromEntries(params.entries()),
      message: 'Thank you for Registering! Check your email for a confirmation.',
    };
  }
};
