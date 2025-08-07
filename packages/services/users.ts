'use server';

import { Tables, TablesInsert, TablesUpdate } from '@/db/schema';
import { createAdminClient, createClient } from '@/db/server';
import { Debug } from '@/lib/utils';
import { sendEmail } from '@/services/email';
import { APIResponse } from '@/types';
import { PaginationOptions } from '@/types/db';
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
        html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2d7ff9;">Welcome to MSP Byte!</h2>
    <p>Hi there,</p>
    <p>Your account has been created. Click the button below to access your dashboard and get started:</p>

    <p style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_ORIGIN}/auth/login" style="background-color: #2d7ff9; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Log In to Your Account
      </a>
    </p>

    <p>If the button doesn't work, you can also copy and paste this URL into your browser:</p>
    <p style="word-break: break-all; color: #555;">
      <a href="${process.env.NEXT_PUBLIC_ORIGIN}/auth/login" style="color: #2d7ff9;">${process.env.NEXT_PUBLIC_ORIGIN}/auth/login</a>
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0;" />

    <p style="font-size: 0.9em; color: #888;">If you didn’t request this, you can safely ignore this email.</p>
    <p style="font-size: 0.9em; color: #888;">&copy; ${new Date().getFullYear()} MSP Byte</p>
  </div>
`,
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
