'use server';

import { Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { createAdminClient, createClient } from '@/db/server';
import { Debug } from '@/lib/utils';
import { sendEmail } from '@/services/email';
import { APIResponse } from '@/types';
import { PaginationOptions } from '@/types/data-table';
import { tables } from 'packages/db';

export async function getUsers(pagination?: PaginationOptions) {
  return tables.select('users', undefined, pagination);
}

export async function getUser(id: string) {
  return tables.selectSingle('users', (query) => {
    query = query.eq('id', id);
  });
}

export async function getUserOptions(id: string) {
  return tables.selectSingle('user_options', (query) => {
    query = query.eq('id', id);
  });
}

export async function getCurrentUserView() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error.message;
    }

    return tables.selectSingle('user_view', (query) => {
      query = query.eq('id', data.user.id);
    });
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `select_current_user`,
      message: String(err),
      time: new Date(),
    });
  }
}

export async function updateUser(id: string, row: TablesUpdate<'users'>) {
  return tables.update('users', id, row);
}

export async function updateUserOptions(id: string, row: TablesUpdate<'user_options'>) {
  return tables.update('user_options', id, row);
}

export async function putUser(
  row: TablesInsert<'users'>,
  _sendEmail?: boolean
): Promise<APIResponse<Tables<'users'>>> {
  try {
    const supabaseAdmin = await createAdminClient();
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: row.email,
      email_confirm: true,
      app_metadata: {
        tenant_id: row.tenant_id,
        role_id: row.role_id,
      },
    });

    if (createError) {
      throw createError.message;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        ...row,
        id: createData.user.id,
      })
      .select()
      .single();

    if (error) {
      throw error.message;
    }

    if (_sendEmail) {
      const email = await sendEmail({
        to: row.email,
        subject: 'Login to MSP Byte!',
        html: `Click <a href="${process.env.NEXT_PUBLIC_ORIGIN}/auth/login">here</a> to access your account.`,
      });

      if (email.error) {
        throw email.error.message;
      }
    }

    return {
      ok: true,
      data: data as Tables<'users'>,
    };
  } catch (err) {
    return Debug.error({
      module: 'supabase',
      context: `insert_user`,
      message: String(err),
      time: new Date(),
    });
  }
}
