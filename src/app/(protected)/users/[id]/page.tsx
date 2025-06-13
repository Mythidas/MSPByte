import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { getRoles } from "@/lib/actions/server/roles";
import { editUserAction } from "@/lib/actions/form/users";
import UserForm from "@/components/forms/UserForm";
import { getUser } from "@/lib/actions/server/users";

type Props = {
  params: Promise<{ id: string }>;
}

export default async function CreateUser(props: Props) {
  const params = await props.params;
  const roles = await getRoles();
  const user = await getUser(params.id);

  if (!roles.ok || !user.ok) {
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
          <BreadcrumbPage>Edit User</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Edit the details for the user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            user={user.data}
            roles={roles.data}
            footer={{
              submit_text: "Edit User",
              pending_text: "Saving User...",
              cancel_route: `/users`
            }}
            action={editUserAction}
          />
        </CardContent>
      </Card>
    </div>
  );
}