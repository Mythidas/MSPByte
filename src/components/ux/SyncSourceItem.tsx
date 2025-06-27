'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { syncSource } from '@/core/sync';
import { Tables } from '@/db/schema';
import { getSourceIntegration } from '@/services/integrations';
import { getSites } from '@/services/sites';
import { getSiteSourceMappings } from '@/services/siteSourceMappings';
import { toast } from 'sonner';

type Props = {
  type: 'global' | 'parent' | 'site';
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
};

export default function SyncSourceItem({ type, source, site }: Props) {
  const handleSync = async () => {
    try {
      const integration = await getSourceIntegration(undefined, source.id);
      if (!integration.ok) return;

      switch (type) {
        case 'global': {
          const mappings = await getSiteSourceMappings(integration.data.source_id);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(integration.data, [...mappings.data.map((s) => s.site_id)]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'parent': {
          const sites = await getSites(site!.id);
          if (!sites.ok) {
            throw new Error(sites.error.message);
          }

          const mappings = await getSiteSourceMappings(integration.data.source_id, [
            ...sites.data.map((s) => s.id),
          ]);
          if (!mappings.ok) {
            throw new Error(mappings.error.message);
          }

          const jobs = await syncSource(integration.data, [...mappings.data.map((s) => s.site_id)]);
          if (!jobs.ok) {
            throw new Error(jobs.error.message);
          }

          toast.info(`Syncing ${jobs.data.length} jobs...`);
          break;
        }
        case 'site': {
          const jobs = await syncSource(integration.data, [site!.id]);
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

  return <DropdownMenuItem onClick={handleSync}>Sync Now</DropdownMenuItem>;
}
