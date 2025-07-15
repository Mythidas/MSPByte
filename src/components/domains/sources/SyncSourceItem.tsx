'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { syncSource } from '@/core/syncSource';
import { getSites } from '@/services/sites';
import { getSourceTenant, getSourceTenants } from '@/services/source/tenants';
import { toast } from 'sonner';

type Props = {
  type: 'global' | 'parent' | 'site';
  sourceId: string;
  tenantId: string;
  siteId?: string;
  button?: boolean;
};

export default function SyncSourceItem({ type, sourceId, tenantId, siteId, button }: Props) {
  const handleSync = async () => {
    try {
      switch (type) {
        case 'global': {
          const mappings = await getSourceTenants(sourceId);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(sourceId, tenantId, [
            ...mappings.data.rows.map((s) => {
              return { siteId: s.site_id, sourceTenantId: s.id };
            }),
          ]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'parent': {
          if (!siteId) return;

          const sites = await getSites(siteId);
          if (!sites.ok) {
            throw new Error(sites.error.message);
          }

          const mappings = await getSourceTenants(sourceId, [
            siteId!,
            ...sites.data.rows.map((s) => s.id),
          ]);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(sourceId, tenantId, [
            ...mappings.data.rows.map((s) => {
              return { siteId: s.site_id, sourceTenantId: s.id };
            }),
          ]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'site': {
          if (!siteId) return;

          const mappings = await getSourceTenant(sourceId, siteId);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(sourceId, tenantId, [
            { siteId, sourceTenantId: mappings.data.id },
          ]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
      }
    } catch (err) {
      toast.error(`Failed to sync: ${err}`);
    }
  };

  if (button)
    return (
      <Button variant="secondary" onClick={handleSync}>
        Sync Now
      </Button>
    );
  return <DropdownMenuItem onClick={handleSync}>Sync Now</DropdownMenuItem>;
}
