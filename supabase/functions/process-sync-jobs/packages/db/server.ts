'use server';

import { getAuthToken } from '../../utils.ts';
import { Database } from './schema.ts';
import { createClient as _createClient } from 'jsr:@supabase/supabase-js@2';

export const createClient = () => {
  return _createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: getAuthToken() || '',
        },
      },
    }
  );
};
