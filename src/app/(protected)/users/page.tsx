import InvitesTable from "@/components/tables/InvitesTable";
import RolesTable from "@/components/tables/RolesTable";
import UsersTable from "@/components/tables/UsersTable";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import RouteTabsTrigger from "@/components/ux/RouteTabsTrigger";

type Props = {
  searchParams: Promise<{ tab: string }>;
}

export default async function UsersPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
      </div>

      <Tabs defaultValue={searchParams.tab || "users"} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <RouteTabsTrigger value="users">Users</RouteTabsTrigger>
          <RouteTabsTrigger value="roles">Roles</RouteTabsTrigger>
          <RouteTabsTrigger value="invites">Invites</RouteTabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTable />
        </TabsContent>
        <TabsContent value="invites">
          <InvitesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}