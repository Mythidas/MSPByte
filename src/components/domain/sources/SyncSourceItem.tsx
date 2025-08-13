'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { syncSource } from '@/core/syncSource';
import { toast } from 'sonner';
import { RotateCw } from 'lucide-react';
import { getRow, getRows } from '@/db/orm';

type Props = {
  type: 'global' | 'parent' | 'site' | 'group';
  sourceId: string;
  tenantId: string;
  siteId?: string;
  groupId?: string;
  children?: React.ReactNode;
  syncing?: boolean;
  onStart?: () => void;
} & Omit<React.ComponentProps<typeof Button>, 'type' | 'onClick' | 'children'>;

export default function SyncSourceItem({
  type,
  sourceId,
  tenantId,
  siteId,
  groupId,
  children,
  onStart,
  ...props
}: Props) {
  const [isSyncing, setIsSyncing] = useState(props.syncing);

  const handleSync = async () => {
    setIsSyncing(true);
    onStart?.();

    try {
      switch (type) {
        case 'group': {
          const memberships = await getRows('public', 'site_group_memberships', {
            filters: [['group_id', 'eq', groupId]],
          });
          if (memberships.error) throw memberships.error.message;

          const tenants = await getRows('source', 'tenants', {
            filters: [
              ['source_id', 'eq', sourceId],
              ['site_id', 'in', memberships.data.rows.map((m) => m.site_id)],
            ],
          });
          if (tenants.error) throw tenants.error.message;

          const jobs = await syncSource(
            sourceId,
            tenantId,
            tenants.data.rows.map((s) => ({
              siteId: s.site_id,
              sourceTenantId: s.id,
            }))
          );

          if (jobs.error) throw new Error(jobs.error.message);

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'global': {
          const mappings = await getRows('source', 'tenants', {
            filters: [['source_id', 'eq', sourceId]],
          });
          if (mappings.error) throw new Error(mappings.error.message);

          const jobs = await syncSource(
            sourceId,
            tenantId,
            mappings.data.rows.map((s) => ({
              siteId: s.site_id,
              sourceTenantId: s.id,
            }))
          );
          if (jobs.error) throw new Error(jobs.error.message);

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'parent': {
          if (siteId) return;

          const sites = await getRows('public', 'sites', {
            filters: [['parent_id', 'eq', siteId]],
          });
          if (sites.error) throw new Error(sites.error.message);

          const siteIds = [siteId, ...sites.data.rows.map((s) => s.id)];
          const mappings = await getRows('source', 'tenants', {
            filters: [
              ['source_id', 'eq', sourceId],
              ['site_id', 'in', siteIds],
            ],
          });
          if (mappings.error) throw new Error(mappings.error.message);

          const jobs = await syncSource(
            sourceId,
            tenantId,
            mappings.data.rows.map((s) => ({
              siteId: s.site_id,
              sourceTenantId: s.id,
            }))
          );
          if (jobs.error) throw new Error(jobs.error.message);

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'site': {
          if (!siteId) return;

          const mapping = await getRow('source', 'tenants', {
            filters: [
              ['source_id', 'eq', sourceId],
              ['site_id', 'eq', siteId],
            ],
          });
          if (mapping.error) throw new Error(mapping.error.message);

          const jobs = await syncSource(sourceId, tenantId, [
            {
              siteId,
              sourceTenantId: mapping.data.id,
            },
          ]);
          if (jobs.error) throw new Error(jobs.error.message);

          toast.info(`Syncing ${jobs.data.length} job...`);
          break;
        }
      }
    } catch (err) {
      toast.error(`Failed to sync: ${String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={isSyncing} variant="secondary" {...props}>
      {children || (
        <>
          <RotateCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> Sync Now
        </>
      )}
    </Button>
  );
}
