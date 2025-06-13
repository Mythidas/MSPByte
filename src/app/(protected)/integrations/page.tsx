import IntegrationsTable from "@/components/tables/IntegrationsTable";
import { getIntegrations } from "@/lib/actions/server/integrations";
import { getSources } from "@/lib/actions/server/sources";

export default async function IntegrationsPage() {
  const sources = await getSources();
  const integrations = await getIntegrations();

  if (!sources.ok || !integrations.ok) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        </div>

        <span>Failed to fetch data</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
      </div>

      <IntegrationsTable sources={sources.data} integrations={integrations.data} />
    </div>
  );
}