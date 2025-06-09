import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { createSiteAction } from "@/lib/actions/clients";
import { getClient } from "@/lib/functions/clients";
import SiteForm from "@/components/forms/SiteForm";

type Props = {
  params: Promise<{ id: string }>;
}

export default async function CreateClient(props: Props) {
  const params = await props.params;
  const client = await getClient(params.id);

  if (!client) {
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
          <BreadcrumbLink href={`/clients/${client.id}`}>{client.name}</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Create Site</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Enter the details for the new site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SiteForm
            site={{
              id: "",
              client_id: client.id,
              tenant_id: client.tenant_id,
              name: ""
            }}
            footer={{
              submit_text: "Create Site",
              pending_text: "Creating site...",
              cancel_route: `/clients/${client.id}`
            }}
            action={createSiteAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}