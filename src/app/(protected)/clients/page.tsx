import ClientsTable from "@/components/tables/ClientsTable";
import { getClients } from "@/lib/actions/server/clients";

export default async function ClientsPage() {
  const clients = await getClients();

  if (!clients.ok) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        </div>

        <span>
          Failed to fetch clients
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
      </div>

      <ClientsTable clients={clients.data} />
    </div>
  );
}