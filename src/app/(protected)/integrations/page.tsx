import IntegrationsTable from '@/components/domain/sources/IntegrationsTable';

export default async function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
      </div>

      <IntegrationsTable />
    </div>
  );
}
