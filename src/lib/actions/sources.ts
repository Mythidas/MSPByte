'use server';

import { createClient } from '@/db/server';
import { deleteFormSchema } from '@/lib/forms';
import { redirect } from 'next/navigation';

export const deleteSiteSourceMapping = async (_prevState: unknown, params: FormData) => {
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

  const { error } = await supabase
    .schema('source')
    .from('tenants')
    .delete()
    .eq('id', validation.data.id);

  if (error) {
    return {
      success: false,
      errors: { db: [error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  if (validation.data.url) return redirect(validation.data.url);
  else return { success: true };
};
