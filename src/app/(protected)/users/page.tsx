import RolesTable from '@/features/users/components/RolesTable';
import UsersTable from '@/features/users/components/UsersTable';
import { Tabs, TabsList } from '@/components/ui/tabs';
import { LazyTabContent } from '@/shared/components/LazyTabsContent';
import RouteTabsTrigger from '@/shared/components/secure/RouteTabsTrigger';

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
        <LazyTabContent value="users">
          <UsersTable />
        </LazyTabContent>
        <LazyTabContent value="roles">
          <RolesTable />
        </LazyTabContent>
      </Tabs>
    </div>
  );
}
