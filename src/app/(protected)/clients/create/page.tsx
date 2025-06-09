import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getTenant } from "@/lib/functions/tenants";
import ClientForm from "@/components/forms/ClientForm";
import { createClientAction } from "@/lib/actions/clients";

export default async function CreateClient() {
  const tenant = await getTenant();
  if (!tenant) {
    return (
      <Card>
        Failed to fetch data. Contact support.
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Create Client</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>
            Enter the details for the new client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm
            client={{
              id: "",
              tenant_id: tenant?.id,
              name: ""
            }}
            footer={{
              submit_text: "Create Client",
              pending_text: "Creating Client...",
              cancel_route: `/clients`
            }}
            action={createClientAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}