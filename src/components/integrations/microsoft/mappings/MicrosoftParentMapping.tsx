'use client';

import MicrosoftIdentitiesTab from '@/components/integrations/microsoft/tabs/MicrosoftIdentitiesTab';
import SourceMetricsAggregatedGroupedTable from '@/components/tables/SourceMetricsAggregatedGroupedTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/ux/RouteTabsTrigger';
import SyncSourceItem from '@/components/ux/SyncSourceItem';
import { Tables } from '@/db/schema';
import { Settings } from 'lucide-react';

type Props = {
  sourceId: string;
  site: Tables<'sites'>;
  tab?: string;
};

export default function MicrosoftParentMapping({ sourceId, site, tab }: Props) {
  return (
    <Tabs defaultValue={tab || 'dashboard'} value={tab || 'dashboard'}>
      <div className="flex size-full justify-between">
        <TabsList>
          <RouteTabsTrigger value="dashboard">Dashboard</RouteTabsTrigger>
          <RouteTabsTrigger value="identities">Identities</RouteTabsTrigger>
        </TabsList>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <SyncSourceItem type="parent" sourceId={sourceId} site={site} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TabsContent value="dashboard">
        <SourceMetricsAggregatedGroupedTable sourceId={sourceId} parentId={site!.id} />
      </TabsContent>
      <MicrosoftIdentitiesTab sourceId={sourceId} siteId={site.id} />
    </Tabs>
  );
}
