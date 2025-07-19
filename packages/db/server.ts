'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient as _createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getBearerToken } from '@/db/context';
import { Database } from '@/db/schema';

export const createClient = async (bearer?: string) => {
  const cookieStore = await cookies();
  const token = bearer || getBearerToken();
  const global = !token
    ? undefined
    : {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      global,
    }
  );
};

export const createAdminClient = async () => {
  return _createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_SERVICE_KEY!
  );
};
