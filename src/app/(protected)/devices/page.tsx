import SophosDevicesTab from "@/components/tabs/SophosDevicesTab";
import { Tabs, TabsList } from "@/components/ui/tabs";
import ErrorDisplay from "@/components/ux/ErrorDisplay";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";
import { getIntegrationsView } from "@/lib/actions/server/integrations";
import { Tables } from "@/types/database";

type Props = {
  searchParams: Promise<{ tab: string, search: string }>;
}

export default async function DevicesPage({ ...props }: Props) {
  const searchParams = await props.searchParams;
  const integrations = await getIntegrationsView();

  if (!integrations.ok) {
    return <ErrorDisplay message="Failed to fetch data" />
  }

  const getDefaultTab = () => {
    return integrations.data.length > 0 ? integrations.data[0].source_slug : null;
  }

  function getTabContent(integration: Tables<'source_integrations_view'>) {
    switch (integration?.source_slug) {
      case 'sophos-partner':
        return <SophosDevicesTab
          key={integration.source_slug}
          search={searchParams.search}
          sourceId={integration.source_id!}
          tabValue={integration.source_slug!}
        />;
      default: return null;
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
      </div>

      <Tabs defaultValue={getDefaultTab() || ''}>
        <TabsList>
          {integrations.data.map((item) =>
            <RouteTabsTrigger key={item.id} value={item.source_slug!}>{item.source_name}</RouteTabsTrigger>
          )}
        </TabsList>
        {integrations.data.map((item) => {
          return getTabContent(item)
        })}
      </Tabs>
    </>
  );
}