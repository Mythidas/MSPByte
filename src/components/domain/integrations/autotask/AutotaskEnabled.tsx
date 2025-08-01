import { LazyTabContent } from '@/components/shared/LazyTabsContent';
import RouteTabsTrigger from '@/components/shared/secure/RouteTabsTrigger';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { Tables } from '@/db/schema';

type Props = {
  source: Tables<'sources'>;
  integration: Tables<'source_integrations'>;
};

export default function AutotaskEnabled({}: Props) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <RouteTabsTrigger value="overview">Overview</RouteTabsTrigger>
      </TabsList>

      <LazyTabContent value="overview"></LazyTabContent>
    </Tabs>
  );
}
