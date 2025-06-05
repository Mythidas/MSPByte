import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getRoles } from "@/lib/functions/roles";
import { createInviteAction } from "@/lib/actions/users";
import { getTenant } from "@/lib/functions/tenants";
import UserForm from "@/components/forms/UserForm";

export default async function CreateUser() {
  const roles = await getRoles();
  const tenant = await getTenant();

  if (!roles || !tenant) {
    return (
      <Card>
        <CardHeader>
          Failed to fetch data. Contact Support.
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbLink href="/users">Users</BreadcrumbLink>
          <BreadcrumbSeparator />
          <BreadcrumbPage>Create User</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            user={{
              id: "",
              role_id: "",
              name: "",
              tenant_id: tenant.id,
              email: "",
              last_login: ""
            }}
            roles={roles}
            footer={{
              submit_text: "Create User",
              pending_text: "Creating User...",
              cancel_route: `/users`
            }}
            action={createInviteAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}