'use client'

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getIntegration } from "@/lib/actions/server/integrations";
import { getSites } from "@/lib/actions/server/sites";
import { syncSource } from "@/lib/actions/server/sources";
import { Tables } from "@/types/database";

type Props = {
  type: 'global' | 'parent' | 'site';
  source: Tables<'sources'>;
  site?: Tables<'sites'>;
}

export default function SyncSourceItem({ type, source, site }: Props) {
  const handleSync = async () => {
    const integration = await getIntegration(undefined, source.id);
    if (!integration.ok) return;

    switch (type) {
      case 'global': {
        syncSource(integration.data);
        break;
      }
      case 'parent': {
        const sites = await getSites(site!.id);
        if (!sites.ok) break;

        syncSource(integration.data, [...sites.data.map((s) => s.id)]);
        break;
      }
      case 'site': {
        syncSource(integration.data, [site!.id]);
        break;
      }
    }
  }

  return (
    <DropdownMenuItem onClick={handleSync}>
      Sync Now
    </DropdownMenuItem>
  );
}