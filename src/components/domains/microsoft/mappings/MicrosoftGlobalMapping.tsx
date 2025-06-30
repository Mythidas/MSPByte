'use client';

import SourceMetricsAggregatedTable from '@/components/domains/metrics/tables/SourceMetricsAggregatedTable';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/common/routed/RouteTabsTrigger';
import SyncSourceItem from '@/components/domains/sources/SyncSourceItem';
import { Settings } from 'lucide-react';
import MicrosoftIdentitiesTab from '@/components/domains/microsoft/tabs/MicrosoftIdentitiesTab';

type Props = {
  sourceId: string;
  tab?: string;
};

export default function MicrosoftGlobalMapping({ sourceId, tab }: Props) {
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
            <SyncSourceItem type="global" sourceId={sourceId} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TabsContent value="dashboard">
        <div className="grid gap-4">
          <h2 className="font-bold text-xl">Quick Metrics</h2>
          <SourceMetricsAggregatedTable sourceId={sourceId} />
        </div>
      </TabsContent>
      <MicrosoftIdentitiesTab sourceId={sourceId} />
    </Tabs>
  );
}
