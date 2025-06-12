import SophosDevicesTab from "@/components/tabs/SophosDevicesTab";
import { Tabs, TabsList } from "@/components/ui/tabs";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { getIntegrations, getSources } from "@/lib/functions/sources";
import { Tables } from "@/types/database";

type Props = {
  searchParams: Promise<{ tab: string, search: string }>;
}

export default async function DevicesPage({ ...props }: Props) {
  const searchParams = await props.searchParams;
  const integrations = await getIntegrations();

  function getDefaultTab() {
    return integrations.length > 0 ? integrations[0].source_slug : null;
  }

  function getTabContent(integration: Tables<'source_integrations_view'>) {
    switch (integration?.source_slug) {
      case 'sophos-partner':
        return <SophosDevicesTab key={integration.source_slug} search={searchParams.search} integration={integration} />;
      default: return null;
    }
  }

  return (
    <div className="flex flex-col relateive size-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
      </div>

      <Tabs defaultValue={getDefaultTab() || ''}>
        <TabsList>
          {integrations.map((item) =>
            <RouteTabsTrigger key={item.id} value={item.source_slug!}>{item.source_name}</RouteTabsTrigger>
          )}
        </TabsList>
        {integrations.map((item) => {
          return getTabContent(item)
        })}
      </Tabs>
    </div>
  );
}