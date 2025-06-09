import ClientsTable from "@/components/tables/ClientsTable";
import { getClients } from "@/lib/functions/clients";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}