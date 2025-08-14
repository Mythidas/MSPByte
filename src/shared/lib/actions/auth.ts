'use server';

import { createAdminClient } from '@/db/server';
import { loginFormSchema } from '@/shared/lib/forms/auth';
import { inviteFormSchema } from '@/shared/lib/forms/users';
import { login, logout } from '@/services/auth';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: unknown, params: FormData) {
  const valid = loginFormSchema.safeParse({
    email: params.get('email'),
    password: params.get('password'),
  });

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const result = await login(valid.data.email, valid.data.password);
  if (result.error) {
    return {
      success: false,
      errors: { auth: [result.error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  return redirect('/');
}

export async function signOutAction() {
  await logout();
  return redirect('/auth/login');
}

export const registerAction = async (_prevState: unknown, params: FormData) => {
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

  const supabaseAdmin = await createAdminClient();
  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(valid.data.code, {
    password: valid.data.password,
  });

  if (error) {
    return {
      success: false,
      errors: { db: [error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  const result = await login(data.user?.email || '', valid.data.password);

  if (result.error) {
    redirect('/auth/login');
  }

  redirect('/');
};
