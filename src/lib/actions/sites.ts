'use server';

import { siteFormSchema } from '@/lib/forms/sites';
import { putSite } from '@/services/sites';

export const createSiteAction = async (_prevState: unknown, params: FormData) => {
  const validation = siteFormSchema.safeParse({
    id: params.get('id'),
    parent_id: params.get('parent_id') || undefined,
    tenant_id: params.get('tenant_id'),
    name: params.get('name'),
    is_parent: params.get('is_parent') === 'on',
  });

  if (validation.error) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  const result = await putSite({
    id: validation.data.id || '',
    tenant_id: validation.data.tenant_id,
    parent_id: validation.data.parent_id || null,
    name: validation.data.name,
    is_parent: validation.data.is_parent,
  });

  if (!result.ok) {
    return {
      success: false,
      errors: { db: [result.error.message] },
      values: Object.fromEntries(params.entries()),
    };
  }

  return {
    success: true,
    values: Object.fromEntries(Object.entries(result.data)),
  };
};
