'use server';

import { createAdminClient, createClient } from '@/db/server';
import { Debug } from '@/lib/utils';
import { updateUser } from '@/services/users';
import { APIResponse } from '@/types';
import { redirect } from 'next/navigation';

export async function login(email: string, password: string): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    await updateUser(data.user.id, {
      last_login: new Date().toISOString(),
    });

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'auth',
      context: 'login',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function logout(): Promise<APIResponse<null>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'auth',
      context: 'login',
      message: String(err),
      time: new Date(),
    });
  }
}

export async function register(code: string, password: string): Promise<APIResponse<null>> {
  try {
    const supabaseAdmin = await createAdminClient();
    const user = await supabaseAdmin.from('users').select().eq('id', code).single();
    if (user.data) {
      if (user.data.status !== 'pending') {
        return Debug.error({
          module: 'auth',
          context: 'register',
          message: 'User invalid or already registered',
          time: new Date(),
        });
      }
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(code, {
      password: password,
    });

    if (error) {
      throw new Error(error.message);
    }

    await supabaseAdmin
      .from('users')
      .update({
        status: 'active',
      })
      .eq('id', code);
    const result = await login(data.user?.email || '', password);

    if (!result.ok) {
      redirect('/auth/login');
    }

    return {
      ok: true,
      data: null,
    };
  } catch (err) {
    return Debug.error({
      module: 'auth',
      context: 'register',
      message: String(err),
      time: new Date(),
    });
  }
}
