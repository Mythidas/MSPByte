'use server';

import { updateRow } from '@/db/orm';
import { Tables } from '@/db/schema';
import {
  checkInboxRules,
  resetUserMFA,
  resetUserPassword,
  revokeUserSessions,
} from '@/integrations/microsoft/services/security';
import { generatePassword } from '@/lib/utils';
import { getSourceTenant } from '@/services/source/tenants';

export default async function microsoft365EmailBreachResponse(
  feed: Tables<'activity_feeds'>,
  identities: Tables<'source_identities'>[]
) {
  if (!feed.site_id) return;
  const tenant = await getSourceTenant('microsoft-365', feed.site_id);
  if (!tenant.ok) return;

  // Revoke Sessions
  const revokeSessions = await Promise.all(
    identities.map(async (id) => await revokeUserSessions(tenant.data, id.external_id))
  );
  if (revokeSessions.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          steps: {
            ...(feed.metadata as any).steps,
            revoke_sessions: {
              status: 'completed',
            },
            reset_password: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (update.ok) feed = update.data;
  }

  // Reset Passwords
  const newPassword = generatePassword();
  const resetPasswords = await Promise.all(
    identities.map(async (id) => await resetUserPassword(tenant.data, id.external_id, newPassword))
  );
  if (resetPasswords.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          steps: {
            ...(feed.metadata as any).steps,
            reset_password: {
              status: 'completed',
              data: newPassword,
            },
            reset_mfa: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (update.ok) feed = update.data;
  }

  // Reset MFA
  const resetMFA = await Promise.all(
    identities.map(async (id) => await resetUserMFA(tenant.data, id.external_id))
  );
  if (resetMFA.every((session) => session.ok)) {
    const update = await updateRow('activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        metadata: {
          steps: {
            ...(feed.metadata as any).steps,
            reset_mfa: {
              status: 'completed',
            },
            check_inbox_rules: {
              status: 'in_progress',
            },
          },
        },
      },
    });
    if (update.ok) feed = update.data;
  }

  // Check Inbox Rules
  const checkRules = await Promise.all(
    identities.map(async (id) => await checkInboxRules(tenant.data, id.external_id))
  );
  if (checkRules.every((session) => session.ok)) {
    await updateRow('activity_feeds', {
      id: feed.id,
      row: {
        ...feed,
        updated_at: new Date().toISOString(),
        status: 'completed',
        metadata: {
          steps: {
            ...(feed.metadata as any).steps,
            check_inbox_rules: {
              status: 'completed',
              data: checkRules.map((rule) => (rule.ok ? rule.data : undefined)),
            },
          },
        },
      },
    });
  }
}
