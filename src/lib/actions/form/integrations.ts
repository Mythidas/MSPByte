'use server';

import { createClient } from '@/db/server';
import { microsoft365FormSchema, sophosPartnerFormSchema } from '@/lib/forms/sources';
import { redirect } from 'next/navigation';

export const invalidIntegrationAction = async (_prevState: any, params: FormData) => {
  return {
    success: false,
    message: 'Invalid action',
  };
};

export const microsoft365IntegrationAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const valid = microsoft365FormSchema.safeParse({
    id: params.get('id'),
    tenant_id: params.get('tenant_id'),
    source_id: params.get('source_id'),
    enabled: params.get('enabled') === 'on',
  });

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  if (!valid.data.enabled && valid.data.id) {
    const { error } = await supabase.from('source_integrations').delete().eq('id', valid.data.id);

    if (error) {
      return {
        success: false,
        values: Object.fromEntries(params.entries()),
        message: 'Source not enabled.',
      };
    }

    return {
      success: true,
      values: {},
    };
  }

  if (valid.data.id) {
    const { error } = await supabase
      .from('source_integrations')
      .update({
        source_id: valid.data.source_id,
        tenant_id: valid.data.tenant_id,
        config: {},
      })
      .eq('id', valid.data.id);

    if (error) {
      return {
        success: false,
        errors: { db: [error.message] },
        values: Object.fromEntries(params.entries()),
      };
    }
  } else {
    const { error } = await supabase.from('source_integrations').insert({
      source_id: valid.data.source_id,
      tenant_id: valid.data.tenant_id,
      config: {},
    });

    if (error) {
      return {
        success: false,
        errors: { db: [error.message] },
        values: Object.fromEntries(params.entries()),
      };
    }
  }

  return {
    success: true,
    values: {},
  };
};

export const sophosIntegrationAction = async (_prevState: any, params: FormData) => {
  const supabase = await createClient();
  const valid = sophosPartnerFormSchema.safeParse({
    id: params.get('id'),
    tenant_id: params.get('tenant_id'),
    source_id: params.get('source_id'),
    slug: params.get('slug'),
    client_id: params.get('client_id'),
    client_secret: params.get('client_secret'),
    enabled: params.get('enabled') === 'on',
  });

  if (valid.error) {
    return {
      success: false,
      errors: valid.error.flatten().fieldErrors,
      values: Object.fromEntries(params.entries()),
    };
  }

  if (!valid.data.enabled && valid.data.id) {
    const { error } = await supabase.from('source_integrations').delete().eq('id', valid.data.id);

    if (error) {
      return {
        success: false,
        values: Object.fromEntries(params.entries()),
        message: 'Source not enabled.',
      };
    }

    return redirect(`/integrations/${valid.data.slug}?tab=configuration`);
  }

  if (valid.data.id) {
    const { error } = await supabase
      .from('source_integrations')
      .update({
        source_id: valid.data.source_id,
        tenant_id: valid.data.tenant_id,
        config: {
          client_id: valid.data.client_id,
          client_secret: valid.data.client_secret,
        },
      })
      .eq('id', valid.data.id);

    if (error) {
      return {
        success: false,
        errors: { db: [error.message] },
        values: Object.fromEntries(params.entries()),
      };
    }
  } else {
    const { error } = await supabase.from('source_integrations').insert({
      source_id: valid.data.source_id,
      tenant_id: valid.data.tenant_id,
      config: {
        client_id: valid.data.client_id,
        client_secret: valid.data.client_secret,
      },
    });

    if (error) {
      return {
        success: false,
        errors: { db: [error.message] },
        values: Object.fromEntries(params.entries()),
      };
    }
  }

  return redirect(`/integrations/${valid.data.slug}?tab=configuration`);
};
