import RolesTable from '@/components/domain/users/RolesTable';
import UsersTable from '@/components/domain/users/UsersTable';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import RouteTabsTrigger from '@/components/shared/secure/RouteTabsTrigger';

type Props = {
  searchParams: Promise<{ tab: string }>;
};

export default async function UsersPage(props: Props) {
  const searchParams = await props.searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users & Roles</h1>
      </div>

      <Tabs defaultValue={searchParams.tab || 'users'} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <RouteTabsTrigger value="users">Users</RouteTabsTrigger>
          <RouteTabsTrigger value="roles">Roles</RouteTabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
        <TabsContent value="roles">
          <RolesTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
